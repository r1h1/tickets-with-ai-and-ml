import { clasificarTicketIA } from './iaml.js';
import { mostrarToast } from '../utils/toast.js';

export const crearNuevoTicket = async ({ asunto, descripcion, fecha, nombre, formId, modalId }) => {
    if (!fecha || !nombre || !asunto || !descripcion) {
        mostrarToast('Todos los campos son obligatorios.', 'warning');
        return;
    }

    const toastCargando = mostrarToast("Analizando ticket y cargando resultados, espere un momento...", "secondary", true);

    try {
        const resultado = await clasificarTicketIA(asunto, descripcion);
        toastCargando?.remove();

        sessionStorage.setItem('ticketClasificado', JSON.stringify(resultado));

        if (
            resultado.razonamiento === 'El modelo de IA no respondió. Resolver manualmente.' ||
            resultado.razonamiento === 'Error inesperado en la petición IA. Resolver manualmente.'
        ) {
            mostrarToast('El ticket fue creado, pero debe ser clasificado manualmente.', 'warning');
        } else {
            mostrarToast(`Ticket creado correctamente, se clasificó como ${resultado.prioridad} y se otorgó una lista de pasos para el equipo de soporte.`, 'success');
        }

        const modalElement = document.getElementById(modalId);
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance?.hide();

        document.getElementById(formId)?.reset();
    } catch (error) {
        toastCargando?.remove();
        mostrarToast('Error inesperado al procesar el ticket.', 'danger');
    }
};