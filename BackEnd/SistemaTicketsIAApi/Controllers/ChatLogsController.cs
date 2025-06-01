using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize]
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
                    message = "Error de base de datos al obtener logs.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener logs.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
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
                    message = "Error de base de datos al obtener el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener el log.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] ChatLog modelo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Datos inválidos.",
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

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
                    data = modelo
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al crear el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al crear el log.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] ChatLog modelo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Datos inválidos.",
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

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
                    data = modelo
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al editar el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al editar el log.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Eliminar([FromBody] ChatLog modelo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Datos inválidos.",
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

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
                    data = modelo
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al eliminar el log.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al eliminar el log.",
                    error = ex.Message
                });
            }
        }
    }
}