// 1. Configuración (Verificada con tu captura de Supabase)
const SB_URL = "https://kjyhvidjikfoezjvpvpw.supabase.co"; 
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeWh2aWRqaWtmb2V6anZwdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTg3NDYsImV4cCI6MjA4NTA5NDc0Nn0.xG4j1nOwthdC71Tol_-FrTklCVUnt5kxjF9YrU8afuE";

// 2. Inicializar el cliente (Cambiamos el nombre a 'supabaseClient' para evitar el error de la captura)
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

// 3. Capturar los elementos
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');

// --- BOTÓN DE ENTRAR ---
btnLogin.addEventListener('click', async () => {
   // Busca estas líneas en tu auth.js y cámbialas:
const email = emailInput.value.trim(); // .trim() elimina espacios invisibles
const password = passwordInput.value;

    if (!email || !password) return alert("Ingresa tus datos");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Bienvenido!");
        // Redirección inteligente
        if (data.user.email === "parleyevoficial@gmail.com") {
            window.location.href = "admin.html";
        } else {
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