// Este script debe agregarse al archivo ticket.js o equivalente
import { clasificarTicketIA } from './iaml.js';

// Crear un contenedor de toast si no existe
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

// Asignar fecha por defecto
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    fechaInput.value = `${year}-${month}-${day}`;
}

// Mostrar modal al presionar "Nuevo Ticket"
document.querySelector('button.btn.btn-secondary')?.addEventListener('click', () => {
    const modalNuevoTicket = document.getElementById('modalNuevoTicket');
    if (modalNuevoTicket) {
        const modal = new bootstrap.Modal(modalNuevoTicket);
        modal.show();
    }
});

// Guardar ticket y mostrar resultado IA
const formNuevoTicket = document.getElementById('formNuevoTicket');
const guardarBtn = document.querySelector('#modalNuevoTicket .btn.btn-secondary:last-child');

if (guardarBtn) {
    guardarBtn.addEventListener('click', async () => {
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

            if (
                resultado.razonamiento === 'El bot no respondió. Se creó el ticket con prioridad media.' ||
                resultado.razonamiento === 'Error inesperado en el bot. Se creó el ticket con prioridad media.'
            ) {
                mostrarToast('El ticket fue creado, pero debe ser clasificado manualmente.', 'warning');
            } else {
                mostrarToast(`Ticket creado correctamente, se clasificó como ${resultado.prioridad} y se
                otorgó una lista de pasos para el equipo de soporte.`, 'success');
            }

            // Cerrar modal
            const modalElement = document.getElementById('modalNuevoTicket');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();

        } catch (error) {
            mostrarToast('Error inesperado al procesar el ticket.', 'danger');
        }
    });
}