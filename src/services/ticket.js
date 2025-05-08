// ticket.js
import {clasificarTicketIA} from "./iaml.js";

const fechaInput = document.getElementById('fecha');
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
fechaInput.value = `${year}-${month}-${day}`;

// Mostrar el modal al presionar "Nuevo Ticket"
document.querySelector('button.btn.btn-secondary').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalNuevoTicket'));
    modal.show();
});

// Guardar ticket y clasificar con IA
document.querySelector('#modalNuevoTicket .modal-footer .btn.btn-secondary:last-child')
    .addEventListener('click', async () => {
        const asunto = document.getElementById('asunto').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!asunto || !descripcion) {
            return;
        }

        try {
            const resultadoIA = await clasificarTicketIA(asunto, descripcion);
            sessionStorage.setItem('ticketClasificado', JSON.stringify(resultadoIA));

            // Aquí podrías insertar el ticket en la tabla o redirigir al listado
        } catch (error) {
            console.error("Error al clasificar el ticket:", error);
        }

    });