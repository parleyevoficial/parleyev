const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase y API
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const API_KEY = process.env.FOOTBALL_DATA_API_KEY.replace(/\s+/g, ''); // Esto quita espacios por si acaso

async function ejecutarReclutamiento() {
    console.log("--- INICIANDO RECLUTADOR OFICIAL (FOOTBALL-DATA) ---");

    try {
        // 1. Obtener Partidos Programados de LaLiga (PD)
        // Usamos un filtro de 3 días para asegurar que encuentre algo
        const resPartidos = await fetch('https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED', {
            headers: { 'X-Auth-Token': API_KEY }
        });

        if (!resPartidos.ok) {
            const errorData = await resPartidos.json();
            throw new Error(`Error API: ${resPartidos.status} - ${errorData.message}`);
        }

        const dataPartidos = await resPartidos.json();

        // 2. Definir fecha de búsqueda (Mañana)
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 1);
        const mañana = fecha.toISOString().split('T')[0];
        console.log(`Buscando partidos para la fecha: ${mañana}`);

        const partidosMañana = dataPartidos.matches.filter(m => m.utcDate.includes(mañana));

        if (partidosMañana.length === 0) {
            console.log("No hay partidos programados para mañana en LaLiga.");
            return;
        }

        console.log(`Partidos encontrados: ${partidosMañana.length}`);

        for (let partido of partidosMañana) {
            console.log(`> Procesando: ${partido.homeTeam.name} vs ${partido.awayTeam.name}`);

            // Pronóstico simple para la prueba
            const pronosticoGenerado = `Análisis Automático: Encuentro programado para el ${partido.utcDate}.`;

            // 3. Enviar a Supabase
            const { error } = await supabase
                .from('partidos')
                .insert([{ 
                    equipo_local: partido.homeTeam.name, 
                    equipo_visitante: partido.awayTeam.name, 
                    pronostico: pronosticoGenerado 
                }]);

            if (error) {
                console.error(`❌ Error al insertar en Supabase: ${error.message}`);
            } else {
                console.log(`✅ ¡DATOS ENVIADOS CON ÉXITO!`);
            }
        }

    } catch (err) {
        console.error("❌ ERROR CRÍTICO:", err.message);
    }
    console.log("--- PROCESO FINALIZADO ---");
}

ejecutarReclutamiento();