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
    loadingCard.innerHTML = `<strong>Bot:</strong><br>Espera un momento, el bot está trabajando en una respuesta...`;
    document.getElementById('responseArea').prepend(loadingCard);
}

// Mostrar mensajes de advertencia o error
function mostrarAviso(tipo, mensaje) {
    const aviso = document.createElement('div');
    aviso.className = `message-card bg-${tipo} ${tipo === 'danger' ? 'text-white' : 'text-dark'}`;
    aviso.innerHTML = `<strong>Bot:</strong><br>${mensaje}`;
    document.getElementById('responseArea').prepend(aviso);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Contador de mensajes
    sessionStorage.setItem('contadorMensajes', sessionStorage.getItem('contadorMensajes') || '0');

    // Lógica del formulario
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
            console.error("Error:", error);
        }
    });

    // Asignar fecha por defecto si el input existe
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        fechaInput.value = `${year}-${month}-${day}`;
    }

    // Mostrar modal de nuevo ticket
    const btnNuevoTicket = document.querySelector('button.btn.btn-secondary');
    const modalNuevoTicket = document.getElementById('modalNuevoTicket');
    if (btnNuevoTicket && modalNuevoTicket) {
        btnNuevoTicket.addEventListener('click', () => {
            const modal = new bootstrap.Modal(modalNuevoTicket);
            modal.show();
        });
    }

    // Clasificar ticket al guardarlo desde modal
    const btnGuardar = document.querySelector('#modalNuevoTicket .modal-footer .btn.btn-secondary:last-child');
    btnGuardar?.addEventListener('click', async () => {
        const asunto = document.getElementById('asunto').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!asunto || !descripcion) {
            alert('Por favor completa el asunto y la descripción.');
            return;
        }

        try {
            const resultadoIA = await clasificarTicketIA(asunto, descripcion);
            sessionStorage.setItem('ticketClasificado', JSON.stringify(resultadoIA));
            alert(`Ticket clasificado como: ${resultadoIA.prioridad}\nCategoría sugerida: ${resultadoIA.categoria}`);
            console.log("Resultado IA:", resultadoIA);
        } catch (error) {
            console.error("Error al clasificar el ticket:", error);
            alert("Ocurrió un error al contactar con la IA. Intenta nuevamente más tarde.");
        }
    });
});