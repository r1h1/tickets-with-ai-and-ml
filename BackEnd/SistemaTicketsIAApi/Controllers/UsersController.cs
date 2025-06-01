using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace SistemaTicketsIAApi.Controllers
{
    [Route("tickets/v1/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UsersData _usersData;

        public UsersController(UsersData usersData)
        {
            _usersData = usersData;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> ObtenerTodosLosUsuarios()
        {
            try
            {
                List<Users> lista = await _usersData.ObtenerTodosLosUsuarios();

                if (lista == null || !lista.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontraron usuarios.",
                        data = new List<Users>()
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Usuarios obtenidos correctamente.",
                    data = lista
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener los usuarios.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener los usuarios.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> ObtenerUsuarioPorId(int id)
        {
            try
            {
                Users objeto = await _usersData.ObtenerUsuarioPorId(id);

                if (objeto == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontró el usuario.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Usuario obtenido correctamente.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al obtener el usuario.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al obtener el usuario.",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CrearNuevoUsuario([FromBody] Users objeto)
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
                objeto = await _usersData.CrearNuevoUsuario(objeto);

                if (objeto.Success == 1)
                {
                    return StatusCode(StatusCodes.Status201Created, new
                    {
                        success = true,
                        message = "Usuario creado exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo crear el usuario.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al crear el usuario.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al crear el usuario.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> EditarUsuario([FromBody] Users objeto)
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
                objeto = await _usersData.EditarUsuario(objeto);

                if (objeto.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Usuario editado exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo editar el usuario.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al editar el usuario.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al editar el usuario.",
                    error = ex.Message
                });
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> EliminarUsuario([FromBody] Users objeto)
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
                objeto = await _usersData.EliminarUsuario(objeto);

                if (objeto.Success == 1)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Usuario eliminado exitosamente.",
                        data = objeto
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "No se pudo eliminar el usuario.",
                    data = objeto
                });
            }
            catch (SqlException sqlEx)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error de base de datos al eliminar el usuario.",
                    error = sqlEx.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado al eliminar el usuario.",
                    error = ex.Message
                });
            }
        }
    }
}