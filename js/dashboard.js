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
    // 1. Usar supabaseClient (definido en auth.js)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
        window.location.href = "index.html";
        return;
    }

    welcomeText.innerText = `Bienvenido, ${user.email}`;

    // 2. Verificar si el usuario es VIP en la tabla 'perfiles'
    const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('es_vip')
        .eq('id', user.id)
        .single();

    const usuarioEsVip = perfil ? perfil.es_vip : false;

    // 3. Consultar la tabla 'partidos'
    let query = supabaseClient.from('partidos').select('*');

    // Si no es VIP, solo traer partidos gratuitos
    if (!usuarioEsVip) {
        query = query.eq('es_vip', false);
    }

    const { data: partidos, error } = await query;

    if (error) {
        console.error("Error cargando partidos:", error);
        return;
    }

    // 4. Limpiar y llenar la tabla
    tablaBody.innerHTML = '';

    if (partidos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hay pronósticos disponibles por ahora.</td></tr>';
        return;
    }

    partidos.forEach(item => {
        const icono = obtenerIconoDeporte(item.deporte);
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>
                <strong>${item.equipo_local} vs ${item.equipo_visitante}</strong>
                <p>${item.liga}</p>
            </td>
            <td>
                <i class="fa-solid ${icono}"></i> ${item.deporte}
            </td>
            <td>
                <strong>${item.pronostico}</strong>
                ${item.es_vip ? '<span class="badge-vip">💎 VIP</span>' : ''}
            </td>
        `;
        tablaBody.appendChild(fila);
    });
};

document.addEventListener('DOMContentLoaded', cargarPronosticos);