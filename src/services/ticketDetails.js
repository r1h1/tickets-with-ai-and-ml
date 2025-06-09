// Importar rutas de APIs para hacer uso de ellas
import {TICKETS_API, TICKETS_GET_BY_ID_API} from '../config/constants.js';
import {showSuccess, showError, showAlert, showConfirmation} from '../utils/sweetAlert.js';
import {fetchData, fetchDataToken, sendData} from '../data/apiMethods.js';
import {verificarToken} from "../utils/tokenValidation.js";
import {mostrarToast} from "../utils/toast.js";

const removeAllSessionStorage = async () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("apiKeyIndex");
    sessionStorage.removeItem("contadorMensajes");
    sessionStorage.removeItem("modelIndex");
    sessionStorage.removeItem("ticketClasificado");
    window.location.href = "../../../index.html";
}

const closeSession = () => {
    try {
        removeAllSessionStorage();
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
        removeAllSessionStorage();
    }
};


document.addEventListener("DOMContentLoaded", async () => {
    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
});