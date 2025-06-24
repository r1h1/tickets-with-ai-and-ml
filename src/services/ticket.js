// ===================== IMPORTACIONES =====================
import { ROLES_API, TICKETS_API, CATEGORY_API, ROLES_GET_BY_ID_API } from '../config/constants.js';
import { MENU_LOOKUP } from '../utils/menuIcons.js';
import { crearNuevoTicket } from './ticketCreator.js';
import { showError } from '../utils/sweetAlert.js';
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';
import { verificarToken } from '../utils/tokenValidation.js';
import { mostrarToast } from '../utils/toast.js';

const removeAllSessionStorage = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("apiKeyIndex");
    sessionStorage.removeItem("contadorMensajes");
    sessionStorage.removeItem("modelIndex");
    sessionStorage.removeItem("ticketClasificado");
    window.location.href = "../../../index.html";
}

// ===================== FUNCIONES DE SESIÓN =====================
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
    return { "Authorization": `Bearer ${token}` };
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


// Retornar categorias creadas
const obtainCategories = async () => {
    try {
        const response = await fetchData(CATEGORY_API, "GET", obtainHeaders());

        if (response) {
            const categoriesSelect = document.getElementById('categoria');
            categoriesSelect.innerHTML = '<option value="">Selecciona una categoría...</option>';

            response.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryId;
                option.textContent = category.name;
                categoriesSelect.appendChild(option);
            });
        } else {
            mostrarToast("No se trajeron las categorias.", "warning");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


const obtainTickets = async () => {
    try {
        const response = await fetchData(TICKETS_API, "GET", obtainHeaders());

        if (response && response.data) {
            // Extraer datos del token
            const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split('.')[1]));
            const userRole = parseInt(tokenPayload.role); // 1 = superadmin, 2 = admin
            const userId = parseInt(tokenPayload.nameid);
            const isPrivileged = userRole === 1 || userRole === 2;

            // Filtrado de tickets si no tiene privilegios
            let filteredTickets = response.data;
            if (!isPrivileged) {
                filteredTickets = filteredTickets.filter(ticket => ticket.createdBy === userId);
            }

            $('#ticketsTable').DataTable({
                destroy: true,
                data: filteredTickets,
                columns: [
                    {
                        data: "ticketId",
                        render: function (data) {
                            return `<a href="detalle_ticket.html?q=${data}" class="fw-bold text-primary">${data}</a>`;
                        }
                    },
                    {
                        data: "createdAt",
                        render: data => new Date(data).toLocaleString()
                    },
                    { data: "createdByName" },
                    {
                        data: "assignedToName",
                        render: function (data) {
                            return data && data.trim() !== "" ? data : "Sin asignar";
                        }
                    },
                    { data: "title" },
                    { data: "status" },
                    {
                        data: "priority",
                        render: function (data) {
                            let className = "";
                            switch (data.toLowerCase()) {
                                case "crítica":
                                case "critica":
                                case "critical":
                                    className = "priority-critical"; break;
                                case "alta":
                                case "high":
                                    className = "priority-high"; break;
                                case "media":
                                case "medium":
                                    className = "priority-medium"; break;
                                case "baja":
                                case "low":
                                    className = "priority-low"; break;
                                default:
                                    className = "priority-low";
                            }
                            return `<span class="priority-tag ${className}">${data}</span>`;
                        }
                    },
                    {
                        data: null,
                        render: function (data, type, row) {
                            // Mostrar solo si es admin o superadmin
                            return isPrivileged
                                ? `<button onclick="deleteTicket(${JSON.stringify(row).replace(/'/g, "&#39;").
                                    replace(/"/g, "&quot;")})" class="btn btn-danger">Eliminar</button>`
                                : '';
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
        mostrarToast(error.message || error, "danger");
    }
};


// ===================== UI INIT (FECHA, MODAL) =====================
const initUI = () => {
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        fechaInput.value = `${year}-${month}-${day}`;
    }

    document.getElementById('btnNuevoTicket')?.addEventListener('click', () => {
        const modalNuevoTicket = document.getElementById('modalNuevoTicket');
        if (modalNuevoTicket) {
            const modal = new bootstrap.Modal(modalNuevoTicket);
            modal.show();
        }
    });
};


// ===================== GUARDAR TICKET =====================
const initGuardarTicket = () => {
    const btnGuardar = document.getElementById('btnGuardarTicket');

    btnGuardar?.addEventListener('click', async () => {
        const asunto = document.getElementById('asunto').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const nombre = "";
        const categoriaId = document.getElementById('categoria').value;

        btnGuardar.disabled = true;
        await crearNuevoTicket({
            asunto,
            descripcion,
            fecha,
            nombre,
            categoriaId,
            formId: 'formNuevoTicket',
            modalId: 'modalNuevoTicket'
        });

        // Refrescar tabla luego de guardar
        $('#ticketsTable').DataTable().destroy();
        await obtainTickets();
        btnGuardar.disabled = false;
    });
};


const deleteTicket = async (row) => {
    try {
        if (!row || !row.ticketId) {
            mostrarToast("No se encontró el ticket para eliminar.", "danger");
            return;
        }

        const confirmacion = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `El ticket #${row.ticketId} será eliminado.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) {
            mostrarToast("Cancelaste la eliminación del ticket.", "secondary");
            return;
        }

        const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split('.')[1]));

        const payload = {
            ticketId: row.ticketId,
            title: row.title,
            description: row.description,
            problem: row.problem,
            priority: row.priority,
            status: row.status,
            createdBy: row.createdBy,
            createdByName: row.createdByName || "",
            assignedTo: row.assignedTo,
            assignedToName: row.assignedToName || "",
            categoryId: row.categoryId,
            categoryName: row.categoryName || "",
            suggestedAgent: row.suggestedAgent || "",
            reasoning: row.reasoning || "",
            solution: row.solution || "",
            keywords: row.keywords || "",
            classifiedByML: row.classifiedByML,
            changedBy: tokenPayload.nameid,
            changedByName: tokenPayload.unique_name || "",
            createdAt: row.createdAt,
            changeDate: new Date().toISOString(),
            state: 0,
            newTicketId: 0,
            success: 0
        };

        const response = await sendData(TICKETS_API, "DELETE", payload, obtainHeaders());

        if (response?.data?.success === 1) {
            mostrarToast(response?.message || "Ticket eliminado correctamente.", "success");
            await obtainTickets();
        } else {
            mostrarToast(response?.message || "No se pudo eliminar el ticket.", "danger");
        }
    } catch (error) {
        mostrarToast(error.message || "Ocurrió un error al eliminar el ticket.", "danger");
    }
};


window.deleteTicket = deleteTicket;


// ===================== INICIALIZACIÓN =====================
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById("btnCloseSession")?.addEventListener("click", closeSession);
    await checkTokenAndLoginInfo();
    await obtainMenu();
    await obtainTickets();
    await obtainCategories();
    initUI();
    initGuardarTicket();
});