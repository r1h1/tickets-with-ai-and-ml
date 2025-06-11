using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SistemaTicketsIAApi.Data;
using SistemaTicketsIAApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace SistemaTicketsIAApi.Controllers
{
    [ApiController]
    [Route("tickets/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AuthData _authData;

        public AuthController(IConfiguration config, AuthData authData)
        {
            _config = config;
            _authData = authData;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] AuthLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { code = 400, message = "Nombre y contraseña son requeridos." });

            var user = await _authData.GetByUserId(request.UserId, request.Name);
            if (user == null)
                return Unauthorized(new { code = 401, message = "Credenciales inválidas." });

            if (!BCrypt.Net.BCrypt.Verify(request.Password + user.Salt, user.PasswordHash))
                return Unauthorized(new { code = 401, message = "Nombre y/o contraseña incorrecta." });

            var secretKey = _config.GetSection("settings")["secretkey"];
            if (string.IsNullOrEmpty(secretKey))
                return StatusCode(500, new { message = "Configuración del servidor incorrecta." });

            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Role, user.RoleId?.ToString() ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(12),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            string tokenString = tokenHandler.WriteToken(token);

            await _authData.UpdateLastLogin(user.UserId);

            return Ok(new
            {
                code = 200,
                token = tokenString,
                message = "Login exitoso",
                user = new { user.UserId, user.AuthId, user.Name }
            });
        }

        [HttpPost("Registrar")]
        [Authorize]
        public async Task<IActionResult> Registrar([FromBody] AuthRegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Password))
                return BadRequest(new { code = 400, message = "Contraseña requerida." });

            if (string.IsNullOrEmpty(request.Name))
                return BadRequest(new { code = 400, message = "Nombre de usuario requerido." });

            string salt = Guid.NewGuid().ToString();
            string hashed = BCrypt.Net.BCrypt.HashPassword(request.Password + salt);

            var newUser = new Auth
            {
                UserId = request.UserId,
                Name = request.Name,
                PasswordHash = hashed,
                Salt = salt
            };

            int id = await _authData.Insert(newUser);
            if (id > 0)
                return Ok(new { code = 201, message = "Usuario registrado exitosamente.", authId = id });

            return StatusCode(500, new { code = 500, message = "Error al registrar usuario." });
        }

        [HttpPut("CambiarClave")]
        [Authorize]
        public async Task<IActionResult> CambiarClave([FromBody] AuthPasswordUpdateRequest request)
        {
            if (string.IsNullOrEmpty(request.NewPassword))
                return BadRequest(new { code = 400, message = "La nueva contraseña no puede estar vacía." });

            if (string.IsNullOrEmpty(request.Name))
                return BadRequest(new { code = 400, message = "Nombre de usuario requerido para actualizar contraseña." });

            string newSalt = Guid.NewGuid().ToString();
            string newHashed = BCrypt.Net.BCrypt.HashPassword(request.NewPassword + newSalt);

            // Aquí podría validarse que exista ese UserId + Name antes de actualizar

            bool updated = await _authData.UpdatePassword(request.UserId, newHashed, newSalt);

            return updated
                ? Ok(new { code = 200, message = "Contraseña actualizada correctamente." })
                : StatusCode(500, new { code = 500, message = "Error al actualizar la contraseña." });
        }

        [HttpGet("ValidarToken")]
        [Authorize]
        public IActionResult ValidarToken()
        {
            return Ok(new { code = 200, message = "Token válido." });
        }
    }
}