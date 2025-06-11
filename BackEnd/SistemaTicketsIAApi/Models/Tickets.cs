using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaTicketsIAApi.Models
{
    public class Ticket
    {
        public int TicketId { get; set; }

        [Required(ErrorMessage = "El título es obligatorio.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "El problema es obligatorio.")]
        public string Problem { get; set; }

        [Required(ErrorMessage = "La prioridad es obligatoria.")]
        public string Priority { get; set; }

        [NotMapped]
        public string? Status { get; set; }

        [Required(ErrorMessage = "El creador es obligatorio.")]
        public int CreatedBy { get; set; }
        public string? CreatedByName { get; set; }

        public int? AssignedTo { get; set; }
        public string? AssignedToName { get; set; }

        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public string? SuggestedAgent { get; set; }

        public string? Reasoning { get; set; }

        public string? Solution { get; set; }

        public string? Keywords { get; set; }

        public bool? ClassifiedByML { get; set; }

        [NotMapped]
        public int? ChangedBy { get; set; }

        [NotMapped]
        public string? ChangedByName { get; set; }

        [NotMapped]
        public DateTime? CreatedAt { get; set; }

        [NotMapped]
        public DateTime? ChangeDate { get; set; }

        [NotMapped]
        public int? State { get; set; }

        [NotMapped]
        public int? NewTicketId { get; set; }

        [NotMapped]
        public int? Success { get; set; }
    }
}