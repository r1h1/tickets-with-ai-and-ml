// Importar rutas de APIs para hacer uso de ellas
import { AUTH_API, AUTH_LOGIN_API, AUTH_CAMBIAR_CLAVE_API, AUTH_REGISTRAR_API, AUTH_VALIDAR_TOKEN_API } from '../config/constants.js';
import { showSuccess, showError, showAlert, showConfirmation } from '../utils/sweetAlert.js';
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';
import { mostrarToast } from "../utils/toast.js";

// Función mejorada para sanitizar entradas
const sanitizeInput = (input) => {
    return input
        .trim()
        .replace(/[<>"'%;()&+\\]/g, '') // Bloquea caracteres peligrosos para XSS y SQL Injection
        .replace(/\s+/g, ' ') // Reduce espacios en blanco repetidos
        .replace(/\b(SELECT|INSERT|DELETE|DROP|UPDATE|CREATE|ALTER|WHERE|EXEC|CAST|CONVERT|UNION|XP_)\b/gi, ''); // Bloquea palabras clave SQL Injection
};

const login = async () => {

    let userId = document.getElementById("userId").value.trim();
    let Email = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!Email || !password || !userId) {
        showError('Llena todos los campos para continuar.');
        return;
    }

    // Sanitizar entradas para evitar XSS
    userId = sanitizeInput(userId);
    Email = sanitizeInput(Email);
    password = sanitizeInput(password);

    try {
        const data = { userId: parseInt(userId), Email, password };
        const response = await sendData(AUTH_LOGIN_API, "POST", data);
        console.log(response);

        if (response.token) {
            sessionStorage.setItem("token", response.token);
            window.location.href = "../../src/views/pages/start.html?login=true";
        }
        else {
            mostrarToast(response.message, 'danger');
        }
    } catch (error) {
        console.error("Error de login:", error); // opcional para debug
        mostrarToast(error, 'danger');
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");

    if (loginButton) {
        loginButton.addEventListener("click", login);
    }
});

