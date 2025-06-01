using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;

namespace SistemaTicketsIAApi.Controllers
{
    [ApiController]
    [Route("tickets/v1/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryData _data;

        public CategoryController(IConfiguration configuration)
        {
            _data = new CategoryData(configuration);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> ObtenerTodos()
        {
            try
            {
                var result = await _data.ObtenerTodos();

                if (result == null || !result.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontraron categorías.",
                        data = new List<Category>()
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Categorías obtenidas correctamente.",
                    data = result
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener las categorías.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener las categorías.",
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
                var result = await _data.ObtenerPorId(id);

                if (result == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Categoría no encontrada.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Categoría obtenida correctamente.",
                    data = result
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener la categoría.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener la categoría.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Category model)
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
                var result = await _data.Crear(model);

                if (result.Success == 1)
                {
                    return StatusCode(StatusCodes.Status201Created, new
                    {
                        success = true,
                        message = "Categoría creada exitosamente.",
                        data = result
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo crear la categoría.",
                    data = result
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al crear la categoría.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al crear la categoría.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Category model)
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
                var result = await _data.Editar(model);

                if (result.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Categoría editada exitosamente.",
                        data = result
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo editar la categoría.",
                    data = result
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al editar la categoría.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al editar la categoría.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Eliminar([FromBody] Category model)
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
                var result = await _data.Eliminar(model);

                if (result.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Categoría eliminada exitosamente.",
                        data = result
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo eliminar la categoría.",
                    data = result
                });
            }
            catch (SqlException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al eliminar la categoría.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al eliminar la categoría.",
                    error = ex.Message
                });
            }
        }
    }
}