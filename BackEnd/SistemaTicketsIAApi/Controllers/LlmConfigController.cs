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
    public class LLMConfigController : ControllerBase
    {
        private readonly LLMConfigData _llmData;

        public LLMConfigController(LLMConfigData llmData)
        {
            _llmData = llmData;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> ObtenerTodos()
        {
            try
            {
                var lista = await _llmData.ObtenerTodos();

                if (lista == null || !lista.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontraron configuraciones.",
                        data = new List<LLMConfig>()
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Configuraciones obtenidas correctamente.",
                    data = lista
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener configuraciones.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener configuraciones.",
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
                var objeto = await _llmData.ObtenerPorId(id);

                if (objeto == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontró la configuración solicitada.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Configuración obtenida correctamente.",
                    data = objeto
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener configuración.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] LLMConfig objeto)
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
                objeto = await _llmData.CrearNuevo(objeto);

                if (objeto.Success == 1)
                {
                    return StatusCode(StatusCodes.Status201Created, new
                    {
                        success = true,
                        message = "Configuración creada exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo crear la configuración.",
                    data = objeto
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al crear configuración.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al crear configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] LLMConfig objeto)
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
                objeto = await _llmData.Editar(objeto);

                if (objeto.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Configuración editada exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo editar la configuración.",
                    data = objeto
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al editar configuración.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al editar configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Eliminar([FromBody] LLMConfig objeto)
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
                objeto = await _llmData.Eliminar(objeto);

                if (objeto.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Configuración eliminada exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo eliminar la configuración.",
                    data = objeto
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al eliminar configuración.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al eliminar configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpPut("last-used/{id}")]
        [Authorize]
        public async Task<IActionResult> ActualizarUltimoUso(int id)
        {
            try
            {
                int result = await _llmData.ActualizarUltimoUso(id);

                if (result == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Fecha de último uso actualizada correctamente.",
                        data = new { LLMId = id }
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo actualizar la fecha de último uso.",
                    data = (object)null
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al actualizar fecha de último uso.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al actualizar fecha de último uso.",
                    error = ex.Message
                });
            }
        }
    }
}