using System.ComponentModel.DataAnnotations;

namespace SistemaTicketsIAApi.Models
{
    public class Category
    {
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Nombre obligatorio.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Descripción obligatoria.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Estado obligatorio.")]
        public int State { get; set; }

        public int? NewCategoryId { get; set; }

        public int? Success { get; set; }
    }
}
