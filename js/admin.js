// 1. CONFIGURACIÓN DE CONEXIÓN
const SB_URL = "https://kjyhvidjikfoezjvpvpw.supabase.co"; 
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWh2aWRqaWtmb2V6anZwdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTg3NDYsImV4cCI6MjA4NTA5NDc0Nn0.xG4j1nOwthdC71Tol_-FrTklCVUnt5kxjF9YrU8afuE";

// CORRECCIÓN: Usamos supabaseClient para que no choque con la librería global
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

const btnPublicar = document.getElementById('btn-publicar');

// Función para verificar que realmente eres el administrador
const verificarAdmin = async () => {
    // Obtenemos el usuario logueado
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
        window.location.href = "index.html";
        return;
    }

    // Buscamos en la base de datos si su ID tiene permiso true
    const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('es_admin')
        .eq('id', user.id)
        .single();

    if (!perfil || perfil.es_admin !== true) {
        alert("Acceso denegado. No eres administrador.");
        window.location.href = "dashboard.html";
    }
};

// 3. FUNCIÓN PARA PUBLICAR EL PARTIDO
btnPublicar.addEventListener('click', async () => {
    const deporte = document.getElementById('deporte').value;
    const liga = document.getElementById('liga').value;
    const equipo_local = document.getElementById('local').value;
    const equipo_visitante = document.getElementById('visitante').value;
    const url_equipo_local = document.getElementById('url_local').value;
    const url_equipo_visitante = document.getElementById('url_visitante').value;
    const pronostico = document.getElementById('pronostico').value;
    const es_vip = document.getElementById('es_vip').checked;

    if (!equipo_local || !equipo_visitante || !pronostico) {
        alert("Por favor, rellena los nombres de los equipos y el pronóstico.");
        return;
    }

    btnPublicar.disabled = true;
    btnPublicar.innerText = "Publicando...";

    try {
        // CORRECCIÓN: Cambiado de 'supabase' a 'supabaseClient'
        const { data, error } = await supabaseClient
            .from('partidos')
            .insert([
                { 
                    deporte: deporte, 
                    liga: liga, 
                    equipo_local: equipo_local, 
                    equipo_visitante: equipo_visitante, 
                    url_equipo_local: url_equipo_local, // Enviando URL local
                    url_equipo_visitante: url_equipo_visitante, // Enviando URL visitante
                    pronostico: pronostico, 
                    es_vip: es_vip 
                }
            ]);

        if (error) throw error;

        alert("✅ ¡Pronóstico publicado con éxito!");
        
        cargarListaGestion();

        // Limpiar formulario
        document.getElementById('local').value = "";
        document.getElementById('visitante').value = "";
        document.getElementById('url_local').value = "";
        document.getElementById('url_visitante').value = "";
        document.getElementById('pronostico').value = "";
        document.getElementById('es_vip').checked = false;

    } catch (error) {
        alert("Error al publicar: " + error.message);
        console.error("Error detallado:", error);
    } finally {
        btnPublicar.disabled = false;
        btnPublicar.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> PUBLICAR AHORA';
    }
});

verificarAdmin();

// --- LÓGICA PARA GESTIONAR Y ELIMINAR PARTIDOS ---

const listaGestion = document.getElementById('lista-gestion');

// Función para cargar la lista de partidos en el panel admin
const cargarListaGestion = async () => {
    const { data: partidos, error } = await supabaseClient
        .from('partidos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return;

    listaGestion.innerHTML = '';

    partidos.forEach(partido => {
        const item = document.createElement('div');
        item.className = 'gestion-item';
        item.innerHTML = `
            <div class="gestion-info">
                <strong>${partido.equipo_local} vs ${partido.equipo_visitante}</strong>
                <span>${partido.deporte} - ${partido.liga}</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarPartido('${partido.id}')">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        listaGestion.appendChild(item);
    });
};

// Función para eliminar el partido
window.eliminarPartido = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este pronóstico?")) {
        const { error } = await supabaseClient
            .from('partidos')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error al eliminar");
        } else {
            cargarListaGestion(); // Recargar la lista
        }
    }
};

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarListaGestion);

// Opcional: Actualizar la lista después de publicar uno nuevo
// Solo tienes que agregar cargarListaGestion(); dentro del bloque 'try' de tu botón publicar