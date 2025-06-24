// Imports para reutilización
import {showSuccess, showError, showAlert, showConfirmation} from '../utils/sweetAlert.js';
import {fetchData, fetchDataToken, sendData} from '../data/apiMethods.js';
import {verificarToken} from '../utils/tokenValidation.js';
import {mostrarToast} from '../utils/toast.js';
import {USERS_API, TICKETS_API, ROLES_API, ROLES_GET_BY_ID_API} from '../config/constants.js';
import {MENU_LOOKUP} from '../utils/menuIcons.js';

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


const obtainHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        closeSession();
        return null;
    }
    //retorna el token
    return {"Authorization": `Bearer ${token}`};
};


const obtainMenu = async () => {
    try {
        const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split('.')[1]));
        const response = await fetchDataToken(ROLES_GET_BY_ID_API(tokenPayload.role), "GET", obtainHeaders());

        if (response && response.data?.assignedMenus) {
            const allowedMenus = response.data.assignedMenus.split(",");
            const container = document.getElementById("menuContainer");
            const currentPage = location.pathname.split("/").pop();

            container.innerHTML = "";

            allowedMenus.forEach(menu => {
                const menuData = MENU_LOOKUP[menu];
                if (menuData) {
                    const isActive = currentPage === menu ? "active" : "";
                    container.innerHTML += `
                        <a href="${menu}" class="${isActive}">
                            <i class="bi ${menuData.icon} me-2"></i>${menuData.label}
                        </a>`;
                }
            });
        } else {
            mostrarToast("No se trajeron datos del menú.", "warning");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
};


const obtainUsersStatistics = async () => {
    try {
        const response = await fetchData(USERS_API, "GET", obtainHeaders());

        if (response) {
            document.getElementById("usuariosActivos").textContent = response.data.length || 0;
        } else {
            mostrarToast("No se trajeron datos.", "warning");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
};


const obtainTicketsStatistics = async () => {
    try {
        const response = await fetchData(TICKETS_API, "GET", obtainHeaders());

        if (response) {
            document.getElementById("ticketsTotales").textContent = response.data.length || 0;
            document.getElementById("ticketsNuevos").textContent = response.data.filter(ticket => ticket.status === "New").length;
            document.getElementById("ticketsEnProcesos").textContent = response.data.filter(ticket => ticket.status === "En Proceso").length;
            document.getElementById("ticketsResueltos").textContent = response.data.filter(ticket => ticket.status === "Resuelto").length;
            document.getElementById("ticketsCerrados").textContent = response.data.filter(ticket => ticket.status === "Cerrado").length;
        } else {
            mostrarToast("No se trajeron datos.", "warning");
        }
    } catch (error) {
        mostrarToast(error, "danger");
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
    await obtainMenu();
    await obtainUsersStatistics();
    await obtainTicketsStatistics();
});


















