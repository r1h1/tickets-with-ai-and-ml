using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using System.Linq;

namespace SistemaTicketsIAApi.Controllers
{
    [Route("tickets/v1/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RolesData _rolesData;

        public RolesController(RolesData rolesData)
        {
            _rolesData = rolesData;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodosLosRoles()
        {
            try
            {
                List<Roles> lista = await _rolesData.ObtenerTodosLosRoles();

                if (lista == null || !lista.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontraron roles.",
                        data = new List<Roles>()
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Roles obtenidos correctamente.",
                    data = lista
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener los roles.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener los roles.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerRolPorId(int id)
        {
            try
            {
                Roles objeto = await _rolesData.ObtenerRolPorId(id);

                if (objeto == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontró el rol.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Rol obtenido correctamente.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener el rol.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener el rol.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CrearNuevoRol([FromBody] Roles objeto)
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
                objeto = await _rolesData.CrearNuevoRol(objeto);

                if (objeto.Success == 1)
                {
                    return StatusCode(StatusCodes.Status201Created, new
                    {
                        success = true,
                        message = "Rol creado exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo crear el rol.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al crear el rol.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al crear el rol.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        public async Task<IActionResult> EditarRol([FromBody] Roles objeto)
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
                objeto = await _rolesData.EditarRol(objeto);

                if (objeto.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Rol editado exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo editar el rol.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al editar el rol.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al editar el rol.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> EliminarRol([FromBody] Roles objeto)
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
                objeto = await _rolesData.EliminarRol(objeto);

                if (objeto.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Rol eliminado exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo eliminar el rol.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al eliminar el rol.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al eliminar el rol.",
                    error = ex.Message
                });
            }
        }
    }
}