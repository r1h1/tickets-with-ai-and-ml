using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaTicketsIAApi.Models
{
    public class LLMConfig
    {
        public int LLMId { get; set; }

        [Required(ErrorMessage = "El nombre del modelo es obligatorio.")]
        public string ModelName { get; set; }

        [Required(ErrorMessage = "La API Key es obligatoria.")]
        public string ApiKey { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastUsed { get; set; }

        public string? Notes { get; set; }

        public int State { get; set; } = 1;

        public int? NewLLMId { get; set; }

        public int? Success { get; set; }
    }
}