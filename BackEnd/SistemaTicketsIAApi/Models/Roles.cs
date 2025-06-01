using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaTicketsIAApi.Models
{
    public class Roles
    {
        public int RoleId { get; set; }

        [Required(ErrorMessage = "Nombre obligatorio.")]
        public string RoleName { get; set; }

        public string? AssignedMenus { get; set; }

        [Required(ErrorMessage = "Estado obligatorio.")]
        public int State { get; set; }

        [NotMapped]
        public int? NewRoleId { get; set; }

        [NotMapped]
        public int? Success { get; set; }
    }
}