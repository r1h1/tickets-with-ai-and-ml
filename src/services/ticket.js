// ===================== IMPORTACIONES =====================
import { clasificarTicketIA } from './iaml.js';
import { TICKETS_API, TICKETS_GET_BY_ID_API } from '../config/constants.js';
import { showSuccess, showError, showAlert, showConfirmation } from '../utils/sweetAlert.js';
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';
import { verificarToken } from '../utils/tokenValidation.js';
import { mostrarToast } from '../utils/toast.js';

const removeAllSessionStorage = async () => {
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
        const nombre = document.getElementById('nombre').value;

        if (!fecha || !nombre || !asunto || !descripcion) {
            mostrarToast('Todos los campos son obligatorios.', 'warning');
            return;
        }

        btnGuardar.disabled = true;
        const toastId = mostrarToast("Analizando ticket y cargando resultados, espere un momento...", "secondary", true);

        try {
            const resultado = await clasificarTicketIA(asunto, descripcion);
            if (toastId) toastId.remove();

            if (
                resultado.razonamiento === 'El bot no respondió. Se creó el ticket con prioridad media.' ||
                resultado.razonamiento === 'Error inesperado en el bot. Se creó el ticket con prioridad media.'
            ) {
                mostrarToast('El ticket fue creado, pero debe ser clasificado manualmente.', 'warning');
            } else {
                mostrarToast(`Ticket creado correctamente, se clasificó como ${resultado.prioridad} y se otorgó una lista de pasos para el equipo de soporte.`, 'success');
            }

            const modalElement = document.getElementById('modalNuevoTicket');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();

            // (Opcional) Limpiar campos
            document.getElementById('formNuevoTicket').reset();

        } catch (error) {
            if (toastId) toastId.remove();
            mostrarToast('Error inesperado al procesar el ticket.', 'danger');
        } finally {
            btnGuardar.disabled = false;
        }
    });
};


// ===================== INICIALIZACIÓN =====================
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById("btnCloseSession")?.addEventListener("click", closeSession);
    await checkTokenAndLoginInfo();
    initUI();
    initGuardarTicket();
});