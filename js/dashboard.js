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

    // 1. Traer los partidos de la tabla 'partidos'
    let { data: partidos, error: errorPartidos } = await supabaseClient
        .from('partidos')
        .select('*')
        .order('created_at', { ascending: false });

    // 2. Traer la biblioteca de la tabla 'logos'
    let { data: bibliotecaLogos, error: errorLogos } = await supabaseClient
        .from('logos')
        .select('*');

    if (errorPartidos || errorLogos) {
        console.error("Error al obtener datos de Supabase");
        return;
    }

    tablaBody.innerHTML = ''; 

    partidos.forEach(partido => {
        // RECLUTAMIENTO DIRECTO: Compara el texto de 'partidos' con 'nom_equipo' de 'logos'
        const encontradoLocal = bibliotecaLogos.find(l => l.nom_equipo === partido.url_equipo_local);
        const encontradoVisitante = bibliotecaLogos.find(l => l.nom_equipo === partido.url_equipo_visitante);

        // Si hay coincidencia exacta, extrae 'link_logo', de lo contrario usa el escudo base
        const imgL = encontradoLocal ? encontradoLocal.link_logo : 'https://img.icons8.com/color/48/shield.png';
        const imgV = encontradoVisitante ? encontradoVisitante.link_logo : 'https://img.icons8.com/color/48/shield.png';

        const iconoDeporte = obtenerIconoDeporte(partido.deporte);
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>
                <div class="evento-celda">
                    <div class="equipo-info">
                        <img src="${imgL}" class="logo-equipo" onerror="this.src='https://img.icons8.com/color/48/shield.png'">
                        <span>${partido.equipo_local}</span>
                    </div>
                    <span class="vs-text">VS</span>
                    <div class="equipo-info">
                        <img src="${imgV}" class="logo-equipo" onerror="this.src='https://img.icons8.com/color/48/shield.png'">
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