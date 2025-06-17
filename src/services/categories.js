// Importar rutas de APIs para hacer uso de ellas
import {CATEGORY_API, CATEGORY_GET_BY_ID_API} from '../config/constants.js';
import {showSuccess, showError, showAlert, showConfirmation} from '../utils/sweetAlert.js';
import {fetchData, fetchDataToken, sendData} from '../data/apiMethods.js';
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


const obtainCategories = async () => {
    try {
        const response = await fetchData(CATEGORY_API, "GET", obtainHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#categoriesTable').DataTable({
                destroy: true,
                data: response.data,
                columns: [
                    {data: "categoryId"},
                    {data: "name"},
                    {data: "description"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                                <button onclick='editCategories(${JSON.stringify(row).replace(/'/g, "&#39;").
                                        replace(/"/g, "&quot;")})' class="btn btn-warning">Editar</button>
                                <button onclick='deleteCategories(${JSON.stringify(row).replace(/'/g, "&#39;").
                                        replace(/"/g, "&quot;")})' class="btn btn-danger">Eliminar</button>
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

const mostrarModalCategoria = () => {
    clearForm();
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarCategoria'));
    modal.show();
}


const createCategories = async () => {
    try {
        const categoryId = 0;
        const name = document.getElementById("nombreCategoria").value;
        const description = document.getElementById("descripcionCategoria").value;
        const state = 1;
        const newCategoryId = null;
        const success = null;

        if (!name || !description) {
            mostrarToast("Todos los campos son obligatorios.", "danger");
            return;
        }

        const data = {
            categoryId,
            name,
            description,
            state,
            newCategoryId,
            success
        };

        const response = await sendData(CATEGORY_API, "POST", data, obtainHeaders());

        if (response && response.data && response.data.success === 1) {
            mostrarToast(response.message, "success");
            await obtainCategories();
            clearForm();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCategoria'));
            modal.hide();
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const editCategories = async (row) => {
    try {
        const categoryId = row.categoryId;
        const name = row.name;
        const description = row.description;
        document.getElementById("categoryId").value = categoryId;
        document.getElementById("nombreCategoria").value = name;
        document.getElementById("descripcionCategoria").value = description;

        if(categoryId){
            const modal = new bootstrap.Modal(document.getElementById('modalAgregarCategoria'));
            modal.show();
        }

    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const updateCategories = async () => {
    try {
        const categoryId = parseInt(document.getElementById("categoryId").value);
        const name = document.getElementById("nombreCategoria").value;
        const description = document.getElementById("descripcionCategoria").value;
        const state = 1;
        const newCategoryId = null;
        const success = null;

        if (!name || !description) {
            mostrarToast("Todos los campos son obligatorios.", "danger");
            return;
        }

        const data = {
            categoryId,
            name,
            description,
            state,
            newCategoryId,
            success
        };

        const response = await sendData(CATEGORY_API, "PUT", data, obtainHeaders());

        if (response && response.data && response.data.success === 1) {
            mostrarToast(response.message, "success");
            await obtainCategories();
            clearForm();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCategoria'));
            modal.hide();
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const deleteCategories = async (row) => {
    try {
        const categoryId = row.categoryId;
        const name = row.name;
        const description = row.description;
        const state = 0;
        const newCategoryId = null;
        const success = null;

        if (!name || !description) {
            mostrarToast("No se pudieron extraer los datos de la tabla.", "danger");
            return;
        }

        const confirmacion = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `"${name}" será eliminada.`,
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
            categoryId,
            name,
            description,
            state,
            newCategoryId,
            success
        };

        const response = await sendData(CATEGORY_API, "DELETE", data, obtainHeaders());

        if (response && response.data && response.data.success === 1) {
            mostrarToast(response.message, "success");
            await obtainCategories();
        } else {
            mostrarToast("No se pudo eliminar la categoría.", "danger");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const clearForm = () => {
    document.getElementById("categoryId").value = "";
    document.getElementById("nombreCategoria").value = "";
    document.getElementById("descripcionCategoria").value = "";
}


window.mostrarModalCategoria = mostrarModalCategoria;
window.deleteCategories = deleteCategories;
window.editCategories = editCategories;


document.addEventListener("DOMContentLoaded", async () => {
    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");
    const btnGuardarCategorias = document.getElementById("btnGuardarCategorias");
    const categoryId = document.getElementById("categoryId").value;

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }
    if (btnGuardarCategorias) {
        btnGuardarCategorias.addEventListener("click", async () => {
            const categoryId = document.getElementById("categoryId").value;

            if (categoryId == null || categoryId === "") {
                await createCategories();
            } else {
                await updateCategories();
            }
        });
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
    await obtainCategories();
});