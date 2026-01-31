const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase y API
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const API_KEY = process.env.FOOTBALL_DATA_API_KEY.replace(/\s+/g, '');

async function ejecutarReclutamiento() {
    console.log("--- INICIANDO MULTI-RECLUTADOR DE ÉLITE ---");

    // 1. Configuración de Ligas y Nombres Obligatorios
    const ligasConfig = [
        { id: 'PD', nombre: 'La Liga' },        // España
        { id: 'PL', nombre: 'Premier League' }, // Inglaterra
        { id: 'BL1', nombre: 'Bundesliga' },    // Alemania
        { id: 'SA', nombre: 'Serie A' },        // Italia
        { id: 'FL1', nombre: 'Ligue 1' },       // Francia
        { id: 'CL', nombre: 'Champions League' } // Champions
    ];

    // 2. Calcular la fecha de MAÑANA (Dinámico)
    const fechaActual = new Date();
    fechaActual.setDate(fechaActual.getDate() + 1);
    const fechaMañana = fechaActual.toISOString().split('T')[0];
    
    console.log(`Buscando partidos para la fecha: ${fechaMañana}`);

    // Usamos 'of' en lugar de 'de' para evitar el error de sintaxis
    for (const liga of ligasConfig) { 
        try {
            console.log(`\nConsultando ${liga.nombre}...`);
            
            // Endpoint optimizado para filtrar por fecha exacta
            const res = await fetch(`https://api.football-data.org/v4/competitions/${liga.id}/matches?dateFrom=${fechaMañana}&dateTo=${fechaMañana}`, {
                headers: { 'X-Auth-Token': API_KEY }
            });

            if (!res.ok) {
                console.log(`⚠️ No hay partidos o error en ${liga.nombre}. Status: ${res.status}`);
                continue;
            }

            const data = await res.json();
            const partidos = data.matches || [];

            if (partidos.length === 0) {
                console.log(`- Sin partidos para mañana en ${liga.nombre}.`);
                continue;
            }

            for (let partido of partidos) {
                // Objeto listo para tu tabla 'partidos'
                const datosPartido = {
                    deporte: "Fútbol", // Con acento como pediste
                    liga: liga.nombre,  // Nombre formateado (La Liga, Premier League...)
                    equipo_local: partido.homeTeam.name,
                    equipo_visitante: partido.awayTeam.name,
                    url_equipo_local: partido.homeTeam.crest, // URL directa del logo
                    url_equipo_visitante: partido.awayTeam.crest, // URL directa del logo
                    pronostico: `Análisis automático: ${partido.homeTeam.name} recibe a ${partido.awayTeam.name} en ${liga.nombre}.`
                };

                const { error } = await supabase
                    .from('partidos')
                    .insert([datosPartido]);

                if (error) {
                    console.error(`❌ Error Supabase en ${partido.homeTeam.name}:`, error.message);
                } else {
                    console.log(`✅ Registrado: ${partido.homeTeam.name} vs ${partido.awayTeam.name}`);
                }
            }

        } catch (err) {
            console.error(`❌ Error crítico en ${liga.nombre}:`, err.message);
        }
    }
    console.log("\n--- TRABAJADOR FINALIZÓ EXITOSAMENTE ---");
}

ejecutarReclutamiento();