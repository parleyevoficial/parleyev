const { createClient } = require('@supabase/supabase-js');

// 1. Configuración de conexión con Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarReclutamiento() {
    console.log("--- INICIANDO PROCESO DE RECLUTAMIENTO ATÓMICO ---");
    
    // Configuramos la fecha de MAÑANA (01 de febrero) para la prueba
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1); 
    const mañana = fecha.toISOString().split('T')[0];
    
    const LIGA_ID = 8; // LaLiga
    const SEASON_ID = 77559; // Temporada actual según tu link

    console.log(`Objetivo: Partidos del ${mañana}`);

    // El "Disfraz": Esto evita que SofaScore bloquee la petición de GitHub
    const opciones = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com'
        }
    };

    try {
        // 2. Obtener lista de partidos
        console.log("Conectando con SofaScore...");
        const res = await fetch(`https://api.sofascore.com/v1/tournament/${LIGA_ID}/season/${SEASON_ID}/events/last/0`, opciones);
        
        if (!res.ok) throw new Error(`Error de conexión: ${res.status} - Posible bloqueo.`);
        
        const data = await res.json();
        
        // Filtramos por la fecha de mañana
        const partidosSeleccionados = data.events.filter(e => e.startTimestamp.includes(mañana));

        if (partidosSeleccionados.length === 0) {
            console.log(`No se encontraron partidos para el ${mañana}. Intentando con los de hoy...`);
            // Si no hay mañana, podrías probar con los de hoy (comenta la línea de arriba si quieres forzar hoy)
        }

        console.log(`Partidos a procesar: ${partidosSeleccionados.length}`);

        for (let partido of partidosSeleccionados) {
            console.log(`\n--- Analizando: ${partido.homeTeam.name} vs ${partido.awayTeam.name} ---`);

            // 3. Reclutar alineaciones con el mismo disfraz
            const resLineups = await fetch(`https://api.sofascore.com/v1/event/${partido.id}/lineups`, opciones);
            const lineups = await resLineups.json();

            if (lineups.home && lineups.away && lineups.home.players && lineups.away.players) {
                
                const calcularSkill = (players) => players.reduce((acc, p) => acc + (p.avgRating || 6.8), 0) / players.length;

                const skillLocal = calcularSkill(lineups.home.players);
                const skillVisita = calcularSkill(lineups.away.players);
                
                const dif = (skillLocal - skillVisita).toFixed(2);
                const pronostico = `Skill Dif: ${dif} | L: ${skillLocal.toFixed(2)} vs V: ${skillVisita.toFixed(2)}`;

                // 4. Inyectar en Supabase
                const { error } = await supabase
                    .from('partidos')
                    .insert([
                        { 
                            equipo_local: partido.homeTeam.name, 
                            equipo_visitante: partido.awayTeam.name, 
                            pronostico: pronostico 
                        }
                    ]);

                if (error) console.error(`❌ Error Supabase: ${error.message}`);
                else console.log(`✅ ¡DATOS ENVIADOS! ${partido.homeTeam.name} vs ${partido.awayTeam.name}`);

            } else {
                console.log(`⚠️ Alineaciones no confirmadas aún para ID: ${partido.id}. Inténtalo 1 hora antes del juego.`);
            }
        }
    } catch (err) {
        console.error("❌ FALLO EN EL RECLUTAMIENTO:", err.message);
    }
    
    console.log("\n--- OPERACIÓN TERMINADA ---");
}

ejecutarReclutamiento();