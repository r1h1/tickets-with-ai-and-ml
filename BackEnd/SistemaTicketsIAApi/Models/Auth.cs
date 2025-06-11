using System.ComponentModel.DataAnnotations;

namespace SistemaTicketsIAApi.Models
{
    public class Auth
    {
        public int AuthId { get; set; }

        [Required(ErrorMessage = "Id de usuario obligatorio.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Nombre de usuario requerido.")] // ← AGREGADO
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Hash de contraseña obligatorio.")]
        public string PasswordHash { get; set; }

        [Required(ErrorMessage = "Salt obligatorio.")]
        public string Salt { get; set; }

        public DateTime? LastLogin { get; set; }

        [Required(ErrorMessage = "Estado obligatorio.")]
        public int State { get; set; }

        public int? RoleId { get; set; }

        public int? NewAuthId { get; set; }
        public int? Success { get; set; }
    }

    public class AuthLoginRequest
    {
        [Required(ErrorMessage = "Id de usuario requerido.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Nombre de usuario requerido.")] // ← AGREGADO
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contraseña requerida.")]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthRegisterRequest
    {
        [Required(ErrorMessage = "Id de usuario requerido.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Nombre de usuario requerido.")] // ← AGREGADO
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contraseña requerida.")]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthPasswordUpdateRequest
    {
        [Required(ErrorMessage = "Id de usuario requerido.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Nombre de usuario requerido.")] // ← AGREGADO
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nueva contraseña requerida.")]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public string? Token { get; set; }
    }
}