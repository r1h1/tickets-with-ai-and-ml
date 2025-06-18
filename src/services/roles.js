// Importar rutas de APIs para hacer uso de ellas
import {CATEGORY_API, ROLES_API, ROLES_GET_BY_ID_API, USERS_API} from '../config/constants.js';
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

    const esValido = await verificarToken(token);

    if (esValido) {
        if (loginExitoso) {
            mostrarToast("Sesión iniciada con éxito, bienvenido.", "success");
        }
    } else {
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


const obtainRoles = async () => {
    try {
        const response = await fetchData(ROLES_API, "GET", obtainHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#rolesTable').DataTable({
                destroy: true,
                data: response.data,
                columns: [
                    {data: "roleId"},
                    {data: "roleName"},
                    {data: "assignedMenus"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                    <button onclick="editRoles(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                    <button onclick="deleteRoles(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-danger">Eliminar</button>
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


const showRolModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarRol'));
    modal.show();
}


const createRol = async () => {
    try {
        const roleId = 0;
        const roleName = document.getElementById("nombreRol").value;
        const selectElement = document.getElementById("menusRol");
        const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
        const assignedMenus = selectedValues.join(",");
        const state = 1;
        const newRoleId = null;
        const success = null;

        if (!roleName || !assignedMenus) {
            mostrarToast("Todos los campos son obligatorios.", "danger");
            return;
        }

        const data = {
            roleId,
            roleName,
            assignedMenus,
            state,
            newRoleId,
            success
        };

        const response = await sendData(ROLES_API, "POST", data, obtainHeaders());

        if (response && response.data && response.data.success === 1) {
            mostrarToast(response.message, "success");
            await obtainRoles();
            clearForm();
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalAgregarRol'));
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const editRoles = (row) => {
    try {
        const { roleId, roleName, assignedMenus } = row;
        document.getElementById("roleId").value = roleId;
        document.getElementById("nombreRol").value = roleName;
        const selectElement = document.getElementById("menusRol");
        const menusAsignados = assignedMenus.split(","); // convierte string en array

        Array.from(selectElement.options).forEach(option => {
            option.selected = menusAsignados.includes(option.value);
        });

        const modal = new bootstrap.Modal(document.getElementById("modalAgregarRol"));
        modal.show();

    } catch (error) {
        mostrarToast(error, "danger");
    }
};


const updateRol = async () => {
    try {
        const roleId = parseInt(document.getElementById("roleId").value);
        const roleName = document.getElementById("nombreRol").value;
        const selectElement = document.getElementById("menusRol");
        const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
        const assignedMenus = selectedValues.join(",");
        const state = 1;

        if (!roleId || !roleName || !assignedMenus) {
            mostrarToast("Todos los campos son obligatorios.", "danger");
            return;
        }

        const data = {
            roleId,
            roleName,
            assignedMenus,
            state,
            newRoleId: null,
            success: null
        };

        const response = await sendData(ROLES_API, "PUT", data, obtainHeaders());

        if (response && response.data && response.data.success === 1) {
            mostrarToast(response.message, "success");
            await obtainRoles();
            clearForm();
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalAgregarRol"));
            if (modalInstance) modalInstance.hide();
        } else {
            mostrarToast("No se pudo actualizar el rol.", "danger");
        }

    } catch (error) {
        mostrarToast(error, "danger");
    }
};


const deleteRoles = async (row) => {
    try {
        const roleId = row.roleId;
        const roleName = row.roleName;
        const assignedMenus = row.assignedMenus;
        const state = 1;
        const newRoleId = null;
        const success = null;

        if (!roleId || !roleName) {
            mostrarToast("No se pudieron extraer los datos de la tabla.", "danger");
            return;
        }

        const confirmacion = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `"${roleName}" será eliminada.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) {
            mostrarToast("No te preocupes, no se modificó nada.", "secondary");
            return;
        }

        const data = {
            roleId,
            roleName,
            assignedMenus,
            state,
            newRoleId,
            success
        };

        const response = await sendData(ROLES_API, "DELETE", data, obtainHeaders());

        if (response && response.data && response.data.success === 1) {
            mostrarToast(response.message, "success");
            await obtainRoles();
        } else {
            mostrarToast("No se pudo eliminar el rol.", "danger");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const clearForm = () => {
    document.getElementById("nombreRol").value = "";
    document.getElementById("menusRol").value = "";
};


window.showRolModal = showRolModal;
window.deleteRoles = deleteRoles;
window.editRoles = editRoles;


document.addEventListener("DOMContentLoaded", async() => {
    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");
    const btnSaveRol = document.getElementById("btnSaveRol");

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }
    if (btnSaveRol) {
        btnSaveRol.addEventListener("click", async () => {
            const roleId = document.getElementById("roleId").value;

            if (roleId == null || roleId === "") {
                await createRol();
            } else {
                await updateRol();
            }
        });
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
    await obtainRoles();
});