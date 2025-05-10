import { contienePalabraTecnica, consultarBotIA, clasificarTicketIA } from "./iaml.js";

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

// Toast container y notificaciones visuales
const crearToastContainer = () => {
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
        toastContainer.style.zIndex = '1100';
        document.body.appendChild(toastContainer);
    }
};

const mostrarToast = (mensaje, tipo = 'danger') => {
    crearToastContainer();
    const toastWrapper = document.createElement('div');
    toastWrapper.className = 'toast align-items-center text-white border-0 show';

    const colorMap = {
        success: 'bg-success',
        warning: 'bg-warning text-dark',
        danger: 'bg-danger',
        info: 'bg-info text-dark'
    };

    toastWrapper.classList.add(colorMap[tipo] || 'bg-secondary');

    toastWrapper.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild(toastWrapper);

    setTimeout(() => {
        toastWrapper.remove();
    }, 8000);
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    sessionStorage.setItem('contadorMensajes', sessionStorage.getItem('contadorMensajes') || '0');

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

    const btnNuevoTicket = document.querySelector('button.btn.btn-secondary');
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
        const nombre = document.getElementById('nombre').value;

        if (!fecha || !nombre || !asunto || !descripcion) {
            mostrarToast('Todos los campos son obligatorios.', 'warning');
            return;
        }

        try {
            const resultado = await clasificarTicketIA(asunto, descripcion);
            sessionStorage.setItem('ticketClasificado', JSON.stringify(resultado));

            if (
                resultado.razonamiento === 'El modelo de IA no respondió. Resolver manualmente.' ||
                resultado.razonamiento === 'Error inesperado en la petición IA. Resolver manualmente.'
            ) {
                mostrarToast('El ticket fue creado, pero debe ser clasificado manualmente.', 'warning');
            } else {
                mostrarToast(`Ticket creado correctamente, se clasificó como ${resultado.prioridad} 
                y se otorgó una lista de pasos para el equipo de soporte.`, 'success');
            }

            const modalElement = document.getElementById('modalNuevoTicket');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();

        } catch (error) {
            mostrarToast('Error inesperado al procesar el ticket.', 'danger');
        }
    });
});