using System.ComponentModel.DataAnnotations;

namespace SistemaTicketsIAApi.Models
{
    public class ChatLog
    {
        public int LogId { get; set; }

        [Required(ErrorMessage = "El TicketId es obligatorio.")]
        public int TicketId { get; set; }

        [Required(ErrorMessage = "La pregunta es obligatoria.")]
        public string Question { get; set; } = string.Empty;

        [Required(ErrorMessage = "La respuesta es obligatoria.")]
        public string Answer { get; set; } = string.Empty;

        public DateTime? CreatedAt { get; set; }

        public int? NewLogId { get; set; }

        public int? Success { get; set; }
    }
}