// Importar rutas de APIs para hacer uso de ellas
import {ROLES_API, USERS_API, TICKETS_GET_BY_ID_API, CATEGORY_API, TICKETS_API} from '../config/constants.js';
import {showSuccess, showError, showAlert, showConfirmation} from '../utils/sweetAlert.js';
import {fetchData, fetchDataToken, sendData} from '../data/apiMethods.js';
import {verificarToken} from "../utils/tokenValidation.js";
import {mostrarToast} from "../utils/toast.js";

// Función para cerrar sesión
const removeAllSessionStorage = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("apiKeyIndex");
    sessionStorage.removeItem("contadorMensajes");
    sessionStorage.removeItem("modelIndex");
    sessionStorage.removeItem("ticketClasificado"); // ya no se usa, pero lo dejamos por limpieza
    window.location.href = "../../../index.html";
};

const closeSession = () => {
    try {
        removeAllSessionStorage();
    } catch (error) {
        showError("Error al cerrar sesión:", error);
    }
};

// Validación del token
const checkTokenAndLoginInfo = async () => {
    const token = sessionStorage.getItem("token");
    const isValid = await verificarToken(token);

    if (isValid) {
        console.log("OK");
    } else {
        mostrarToast("Sesión inválida.", "danger");
        removeAllSessionStorage();
    }
};

// Obtener headers
const obtainHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        closeSession();
        return null;
    }
    return {"Authorization": `Bearer ${token}`};
};


// Obtener detalle del ticket
const obtainTicketDetail = async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const idTicket = urlParams.get("q").toString();
        document.getElementById("ticketNumber").textContent = idTicket || "Sin número de ticket";

        const response = await fetchData(TICKETS_GET_BY_ID_API(idTicket), "GET", obtainHeaders());

        if (response && response.data) {
            const ticket = response.data;

            // Datos generales del ticket
            document.getElementById("ticket-title").textContent = ticket.title || "Sin asunto";
            document.getElementById("ticket-description").textContent = ticket.description || "Sin descripción";
            document.getElementById("ticket-status").textContent = ticket.status || "Sin estado";
            document.getElementById("ticket-created-by").textContent = ticket.createdByName || "Desconocido";
            document.getElementById("ticket-date").textContent = new Date(ticket.createdAt).toLocaleString("es-GT");
            document.getElementById("ticket-assigned-to").textContent = ticket.assignedToName || "Sin asignar";
            document.getElementById("ticket-category").textContent = ticket.categoryName || "Sin categoría";
            document.getElementById("estado").value = ticket.status || "New";

            // Prioridad visual
            const prioridadTag = document.getElementById("ticket-priority");
            const prioridad = ticket.priority ? ticket.priority.toLowerCase() : "";
            prioridadTag.textContent = ticket.priority?.toUpperCase() || "SIN DEFINIR";

            prioridadTag.classList.remove("priority-low", "priority-medium", "priority-high", "priority-critical");

            if (prioridad === "baja") {
                prioridadTag.classList.add("priority-low");
            } else if (prioridad === "media") {
                prioridadTag.classList.add("priority-medium");
            } else if (prioridad === "alta") {
                prioridadTag.classList.add("priority-high");
            } else if (prioridad === "critica") {
                prioridadTag.classList.add("priority-critical");
            } else {
                prioridadTag.classList.add("bg-secondary", "text-white");
            }

            // Datos del bot (IA)
            if (ticket.classifiedByML) {
                document.getElementById("bot-agent").textContent = ticket.suggestedAgent?.toUpperCase() || "NO DETECTADO";
                document.getElementById("bot-reasoning").textContent = ticket.reasoning || "Sin razonamiento";

                const solucionList = document.getElementById("bot-solution");
                solucionList.innerHTML = "";

                if (ticket.solution && ticket.solution.trim() !== "") {
                    const pasos = ticket.solution.split(". ");
                    for (let i = 0; i < pasos.length; i++) {
                        if (pasos[i].trim() !== "") {
                            const li = document.createElement("li");
                            li.textContent = pasos[i].trim();
                            solucionList.appendChild(li);
                        }
                    }
                } else {
                    const li = document.createElement("li");
                    li.textContent = "Sin pasos sugeridos";
                    solucionList.appendChild(li);
                }

                // Mostrar keywords como lista
                const keywordsList = document.getElementById("bot-keywords");
                keywordsList.innerHTML = "";
                if (ticket.keywords && ticket.keywords.trim() !== "") {
                    const palabras = ticket.keywords.split(",");
                    for (let i = 0; i < palabras.length; i++) {
                        const palabra = palabras[i].trim();
                        if (palabra !== "") {
                            const li = document.createElement("li");
                            li.textContent = palabra;
                            keywordsList.appendChild(li);
                        }
                    }
                } else {
                    const li = document.createElement("li");
                    li.textContent = "No se detectaron palabras clave";
                    keywordsList.appendChild(li);
                }
            }

        } else {
            mostrarToast("No se trajeron datos del ticket.", "warning");
        }

    } catch (error) {
        mostrarToast(error, "danger");
    }
};


const inicializarSelectorAgente = async () => {
    const selectNivel = document.getElementById("nivelSoporte");
    const selectAgente = document.getElementById("agenteSoporte");
    if (!selectNivel || !selectAgente) return;

    let agentes = [];

    try {
        const response = await fetchData(USERS_API, "GET", obtainHeaders());
        if (response?.data) {
            agentes = response.data.filter(user =>
                user.seniorityLevel && user.isActive === 1
            );
        }
    } catch (error) {
        console.error("Error obteniendo agentes:", error);
        return;
    }

    // Evento al cambiar el nivel
    selectNivel.addEventListener("change", () => {
        const nivel = selectNivel.value.toUpperCase(); // match con el campo `seniorityLevel`
        selectAgente.innerHTML = '<option value="" disabled selected>Seleccionar agente</option>';

        // Filtrar por nivel de forma segura
        const filtrados = agentes.filter(a =>
            a.seniorityLevel?.trim().toUpperCase() === nivel.trim().toUpperCase()
        );

        if (filtrados.length === 0) {
            const opt = document.createElement("option");
            opt.disabled = true;
            opt.textContent = "No hay agentes disponibles";
            selectAgente.appendChild(opt);
            return;
        }

        // Agregar opciones
        filtrados.forEach(agent => {
            const option = document.createElement("option");
            option.value = agent.userId;
            option.textContent = agent.name;
            selectAgente.appendChild(option);
        });
    });
};


const manualAgentAssign = async () => {
    try {
        const nivelSoporte = document.getElementById("nivelSoporte").value;
        const agenteSoporte = document.getElementById("agenteSoporte").value;
        const agenteSoporteNombre = document.getElementById("agenteSoporte").selectedOptions[0].text;
        const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split('.')[1]));
        const changedBy = parseInt(tokenPayload.nameid || tokenPayload.userId);

        if (!nivelSoporte || !agenteSoporte) {
            mostrarToast("Todos los datos son obligatorios.", "danger");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get("q");

        const responseDetalle = await fetchData(TICKETS_GET_BY_ID_API(ticketId), "GET", obtainHeaders());

        if (!responseDetalle || !responseDetalle.data) {
            mostrarToast("No se pudo obtener el detalle del ticket.", "danger");
            return;
        }

        const ticket = responseDetalle.data;

        const payload = {
            ticketId: ticket.ticketId,
            title: ticket.title,
            description: ticket.description,
            problem: ticket.problem,
            priority: ticket.priority,
            status: ticket.status,
            createdBy: ticket.createdBy,
            createdByName: ticket.createdByName,
            assignedTo: parseInt(agenteSoporte),
            assignedToName: agenteSoporteNombre,
            categoryId: ticket.categoryId,
            categoryName: ticket.categoryName,
            suggestedAgent: ticket.suggestedAgent,
            reasoning: ticket.reasoning,
            solution: ticket.solution,
            keywords: ticket.keywords,
            classifiedByML: ticket.classifiedByML,
            changedBy: changedBy,
            changedByName: ticket.createdByName,
            createdAt: ticket.createdAt,
            changeDate: new Date().toISOString(),
            state: ticket.state,
            newTicketId: ticket.newTicketId ?? 0,
            success: ticket.success ?? 0
        };

        const updateResponse = await sendData(TICKETS_API, "PUT", payload, obtainHeaders());

        if (updateResponse?.data?.success === 1) {
            mostrarToast("Agente asignado de manera manual correctamente.", "success");
            await obtainTicketDetail();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAsignarAgente'));
            modal.hide();
        } else {
            mostrarToast("No se pudo reasignar el agente de manera manual.", "danger");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error al asignar agente: " + error.message, "danger");
    }
};


const actualizarEstadoTicket = async () => {
    try {
        const nuevoEstado = document.getElementById("estado").value;
        const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split('.')[1]));
        const changedBy = parseInt(tokenPayload.nameid || tokenPayload.userId);

        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get("q");

        const responseDetalle = await fetchData(TICKETS_GET_BY_ID_API(ticketId), "GET", obtainHeaders());

        if (!responseDetalle || !responseDetalle.data) {
            mostrarToast("No se pudo obtener el detalle del ticket.", "danger");
            return;
        }

        const ticket = responseDetalle.data;

        const payload = {
            ticketId: ticket.ticketId,
            title: ticket.title,
            description: ticket.description,
            problem: ticket.problem,
            priority: ticket.priority,
            status: nuevoEstado,
            createdBy: ticket.createdBy,
            createdByName: ticket.createdByName,
            assignedTo: ticket.assignedTo,
            assignedToName: ticket.assignedToName,
            categoryId: ticket.categoryId,
            categoryName: ticket.categoryName,
            suggestedAgent: ticket.suggestedAgent,
            reasoning: ticket.reasoning,
            solution: ticket.solution,
            keywords: ticket.keywords,
            classifiedByML: ticket.classifiedByML,
            changedBy: changedBy,
            changedByName: ticket.createdByName,
            createdAt: ticket.createdAt,
            changeDate: new Date().toISOString(),
            state: ticket.state,
            newTicketId: ticket.newTicketId ?? 0,
            success: ticket.success ?? 0
        };

        const updateResponse = await sendData(TICKETS_API, "PUT", payload, obtainHeaders());

        if (updateResponse?.data?.success === 1) {
            mostrarToast("Estado del ticket actualizado correctamente.", "success");
            await obtainTicketDetail();
        } else {
            mostrarToast("No se pudo actualizar el estado del ticket.", "danger");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error al actualizar estado: " + error.message, "danger");
    }
};


// Mostrar/ocultar sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

// Cuando carga el DOM
document.addEventListener("DOMContentLoaded", async () => {
    const btnCerrarSesion = document.getElementById("btnCloseSession");
    const btnAgentAssign = document.getElementById("btnAgentAssign");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }
    if (btnAgentAssign) {
        btnAgentAssign.addEventListener("click", manualAgentAssign);
    }

    const estadoSelect = document.getElementById("estado");
    if (estadoSelect) {
        estadoSelect.addEventListener("change", actualizarEstadoTicket);
    }

    await checkTokenAndLoginInfo();
    await obtainTicketDetail();
    await inicializarSelectorAgente();
});