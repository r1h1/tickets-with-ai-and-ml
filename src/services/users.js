// Importar rutas de APIs para hacer uso de ellas
import {CATEGORY_API, ROLES_API, USERS_API, USERS_GET_BY_ID_API, AUTH_API, AUTH_REGISTRAR_API} from '../config/constants.js';
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


const obtainRols = async () => {
    try {
        const response = await fetchData(ROLES_API, "GET", obtainHeaders());

        if (response && response.data && Array.isArray(response.data)) {
            const selectRol = document.getElementById("rolUsuario");
            selectRol.innerHTML = '<option value="">Seleccione un rol</option>';

            response.data.forEach(rol => {
                const option = document.createElement("option");
                option.value = rol.roleId;
                option.textContent = rol.roleName;
                selectRol.appendChild(option);
            });
        } else {
            mostrarToast("No se trajeron datos de roles.", "warning");
        }
    } catch (error) {
        mostrarToast("Error al obtener roles", "danger");
        console.error(error);
    }
}


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


const createUserWithAuth = async () => {
    try {
        const name = document.getElementById("nombreUsuario").value;
        const email = document.getElementById("correoUsuario").value;
        const password = document.getElementById("claveUsuario").value;
        const seniorityLevel = document.getElementById("nivelSeniority").value;
        const roleId = parseInt(document.getElementById("rolUsuario").value);

        if (!name || !email || !password || !roleId) {
            mostrarToast("Todos los campos son obligatorios.", "danger");
            return;
        }
        if (!seniorityLevel || seniorityLevel === "Seleccionar nivel") {
            mostrarToast("Debe seleccionar el nivel de seniority.", "danger");
            return;
        }

        // 1. Crear usuario
        const userPayload = {
            userId: 0,
            name,
            email,
            roleId,
            roleName: null,
            seniorityLevel,
            isActive: 1,
            createdAt: new Date().toISOString(),
            state: 1,
            newUserId: null,
            success: null
        };

        const userResponse = await sendData(USERS_API, "POST", userPayload, obtainHeaders());

        if (!userResponse || !userResponse.data || userResponse.data.success !== 1) {
            mostrarToast("No se pudo crear el usuario.", "danger");
            return;
        }

        const userId = userResponse.data.newUserId;

        // 2. Crear auth
        const authPayload = {
            userId,
            email,
            password
        };

        const authResponse = await sendData(AUTH_REGISTRAR_API, "POST", authPayload, obtainHeaders());

        // ⚠️ Validar el código y éxito del auth
        if (!authResponse || authResponse.code !== 201) {
            await sendData(USERS_API, "DELETE", {
                userId,
                name,
                email,
                seniorityLevel,
                state: 0,
                roleId,
                createdAt: new Date().toISOString()
            }, obtainHeaders());
            mostrarToast("No se pudo crear credenciales. Usuario eliminado.", "danger");
            return;
        }

        mostrarToast("Usuario creado correctamente con credenciales.", "success");
        await obtainsUsers();
        clearUserForm();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarUsuario'));
        modal.hide();

    } catch (error) {
        console.error("Error:", error);
        mostrarToast("Ocurrió un error al crear el usuario.", "danger");
    }
};


const editUsers = async (row) => {
    try {
        document.getElementById("userId").value = row.userId;
        document.getElementById("nombreUsuario").value = row.name;
        document.getElementById("correoUsuario").value = row.email;
        document.getElementById("claveUsuario").value = "";
        document.getElementById("rolUsuario").value = row.roleId;
        document.getElementById("nivelSeniority").value = row.seniorityLevel;

        if (row.userId) {
            const modal = new bootstrap.Modal(document.getElementById('modalAgregarUsuario'));
            modal.show();
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
};


const updateUsersWithAuth = async () => {
    try {
        const userId = parseInt(document.getElementById("userId").value);
        const name = document.getElementById("nombreUsuario").value;
        const email = document.getElementById("correoUsuario").value;
        const password = document.getElementById("claveUsuario").value;
        const roleId = parseInt(document.getElementById("rolUsuario").value);
        const seniorityLevel = document.getElementById("nivelSeniority").value;

        if (!name || !email || !roleId) {
            mostrarToast("Todos los campos son obligatorios, excepto la contraseña.", "danger");
            return;
        }
        if (!seniorityLevel || seniorityLevel === "Seleccionar nivel") {
            mostrarToast("Debe seleccionar el nivel de seniority.", "danger");
            return;
        }

        const userPayload = {
            userId,
            name,
            email,
            roleId,
            roleName: "",
            seniorityLevel,
            isActive: 1,
            createdAt: new Date().toISOString(),
            state: 1,
            newUserId: 0,
            success: 0
        };

        const userResponse = await sendData(USERS_API, "PUT", userPayload, obtainHeaders());

        if (!userResponse || !userResponse.data || userResponse.data.success !== 1) {
            mostrarToast("No se pudo actualizar el usuario.", "danger");
            return;
        }

        let passwordActualizada = false;

        // Solo actualizar auth si se ingresó un nuevo password
        if (password && password.trim() !== "") {
            const authPayload = {
                userId,
                password,
                email
            };

            const authResponse = await sendData(`${AUTH_API}/updatePassword`, authPayload, obtainHeaders());

            if (!authResponse || !authResponse.data || authResponse.data.success !== 1) {
                mostrarToast("El usuario fue actualizado, pero no se pudo cambiar la contraseña.", "warning");
            } else {
                passwordActualizada = true;
            }
        }

        if (passwordActualizada) {
            mostrarToast("Usuario y contraseña actualizados con éxito.", "success");
        } else if (!password || password.trim() === "") {
            mostrarToast("Usuario actualizado sin cambiar la contraseña.", "success");
        }

        await obtainsUsers();
        clearUserForm();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarUsuario'));
        modal.hide();

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        mostrarToast("Error inesperado al actualizar usuario.", "danger");
    }
};



const deleteUserAndAuth = async (userId) => {
    try {
        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: `El usuario con ID ${userId} será eliminado.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) {
            mostrarToast("Operación cancelada.", "secondary");
            return;
        }

        // 1. Eliminar usuario
        const deleteUserResponse = await sendData(USERS_API, "DELETE", { userId, state: 0 }, obtainHeaders());

        if (!deleteUserResponse || deleteUserResponse.data.success !== 1) {
            mostrarToast("No se pudo eliminar el usuario.", "danger");
            return;
        }

        // 2. Eliminar auth
        const deleteAuthResponse = await sendData(`${AUTH_API}/logicDelete`, { userId }, obtainHeaders());

        if (!deleteAuthResponse || deleteAuthResponse.data.success !== 1) {
            mostrarToast("El usuario fue eliminado, pero no se borró el acceso.", "warning");
            return;
        }

        mostrarToast("Usuario y acceso eliminados correctamente.", "success");
        await obtainsUsers();
    } catch (error) {
        mostrarToast(error, "danger");
        console.error(error);
    }
};


const clearUserForm = () => {
    document.getElementById("userId").value = "";
    document.getElementById("nombreUsuario").value = "";
    document.getElementById("correoUsuario").value = "";
    document.getElementById("claveUsuario").value = "";
    document.getElementById("rolUsuario").value = "";
    document.getElementById("nivelSeniority").value = "Seleccionar nivel";
};



const mostrarModalUsuario = () => {
    clearUserForm();
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarUsuario'));
    modal.show();
}


window.deleteUsers = deleteUserAndAuth;
window.editUsers = editUsers;
window.mostrarModalUsuario = mostrarModalUsuario;


document.addEventListener("DOMContentLoaded", async () => {
    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");
    const btnGuardarUsuario = document.getElementById("btnGuardarUsuario");

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }

    if (btnGuardarUsuario) {
        btnGuardarUsuario.addEventListener("click", async () => {
            const userId = document.getElementById("userId").value;

            if (userId == null || userId.trim() === "") {
                await createUserWithAuth();
            } else {
                await updateUsersWithAuth();
            }
        });
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
    await obtainRols();
    await obtainsUsers();
});