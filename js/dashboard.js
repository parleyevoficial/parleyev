const tablaBody = document.getElementById('tabla-pronosticos');
const welcomeText = document.getElementById('user-welcome');

// Función para obtener el icono según el deporte
const obtenerIconoDeporte = (deporte) => {
    const d = deporte.toLowerCase();
    if (d.includes('fútbol') || d.includes('futbol')) return 'fa-futbol';
    if (d.includes('nba') || d.includes('basketball') || d.includes('baloncesto')) return 'fa-basketball';
    if (d.includes('beisbol') || d.includes('baseball')) return 'fa-baseball-bat-ball';
    if (d.includes('tenis') || d.includes('tennis')) return 'fa-table-tennis-paddle-ball';
    if (d.includes('nfl') || d.includes('fútbol americano')) return 'fa-football';
    return 'fa-circle-info'; // Icono por defecto
};

const cargarPronosticos = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // 1. Obtener el estatus VIP del usuario actual
    const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('es_vip')
        .eq('id', user.id)
        .single();

    const usuarioEsVip = perfil ? perfil.es_vip : false;

    // 2. Definir la consulta de partidos con la condicional que mencionas
    let query = supabaseClient.from('partidos').select('*');

    // SI NO ES VIP: Solo cargamos los datos donde es_vip sea FALSE
    if (!usuarioEsVip) {
        query = query.eq('es_vip', false);
    }

    // Ejecutar la consulta con el ordenamiento que ya tenías
    let { data: partidos, error: errorPartidos } = await query.order('created_at', { ascending: false });

    // 3. Traer la biblioteca de logos (esto se mantiene igual)
    let { data: bibliotecaLogos, error: errorLogos } = await supabaseClient
        .from('logos')
        .select('*');

    if (errorPartidos || errorLogos) {
        console.error("Error al obtener datos");
        return;
    }

    tablaBody.innerHTML = ''; 

    // El resto de tu código de impresión (forEach) se mantiene EXACTAMENTE IGUAL
    partidos.forEach(partido => {
        const encontradoLocal = bibliotecaLogos.find(l => l.nom_equipo === partido.url_equipo_local);
        const encontradoVisitante = bibliotecaLogos.find(l => l.nom_equipo === partido.url_equipo_visitante);
        const imgL = encontradoLocal ? encontradoLocal.link_logo : 'https://img.icons8.com/color/48/shield.png';
        const imgV = encontradoVisitante ? encontradoVisitante.link_logo : 'https://img.icons8.com/color/48/shield.png';
        const iconoDeporte = obtenerIconoDeporte(partido.deporte);
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>
                <div class="evento-celda">
                    <div class="equipo-info">
                        <img src="${imgL}" class="logo-equipo" referrerpolicy="no-referrer">
                        <span>${partido.equipo_local}</span>
                    </div>
                    <span class="vs-text">VS</span>
                    <div class="equipo-info">
                        <img src="${imgV}" class="logo-equipo" referrerpolicy="no-referrer">
                        <span>${partido.equipo_visitante}</span>
                    </div>
                </div>
            </td>
            <td>
                <i class="fa-solid ${iconoDeporte}"></i> ${partido.deporte}
                <p class="liga-texto">${partido.liga}</p>
            </td>
            <td>
                <strong>${partido.pronostico}</strong>
                ${partido.es_vip ? '<span class="badge-vip">💎 VIP</span>' : ''}
            </td>
        `;
        tablaBody.appendChild(fila);
    });
};

document.addEventListener('DOMContentLoaded', cargarPronosticos);

// Configuración del botón de pago VIP
const btnVip = document.getElementById('btn-vip-action');

if (btnVip) {
    btnVip.addEventListener('click', async () => {
        // 1. Obtener el usuario autenticado
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert("Debes iniciar sesión para adquirir el plan VIP.");
            return;
        }

        try {
            // 2. Actualizar el campo 'estado_pago' en la tabla 'perfiles'
            // Usamos el ID de Auth para encontrar su perfil vinculado
            const { error } = await supabaseClient
                .from('perfiles') 
                .update({ 
                    estado_pago: 'Pagando',
                    email: user.email // Aseguramos que el email esté para tu comparación
                })
                .eq('id', user.id);

            if (error) throw error;

            console.log(`Usuario ${user.email} marcado como 'Pagando' en tabla perfiles`);

            // 3. Redirigir al link de pago de Cryptomus
            const urlPagoCryptomus = "https://pay.oxapay.com/13612355";
            window.open(urlPagoCryptomus, '_blank');

        } catch (err) {
            console.error("Error al procesar solicitud VIP:", err);
            alert("Hubo un error al conectar con el sistema de pagos.");
        }
    });
}