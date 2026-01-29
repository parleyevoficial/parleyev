// 1. Configuración inicial y Selectores
const form = document.getElementById('form-registro-parley');
const listaParleys = document.getElementById('lista-parleys');

// Selectores de los Stats Cards
const statJugados = document.getElementById('stat-jugados');
const statEfectividad = document.getElementById('stat-efectividad');
const statInvertido = document.getElementById('stat-invertido');
const statGanancia = document.getElementById('stat-ganancia');

// 2. Función para calcular Ganancia Neta (Lógica de Momios)
function calcularGananciaNeta(monto, momio, resultado) {
    if (resultado !== 'Gane') return 0;
    
    let ganancia = 0;
    const m = parseFloat(momio);
    const i = parseFloat(monto);

    if (m > 0) {
        // Momio Positivo (+150): (Monto * Momio) / 100
        ganancia = i * (m / 100);
    } else {
        // Momio Negativo (-110): (Monto * 100) / Valor Absoluto del Momio
        ganancia = i * (100 / Math.abs(m));
    }
    return parseFloat(ganancia.toFixed(2));
}

// 3. Función para Guardar en la Base de Datos
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const evento = document.getElementById('evento').value;
    const inversion = document.getElementById('inversion').value;
    const momio = document.getElementById('momio').value;
    const resultado = document.getElementById('resultado').value;

    const ganancia_neta = calcularGananciaNeta(inversion, momio, resultado);

    // Obtener el ID del usuario actual de la sesión
    const { data: { user } } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient.from('parleys')
        .insert([{
            cod_per: user.id,
            evento,
            inversion: parseFloat(inversion),
            momio_americano: parseInt(momio),
            resultado,
            ganancia_neta
        }]);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        form.reset();
        cargarDatos(); // Recargar la tabla y los stats
    }
});

// 4. Función para Cargar Datos y Procesar Algoritmo de Stats
async function cargarDatos() {
    // 1. Obtener sesión y usuario
    const { data: { user } } = await supabaseClient.auth.getUser();

    // 2. Traer datos de Supabase
    const { data: parleys, error } = await supabaseClient.from('parleys')
        .select('*')
        .eq('cod_per', user.id)
        .order('created_at', { ascending: false });

    if (error) return;

    // --- ALGORITMO DE CÁLCULO DE STATS ---
    let totalInvertido = 0;
    let balanceNetoReal = 0; // Ganancia real (Profit/Loss)
    let ganados = 0;
    let finalizados = 0;

    // SOLUCIÓN AL DUPLICADO: Limpiar la tabla antes de empezar el ciclo
    listaParleys.innerHTML = ''; 

    parleys.forEach(p => {
        totalInvertido += p.inversion;
        
        let netoFila = 0;

        if (p.resultado === 'Gane') {
            balanceNetoReal += p.ganancia_neta; 
            netoFila = p.ganancia_neta;
            ganados++;
            finalizados++;
        } else if (p.resultado === 'Perdi') {
            balanceNetoReal -= p.inversion; // Resta la inversión si se perdió
            netoFila = -p.inversion;
            finalizados++;
        } else {
            netoFila = 0; // Pendiente no suma ni resta al balance
        }

        // --- IMPRIMIR EN LA TABLA ---
        const claseBadge = `badge-${p.resultado.toLowerCase()}`;
        
        // Color dinámico: Naranja para ganar, Rojo para perder, Blanco para pendiente
        const colorNeto = p.resultado === 'Gane' ? '#ff6600' : (p.resultado === 'Perdi' ? '#ff3333' : '#fff');

        // Dentro del forEach de cargarDatos en stats.js
listaParleys.innerHTML += `
    <tr>
        <td data-label="Fecha">${new Date(p.fecha).toLocaleDateString()}</td>
        <td data-label="Evento">${p.evento}</td>
        <td data-label="Inv.">$${p.inversion.toFixed(2)}</td>
        <td data-label="Momio">${p.momio_americano > 0 ? '+' + p.momio_americano : p.momio_americano}</td>
        <td data-label="Resultado" class="${claseBadge}">${p.resultado}</td>
        <td data-label="Neto" style="color: ${colorNeto}">$${netoFila.toFixed(2)}</td>
        <td data-label="Acción">
            <button class="btn-delete" onclick="eliminarParley('${p.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    </tr>
`;
    });

    // --- ACTUALIZAR EL TABLERO DE STATS ---
    const efectividad = finalizados > 0 ? ((ganados / finalizados) * 100).toFixed(1) : 0;
    
    statJugados.innerText = parleys.length;
    statEfectividad.innerText = `${efectividad}%`;
    statInvertido.innerText = `$${totalInvertido.toFixed(2)}`;
    
    // El balance general cambia de color: Naranja si es positivo, Rojo si es pérdida
    statGanancia.style.color = balanceNetoReal >= 0 ? '#ff6600' : '#ff3333';
    statGanancia.innerText = `$${balanceNetoReal.toFixed(2)}`;
}        

// 5. Función para Eliminar
window.eliminarParley = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este registro?')) {
        const { error } = await supabaseClient.from('parleys').delete().eq('id', id);
        if (!error) cargarDatos();
    }
};

// Iniciar carga al abrir la página
cargarDatos();