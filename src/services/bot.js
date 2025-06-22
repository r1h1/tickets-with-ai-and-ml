// Se importan palabras y consultas para que el bot pueda resolver
// MISMO DIRECTORIO
import { contienePalabraTecnica, consultarBotIA, clasificarTicketIA } from './iaml.js';
import {CATEGORY_API, CATEGORY_GET_BY_ID_API} from '../config/constants.js';
import { crearNuevoTicket } from './ticketCreator.js';
import { fetchData, fetchDataToken, sendData } from '../data/apiMethods.js';
import { mostrarToast } from '../utils/toast.js';
import { showError } from '../utils/sweetAlert.js';
import { verificarToken } from '../utils/tokenValidation.js';


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


const obtainHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        closeSession();
        return null;
    }
    //retorna el token
    return {"Authorization": `Bearer ${token}`};
};

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

// Sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

// Resetear vista del bot
function resetTicket() {
    document.getElementById('mensaje').value = '';
    document.getElementById('responseArea').innerHTML = '';
    sessionStorage.setItem('contadorMensajes', '0');
}
window.resetTicket = resetTicket;

// Mostrar mensaje del usuario
function mostrarMensajeUsuario(mensaje) {
    const userCard = document.createElement('div');
    userCard.className = 'message-card';
    userCard.innerHTML = `<strong>Tu consulta:</strong><br>${mensaje}`;
    document.getElementById('responseArea').prepend(userCard);
    document.getElementById('mensaje').value = '';
}

// Mostrar animación de carga
function mostrarCargando() {
    const loadingCard = document.createElement('div');
    loadingCard.className = 'message-card bg-light border';
    loadingCard.id = 'loadingCard';
    loadingCard.innerHTML = `<strong>Bot:</strong><br>Espera un momento, el bot está trabajando en una respuesta, esto puede demorar bastante tiempo, ¡ten paciencia!...`;
    document.getElementById('responseArea').prepend(loadingCard);
}

// Mostrar mensajes de advertencia o error
function mostrarAviso(tipo, mensaje) {
    const aviso = document.createElement('div');
    aviso.className = `message-card bg-${tipo} ${tipo === 'danger' ? 'text-white' : 'text-dark'}`;
    aviso.innerHTML = `<strong>Bot:</strong><br>${mensaje}`;
    document.getElementById('responseArea').prepend(aviso);
}


// Retornar categorias creadas
const obtainCategories = async () => {
    try {
        const response = await fetchData(CATEGORY_API, "GET", obtainHeaders());

        if (response) {
            const categoria = document.getElementById('categoria');
            categoria.innerHTML = '<option value="">Selecciona una categoría...</option>';

            response.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryId;
                option.textContent = category.name;
                categoria.appendChild(option);
            });
        } else {
            mostrarToast("No se trajeron las categorias.", "warning");
        }
    } catch (error) {
        mostrarToast(error, "danger");
    }
}


// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    sessionStorage.setItem('contadorMensajes', sessionStorage.getItem('contadorMensajes') || '0');

    // Variables
    const btnCerrarSesion = document.getElementById("btnCloseSession");

    // Onclicks a ejecutarse
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", closeSession);
    }

    // Funciones a ejecutarse
    await checkTokenAndLoginInfo();
    await obtainCategories();

    document.getElementById('formBot')?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const mensaje = document.getElementById('mensaje').value.trim();
        const cantidadPalabras = mensaje.split(/\s+/).filter(Boolean).length;
        const contador = parseInt(sessionStorage.getItem('contadorMensajes'));

        if (contador >= 3) {
            mostrarAviso('warning', 'Has llegado al límite de consultas por hoy. Por favor crea un nuevo ticket para recibir ayuda de un agente humano.');
            return;
        }

        if (cantidadPalabras < 8 || !contienePalabraTecnica(mensaje)) {
            mostrarAviso('warning', 'Por favor describe tu problema técnico con al menos 8 palabras e incluye alguna palabra clave técnica (ej. windows, wifi, router, disco, antivirus...)');
            return;
        }

        mostrarMensajeUsuario(mensaje);
        mostrarCargando();

        try {
            const respuesta = await consultarBotIA(mensaje);
            document.getElementById('loadingCard')?.remove();

            const botCard = document.createElement('div');
            botCard.className = 'message-card bg-light border';
            botCard.innerHTML = `<strong>Bot:</strong><br>${respuesta}`;
            document.getElementById('responseArea').prepend(botCard);

            sessionStorage.setItem('contadorMensajes', (contador + 1).toString());
        } catch (error) {
            document.getElementById('loadingCard')?.remove();
            mostrarAviso('danger', 'Error al contactar al bot. Intenta de nuevo más tarde.');
        }
    });

    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        fechaInput.value = `${year}-${month}-${day}`;
    }

    const btnNuevoTicket = document.getElementById('btnNuevoTicket');
    const modalNuevoTicket = document.getElementById('modalNuevoTicket');
    if (btnNuevoTicket && modalNuevoTicket) {
        btnNuevoTicket.addEventListener('click', () => {
            const modal = new bootstrap.Modal(modalNuevoTicket);
            modal.show();
        });
    }

    const btnGuardar = document.querySelector('#modalNuevoTicket .modal-footer .btn.btn-secondary:last-child');
    btnGuardar?.addEventListener('click', async () => {
        const asunto = document.getElementById('asunto').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fecha').value;
        const categoriaId = document.getElementById('categoria').value;
        const nombre = "";

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
        btnGuardar.disabled = false;
    });
});