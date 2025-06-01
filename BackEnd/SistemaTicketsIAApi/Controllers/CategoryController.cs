using Microsoft.AspNetCore.Mvc;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;

namespace SistemaTicketsIAApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryData _data;

        public CategoryController(IConfiguration configuration)
        {
            _data = new CategoryData(configuration);
        }

        [HttpGet]
        [Route("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _data.ObtenerTodos();
            return Ok(result);
        }

        [HttpGet]
        [Route("get/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _data.ObtenerPorId(id);
            if (result == null)
                return NotFound("Categoría no encontrada.");
            return Ok(result);
        }

        [HttpPost]
        [Route("create")]
        public async Task<IActionResult> Create([FromBody] Category model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _data.Crear(model);
            if (result.Success == 0)
                return StatusCode(500, "Error al crear la categoría.");
            return Ok(result);
        }

        [HttpPut]
        [Route("update")]
        public async Task<IActionResult> Update([FromBody] Category model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _data.Editar(model);
            if (result.Success == 0)
                return NotFound("No se pudo actualizar la categoría.");
            return Ok(result);
        }

        [HttpPut]
        [Route("delete")]
        public async Task<IActionResult> Delete([FromBody] Category model)
        {
            var result = await _data.Eliminar(model);
            if (result.Success == 0)
                return NotFound("No se pudo eliminar la categoría.");
            return Ok(result);
        }
    }
}