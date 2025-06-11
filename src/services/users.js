// Importar rutas de APIs para hacer uso de ellas
import {CATEGORY_API, USERS_API, USERS_GET_BY_ID_API} from '../config/constants.js';
import { showSuccess, showError, showAlert, showConfirmation } from '../utils/sweetAlert.js';
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';
import {verificarToken} from "../utils/tokenValidation.js";
import {mostrarToast} from "../utils/toast.js";

const removeAllSessionStorage = () => {
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

    const isValid = await verificarToken(token);

    if (isValid) {
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


const obtainsUsers = async () => {
    try {
        const response = await fetchData(USERS_API, "GET", obtainHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#usersTable').DataTable({
                destroy: true,
                data: response.data,
                columns: [
                    {data: "userId"},
                    {data: "name"},
                    {data: "email"},
                    {data: "roleId"},
                    {data: "roleName"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                    <button onclick="editUsers(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                    <button onclick="deleteUsers(${row.userId})" class="btn btn-danger">Eliminar</button>
                `;
                        }
                    }
                ],
                dom: 'Bfrtip',
                buttons: [
                    {
                        extend: 'copy',
                        className: 'btn btn-secondary'
                    },
                    {
                        extend: 'excel',
                        className: 'btn btn-secondary'
                    },
                    {
                        extend: 'pdf',
                        className: 'btn btn-secondary'
                    },
                    {
                        extend: 'print',
                        className: 'btn btn-secondary'
                    }
                ],
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
                }
            });
        } else {
            mostrarToast("No se trajeron datos.", "warning");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


document.addEventListener("DOMContentLoaded", async() => {
    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
    await obtainsUsers();
});