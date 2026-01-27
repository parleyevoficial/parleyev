// 1. CONFIGURACIÓN DE CONEXIÓN
const SB_URL = "https://kjyhvidjikfoezjvpvpw.supabase.co"; 
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWh2aWRqaWtmb2V6anZwdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTg3NDYsImV4cCI6MjA4NTA5NDc0Nn0.xG4j1nOwthdC71Tol_-FrTklCVUnt5kxjF9YrU8afuE";

// CORRECCIÓN: Usamos supabaseClient para que no choque con la librería global
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

// 2. SEGURIDAD: TU CORREO DE ADMINISTRADOR
// Asegúrate de poner aquí tu correo real para poder publicar
const ADMIN_EMAIL = "parleyevoficial@gmail.com";

const btnPublicar = document.getElementById('btn-publicar');

// Función para verificar que solo tú entres aquí
const verificarAdmin = async () => {
    // Usamos supabaseClient aquí
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user || user.email !== ADMIN_EMAIL) {
        alert("Acceso denegado. Redirigiendo al inicio...");
        window.location.href = "index.html";
    }
};

// 3. FUNCIÓN PARA PUBLICAR EL PARTIDO
btnPublicar.addEventListener('click', async () => {
    const deporte = document.getElementById('deporte').value;
    const liga = document.getElementById('liga').value;
    const equipo_local = document.getElementById('local').value;
    const equipo_visitante = document.getElementById('visitante').value;
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
                    pronostico: pronostico, 
                    es_vip: es_vip 
                }
            ]);

        if (error) throw error;

        alert("✅ ¡Pronóstico publicado con éxito!");
        
        // Limpiar formulario
        document.getElementById('local').value = "";
        document.getElementById('visitante').value = "";
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