using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using Microsoft.Data.SqlClient;

namespace SistemaTicketsIAApi.Controllers
{
    [Route("tickets/v1/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly TicketsData _ticketsData;

        public TicketsController(TicketsData ticketsData)
        {
            _ticketsData = ticketsData;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodosLosTickets()
        {
            try
            {
                var lista = await _ticketsData.ObtenerTodosLosTickets();

                if (lista == null || !lista.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontraron tickets.",
                        data = new List<Ticket>()
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Tickets obtenidos correctamente.",
                    data = lista
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al obtener tickets.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al obtener tickets.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerTicketPorId(int id)
        {
            try
            {
                var ticket = await _ticketsData.ObtenerTicketPorId(id);

                if (ticket == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontró el ticket.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Ticket obtenido correctamente.",
                    data = ticket
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al obtener el ticket.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al obtener el ticket.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CrearNuevoTicket([FromBody] Ticket ticket)
        {
            try
            {
                ticket = await _ticketsData.CrearNuevoTicket(ticket);

                if (ticket.Success == 1)
                {
                    return StatusCode(StatusCodes.Status201Created, new
                    {
                        success = true,
                        message = "Ticket creado exitosamente.",
                        data = ticket
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo crear el ticket.",
                    data = (object)null
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al crear el ticket.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al crear el ticket.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        public async Task<IActionResult> EditarTicket([FromBody] Ticket ticket)
        {
            try
            {
                ticket = await _ticketsData.EditarTicket(ticket);

                if (ticket.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Ticket editado exitosamente.",
                        data = ticket
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo editar el ticket.",
                    data = (object)null
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al editar el ticket.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al editar el ticket.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> EliminarTicket([FromBody] Ticket ticket)
        {
            try
            {
                ticket = await _ticketsData.EliminarTicket(ticket);

                if (ticket.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Ticket eliminado exitosamente.",
                        data = ticket
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo eliminar el ticket.",
                    data = (object)null
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al eliminar el ticket.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al eliminar el ticket.",
                    error = ex.Message
                });
            }
        }
    }
}