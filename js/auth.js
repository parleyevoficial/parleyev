// 1. Configuración (Verificada con tu captura de Supabase)
const SB_URL = "https://kjyhvidjikfoezjvpvpw.supabase.co"; 
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWh2aWRqaWtmb2V6anZwdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTg3NDYsImV4cCI6MjA4NTA5NDc0Nn0.xG4j1nOwthdC71Tol_-FrTklCVUnt5kxjF9YrU8afuE";

// 2. Inicializar el cliente (Cambiamos el nombre a 'supabaseClient' para evitar el error de la captura)
window.supabaseClient = supabase.createClient(SB_URL, SB_KEY);
// 3. Capturar los elementos
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');

// --- BOTÓN DE ENTRAR ---
btnLogin.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return alert("Ingresa tus datos");

    // 1. Iniciar sesión normalmente
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else {
        // 2. Si el login es correcto, consultamos su rango en la tabla 'perfiles'
        const { data: perfil, error: errorPerfil } = await supabaseClient
            .from('perfiles')
            .select('es_admin')
            .eq('id', data.user.id)
            .single();

        // 3. Redirección basada en la base de datos, no en el correo escrito
        if (perfil && perfil.es_admin === true) {
            alert("¡Bienvenido, Administrador!");
            window.location.href = "admin.html";
        } else {
            alert("¡Bienvenido!");
            window.location.href = "dashboard.html";
        }
    }
});

// --- BOTÓN DE REGISTRO ---
btnSignup.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) return alert("Rellena todos los campos");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        alert("Error en registro: " + error.message);
    } else {
        alert("¡Registro exitoso! Revisa tu correo para confirmar la cuenta.");
    }
});