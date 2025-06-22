import {clasificarTicketIA} from './iaml.js';
import {mostrarToast} from '../utils/toast.js';
import {TICKETS_API, USERS_API} from '../config/constants.js';
import {sendData, fetchData} from '../data/apiMethods.js';

const obtenerAgentePorPrioridad = async (prioridad) => {
    try {
        const res = await fetchData(USERS_API, 'GET');
        const usuarios = res?.data || [];

        const prioridadToSeniority = {
            'crítica': 'SOPORTE SENIOR',
            'alta': 'SOPORTE SENIOR',
            'media': 'SOPORTE MEDIO',
            'baja': 'SOPORTE JUNIOR'
        };

        const nivel = prioridadToSeniority[prioridad?.toLowerCase()] || 'SOPORTE JUNIOR';

        const candidatos = usuarios.filter(u =>
            u.isActive === 1 &&
            u.seniorityLevel?.toUpperCase() === nivel.toUpperCase()
        );

        return candidatos.length > 0
            ? candidatos[Math.floor(Math.random() * candidatos.length)]
            : null;

    } catch (err) {
        console.error("Error al seleccionar agente:", err);
        return null;
    }
};

export const crearNuevoTicket = async ({asunto, descripcion, fecha, categoriaId, formId, modalId}) => {
    if (!fecha || !asunto || !descripcion) {
        mostrarToast('Todos los campos son obligatorios.', 'warning');
        return;
    }

    const toastCargando = mostrarToast("Analizando ticket y cargando resultados, espere un momento...", "secondary", true);

    try {
        const tokenPayload = JSON.parse(atob(sessionStorage.getItem("token").split('.')[1]));
        const createdBy = parseInt(tokenPayload.nameid || tokenPayload.userId);
        const createdByName = tokenPayload.name ?? '';

        const resultado = await clasificarTicketIA(asunto, descripcion);
        toastCargando?.remove();

        const agente = await obtenerAgentePorPrioridad(resultado.prioridad);

        const payload = {
            ticketId: 0,
            title: asunto,
            description: descripcion,
            problem: resultado.problema || descripcion,
            priority: resultado.prioridad || 'Media',
            status: 'Nuevo',
            createdBy,
            createdByName,
            assignedTo: agente?.userId ?? null,
            assignedToName: agente?.name ?? '',
            categoryId: categoriaId ?? 1,
            categoryName: resultado.categoria ?? '',
            suggestedAgent: resultado.agente_sugerido ?? '',
            reasoning: resultado.razonamiento ?? '',
            solution: (resultado.solucion || resultado.pasos || []).join('\n'),
            keywords: (resultado.keywords_detectadas || resultado.keywords || []).join(', '),
            classifiedByML: true,
            changedBy: null,
            changedByName: '',
            createdAt: new Date().toISOString(),
            changeDate: null,
            state: 1,
            newTicketId: null,
            success: null
        };

        const res = await sendData(TICKETS_API, 'POST', payload);
        const exito = res?.data?.success === 1;

        if (exito) {
            mostrarToast(`Ticket creado correctamente y asignado a ${payload.assignedToName || 'ningún agente aún'}.`, 'success');
            await obtainTickets();
        } else {
            mostrarToast('Ticket creado, pero no fue posible asignar correctamente.', 'warning');
        }

        const modalElement = document.getElementById(modalId);
        bootstrap.Modal.getInstance(modalElement)?.hide();
        document.getElementById(formId)?.reset();

    } catch (error) {
        toastCargando?.remove();
        mostrarToast('Error inesperado al procesar el ticket.', 'danger');
        console.error(error);
    }
};


const obtainHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        return null;
    }
    //retorna el token
    return {"Authorization": `Bearer ${token}`};
};


const obtainTickets = async () => {
    try {
        const response = await fetchData(TICKETS_API, "GET", obtainHeaders());

        if (response && response.data) {
            $('#ticketsTable').DataTable({
                destroy: true,
                data: response.data,
                columns: [
                    {
                        data: "ticketId",
                        title: "No. de Ticket",
                        render: function (data, type, row) {
                            return `<a href="detalle_ticket.html?q=${data}" class="fw-bold text-primary">${data}</a>`;
                        }
                    },
                    {
                        data: "createdAt",
                        title: "Fecha",
                        render: data => new Date(data).toLocaleString()
                    },
                    {data: "createdByName", title: "Nombre"},
                    {data: "title", title: "Asunto"},
                    {data: "status", title: "Estado"},
                    {
                        data: "changeDate",
                        title: "Última respuesta",
                        render: data => new Date(data).toLocaleString()
                    },
                    {
                        data: "priority",
                        title: "Prioridad",
                        render: function (data) {
                            let className = "";

                            switch (data.toLowerCase()) {
                                case "crítica":
                                case "critica":
                                case "critical":
                                    className = "priority-critical";
                                    break;
                                case "alta":
                                case "high":
                                    className = "priority-high";
                                    break;
                                case "media":
                                case "medium":
                                    className = "priority-medium";
                                    break;
                                case "baja":
                                case "low":
                                    className = "priority-low";
                                    break;
                                default:
                                    className = "priority-low";
                            }

                            return `<span class="priority-tag ${className}">${data}</span>`;
                        }
                    },
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                                    <button onclick="deleteTicket(${row.ticketId})" class="btn btn-danger">Eliminar</button>
                                    `;
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
}