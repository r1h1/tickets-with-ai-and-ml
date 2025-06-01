using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaTicketsIAApi.Models
{
    public class Users
    {
        public int UserId { get; set; }

        [Required(ErrorMessage = "Nombre obligatorio.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email obligatorio.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Rol obligatorio.")]
        public int RoleId { get; set; }
        public string? RoleName { get; set; }

        [Required(ErrorMessage = "Nivel Seniority obligatorio.")]
        public string SeniorityLevel { get; set; }

        public int? IsActive { get; set; }

        public DateTime? CreatedAt { get; set; }

        public int? State { get; set; }

        [NotMapped]
        public int? NewUserId { get; set; }

        [NotMapped]
        public int? Success { get; set; }

    }
}
