const { createClient } = require('@supabase/supabase-js');

// 1. Configuración de conexión (Usa variables de entorno de GitHub)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarReclutamiento() {
    console.log("--- INICIANDO PROCESO DE RECLUTAMIENTO ---");
    
    const LIGA_ID = 8; // ID de LaLiga en SofaScore
    
    // Obtenemos la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];
    console.log(`Buscando partidos para la fecha: ${hoy}`);

    try {
        // 2. Obtener lista de partidos de la liga
        // Cambia la línea de la URL por esta:
        const res = await fetch(`https://api.sofascore.com/v1/tournament/${LIGA_ID}/season/77559/events/last/0`);
        if (!res.ok) throw new Error("No se pudo conectar con la API de SofaScore");
        
        const data = await res.json();
        
        // Filtramos: Solo partidos de HOY que no hayan terminado
        const partidosDeHoy = data.events.filter(e => e.startTimestamp.includes(hoy));

        if (partidosDeHoy.length === 0) {
            console.log("No hay partidos programados para hoy en esta liga.");
            return;
        }

        console.log(`Partidos encontrados: ${partidosDeHoy.length}`);

        for (let partido of partidosDeHoy) {
            console.log(`\n> Analizando choque: ${partido.homeTeam.name} vs ${partido.awayTeam.name}`);

            // 3. Reclutar alineaciones (Lineups)
            const resLineups = await fetch(`https://api.sofascore.com/v1/event/${partido.id}/lineups`);
            const lineups = await resLineups.json();

            // Verificamos si hay alineaciones disponibles (a veces salen 1h antes)
            if (lineups.home && lineups.away && lineups.home.players && lineups.away.players) {
                
                // --- TU ALGORITMO DE CÁLCULO ATÓMICO ---
                // Promediamos el rating de los 11 jugadores (si no hay rating usamos 6.5 base)
                const calcularSkill = (players) => players.reduce((acc, p) => acc + (p.avgRating || 6.5), 0) / players.length;

                const skillLocal = calcularSkill(lineups.home.players);
                const skillVisita = calcularSkill(lineups.away.players);
                
                const diferencial = (skillLocal - skillVisita).toFixed(2);
                const pronosticoFinal = `Diferencial de Skill: ${diferencial} | Local_Avg: ${skillLocal.toFixed(2)} vs Visita_Avg: ${skillVisita.toFixed(2)}`;
                // ---------------------------------------

                // 4. Inserción en Supabase
                const { error } = await supabase
                    .from('partidos')
                    .insert([
                        { 
                            equipo_local: partido.homeTeam.name, 
                            equipo_visitante: partido.awayTeam.name, 
                            pronostico: pronosticoFinal 
                        }
                    ]);

                if (error) {
                    console.error(`Error insertando partido: ${error.message}`);
                } else {
                    console.log(`✅ ÉXITO: ${partido.homeTeam.name} procesado y enviado.`);
                }

            } else {
                console.log(`⚠️ Alineaciones no disponibles todavía para este partido (ID: ${partido.id}).`);
            }
        }
    } catch (err) {
        console.error("❌ ERROR CRÍTICO EN EL SISTEMA:", err.message);
    }
    
    console.log("\n--- PROCESO FINALIZADO ---");
}

ejecutarReclutamiento();