// Importar rutas de APIs para hacer uso de ellas
import {ROLES_API, TICKETS_API, TICKETS_GET_BY_ID_API} from '../config/constants.js';
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

                // Mostrar solución como lista
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



// Selector dinámico de agentes por nivel
const agentesPorNivel = {
    junior: ["Luis Pérez", "Andrea Gómez", "Carlos Soto"],
    mid: ["Mario Cifuentes", "Lucía Ramírez"],
    senior: ["Laura León", "Fernando Díaz"]
};

const inicializarSelectorAgente = () => {
    const selectNivel = document.getElementById("nivelSoporte");
    if (!selectNivel) return;

    selectNivel.addEventListener("change", function () {
        const nivel = this.value;
        const selectAgente = document.getElementById("agenteSoporte");
        selectAgente.innerHTML = '<option disabled selected>Seleccionar agente</option>';
        agentesPorNivel[nivel].forEach(nombre => {
            const option = document.createElement("option");
            option.textContent = nombre;
            option.value = nombre;
            selectAgente.appendChild(option);
        });
    });
};

// Mostrar/ocultar sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

// Cuando carga el DOM
document.addEventListener("DOMContentLoaded", async () => {
    const btnCerrarSesion = document.getElementById("btnCloseSession");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }

    await checkTokenAndLoginInfo();
    await obtainTicketDetail();
    inicializarSelectorAgente();
});