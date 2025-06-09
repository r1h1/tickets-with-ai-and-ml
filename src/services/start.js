// Imports para reutilización
import {showSuccess, showError, showAlert, showConfirmation} from '../utils/sweetAlert.js';
import {fetchData, fetchDataToken, sendData} from '../data/apiMethods.js';
import {verificarToken} from '../utils/tokenValidation.js';
import {mostrarToast} from '../utils/toast.js';

const closeSession = () => {
    try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("apiKeyIndex");
        sessionStorage.removeItem("contadorMensajes");
        sessionStorage.removeItem("modelIndex");
        sessionStorage.removeItem("ticketClasificado");
        window.location.href = "../../../index.html";
    } catch (error) {
        showError("Error al cerrar sesión:", error);
    }
}

const checkTokenAndLoginInfo = async () => {
    const token = sessionStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const loginExitoso = urlParams.get("login") === "true";

    const esValido = await verificarToken(token);

    if (esValido) {
        if (loginExitoso) {
            mostrarToast("Sesión iniciada con éxito, bienvenido.", "success");
        }
    } else {
        mostrarToast("Sesión inválida.", "danger");
        sessionStorage.removeItem("token");
        location.href = "../../../index.html";
    }
};


document.addEventListener("DOMContentLoaded", async() => {
    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
});


















