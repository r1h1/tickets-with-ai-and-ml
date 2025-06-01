using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using Microsoft.Data.SqlClient;

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
                    message = "Error al obtener configuraciones.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
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
                        data = new { }
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
                    message = "Error al obtener configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] LLMConfig objeto)
        {
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
                    data = (object)null
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al crear configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Editar([FromBody] LLMConfig objeto)
        {
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
                    data = (object)null
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al editar configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar([FromBody] LLMConfig objeto)
        {
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
                    data = (object)null
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error inesperado al eliminar configuración.",
                    error = ex.Message
                });
            }
        }

        [HttpPut("last-used/{id}")]
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
                    message = "Error al actualizar fecha de último uso.",
                    error = ex.Message
                });
            }
        }
    }
}