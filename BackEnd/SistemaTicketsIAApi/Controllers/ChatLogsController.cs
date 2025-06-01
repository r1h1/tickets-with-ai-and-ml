using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using Microsoft.Data.SqlClient;

namespace SistemaTicketsIAApi.Controllers
{
    [Route("tickets/v1/[controller]")]
    [ApiController]
    public class ChatLogController : ControllerBase
    {
        private readonly ChatLogData _chatLogData;

        public ChatLogController(ChatLogData chatLogData)
        {
            _chatLogData = chatLogData;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerPorTicketId()
        {
            try
            {
                List<ChatLog> lista = await _chatLogData.ObtenerPorTicketId();

                if (lista == null || !lista.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontraron logs.",
                        data = new List<ChatLog>()
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Logs obtenidos correctamente.",
                    data = lista
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al obtener logs.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al obtener logs.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            try
            {
                ChatLog? log = await _chatLogData.ObtenerPorId(id);

                if (log == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Log no encontrado.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Log obtenido correctamente.",
                    data = log
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al obtener el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al obtener el log.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] ChatLog modelo)
        {
            try
            {
                modelo = await _chatLogData.Crear(modelo);

                if (modelo.Success == 1)
                {
                    return StatusCode(StatusCodes.Status201Created, new
                    {
                        success = true,
                        message = "Log creado exitosamente.",
                        data = modelo
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo crear el log.",
                    data = (object)null
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al crear el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al crear el log.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Editar([FromBody] ChatLog modelo)
        {
            try
            {
                modelo = await _chatLogData.Editar(modelo);

                if (modelo.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Log editado exitosamente.",
                        data = modelo
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo editar el log.",
                    data = (object)null
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al editar el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al editar el log.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar([FromBody] ChatLog modelo)
        {
            try
            {
                modelo = await _chatLogData.Eliminar(modelo);

                if (modelo.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Log eliminado exitosamente.",
                        data = modelo
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo eliminar el log.",
                    data = (object)null
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error SQL al eliminar el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al eliminar el log.",
                    error = ex.Message
                });
            }
        }
    }
}