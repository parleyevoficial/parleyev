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

    // 1. Traer los partidos
    let { data: partidos, error: errorPartidos } = await supabaseClient
        .from('partidos')
        .select('*');

    // 2. Traer TODA tu biblioteca de logos para comparar
    let { data: bibliotecaLogos } = await supabaseClient
        .from('logos')
        .select('*');

    if (errorPartidos) return;

    tablaBody.innerHTML = '';

    partidos.forEach(partido => {
        // Buscamos el logo en nuestra tabla 'logos' localmente para que sea más rápido
        const logoLocal = bibliotecaLogos.find(l => l.nom_equipo === partido.url_equipo_local)?.link_logo;
        const logoVisitante = bibliotecaLogos.find(l => l.nom_equipo === partido.url_equipo_visitante)?.link_logo;

        const iconoDeporte = obtenerIconoDeporte(partido.deporte);
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>
                <div class="evento-celda">
                    <div class="equipo-info">
                        <img src="${logoLocal || 'https://img.icons8.com/color/48/shield.png'}" class="logo-equipo">
                        <span>${partido.equipo_local}</span>
                    </div>
                    <span class="vs-text">VS</span>
                    <div class="equipo-info">
                        <img src="${logoVisitante || 'https://img.icons8.com/color/48/shield.png'}" class="logo-equipo">
                        <span>${partido.equipo_visitante}</span>
                    </div>
                </div>
                
            </td>
            <td><i class="fa-solid ${iconoDeporte}"></i> ${partido.deporte}<br><p class="liga-texto">${partido.liga}</p></td>
            <td><strong>${partido.pronostico}</strong></td>
            
        `;
        tablaBody.appendChild(fila);
    });
};

document.addEventListener('DOMContentLoaded', cargarPronosticos);