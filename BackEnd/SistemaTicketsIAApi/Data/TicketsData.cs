using SistemaTicketsIAApi.Models;
using System.Data;
using Microsoft.Data.SqlClient;

namespace SistemaTicketsIAApi.Data
{
    public class TicketsData
    {
        private readonly string _connectionString;

        public TicketsData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")
                ?? throw new ArgumentNullException("CadenaSQL", "La cadena de conexión no está configurada.");
        }

        // Obtener todos los tickets
        public async Task<List<Ticket>> ObtenerTodosLosTickets()
        {
            var tickets = new List<Ticket>();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_ticketSelectAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                tickets.Add(new Ticket
                {
                    TicketId = Convert.ToInt32(reader["TicketId"]),
                    Title = reader["Title"].ToString(),
                    Description = reader["Description"].ToString(),
                    Problem = reader["Problem"].ToString(),
                    Priority = reader["Priority"].ToString(),
                    Status = reader["Status"]?.ToString(),
                    CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                    CreatedBy = Convert.ToInt32(reader["CreatedBy"]),
                    CreatedByName = reader["CreatedByName"]?.ToString(),
                    AssignedTo = reader["AssignedTo"] as int?,
                    AssignedToName = reader["AssignedToName"]?.ToString(),
                    CategoryId = reader["CategoryId"] as int?,
                    CategoryName = reader["CategoryName"]?.ToString(),
                    SuggestedAgent = reader["SuggestedAgent"]?.ToString(),
                    Reasoning = reader["Reasoning"]?.ToString(),
                    Solution = reader["Solution"]?.ToString(),
                    Keywords = reader["Keywords"]?.ToString(),
                    ClassifiedByML = reader["ClassifiedByML"] as bool?,
                    ChangedBy = reader["ChangedBy"] as int?,
                    ChangedByName = reader["ChangedByName"]?.ToString(),
                    ChangeDate = reader["ChangeDate"] as DateTime?,
                    State = Convert.ToInt32(reader["State"])
                });
            }

            return tickets;
        }

        // Obtener ticket por ID
        public async Task<Ticket?> ObtenerTicketPorId(int ticketId)
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_ticketSelectById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@TicketId", ticketId);

            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Ticket
                {
                    TicketId = Convert.ToInt32(reader["TicketId"]),
                    Title = reader["Title"].ToString(),
                    Description = reader["Description"].ToString(),
                    Problem = reader["Problem"].ToString(),
                    Priority = reader["Priority"].ToString(),
                    Status = reader["Status"]?.ToString(),
                    CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                    CreatedBy = Convert.ToInt32(reader["CreatedBy"]),
                    CreatedByName = reader["CreatedByName"]?.ToString(),
                    AssignedTo = reader["AssignedTo"] as int?,
                    AssignedToName = reader["AssignedToName"]?.ToString(),
                    CategoryId = reader["CategoryId"] as int?,
                    CategoryName = reader["CategoryName"]?.ToString(),
                    SuggestedAgent = reader["SuggestedAgent"]?.ToString(),
                    Reasoning = reader["Reasoning"]?.ToString(),
                    Solution = reader["Solution"]?.ToString(),
                    Keywords = reader["Keywords"]?.ToString(),
                    ClassifiedByML = reader["ClassifiedByML"] as bool?,
                    ChangedBy = reader["ChangedBy"] as int?,
                    ChangedByName = reader["ChangedByName"]?.ToString(),
                    ChangeDate = reader["ChangeDate"] as DateTime?,
                    State = Convert.ToInt32(reader["State"])
                };
            }

            return null;
        }

        // Crear nuevo ticket
        public async Task<Ticket> CrearNuevoTicket(Ticket ticket)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_ticketInsert", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@Title", ticket.Title);
            command.Parameters.AddWithValue("@Description", ticket.Description);
            command.Parameters.AddWithValue("@Problem", ticket.Problem);
            command.Parameters.AddWithValue("@Priority", ticket.Priority);
            command.Parameters.AddWithValue("@CreatedBy", ticket.CreatedBy);
            command.Parameters.AddWithValue("@AssignedTo", (object?)ticket.AssignedTo ?? DBNull.Value);
            command.Parameters.AddWithValue("@CategoryId", (object?)ticket.CategoryId ?? DBNull.Value);
            command.Parameters.AddWithValue("@SuggestedAgent", (object?)ticket.SuggestedAgent ?? DBNull.Value);
            command.Parameters.AddWithValue("@Reasoning", (object?)ticket.Reasoning ?? DBNull.Value);
            command.Parameters.AddWithValue("@Solution", (object?)ticket.Solution ?? DBNull.Value);
            command.Parameters.AddWithValue("@Keywords", (object?)ticket.Keywords ?? DBNull.Value);
            command.Parameters.AddWithValue("@ClassifiedByML", ticket.ClassifiedByML ?? true);

            var paramId = new SqlParameter("@NewTicketId", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };

            command.Parameters.Add(paramId);
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                ticket.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
                ticket.NewTicketId = ticket.Success == 1 ? Convert.ToInt32(paramId.Value) : null;
            }
            catch
            {
                ticket.Success = 0;
                ticket.NewTicketId = null;
                throw;
            }

            return ticket;
        }

        // Editar ticket
        public async Task<Ticket> EditarTicket(Ticket ticket)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_ticketUpdate", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@TicketId", ticket.TicketId);
            command.Parameters.AddWithValue("@Title", ticket.Title);
            command.Parameters.AddWithValue("@Description", ticket.Description);
            command.Parameters.AddWithValue("@Problem", ticket.Problem);
            command.Parameters.AddWithValue("@Priority", ticket.Priority);
            command.Parameters.AddWithValue("@Status", (object?)ticket.Status ?? DBNull.Value);
            command.Parameters.AddWithValue("@AssignedTo", (object?)ticket.AssignedTo ?? DBNull.Value);
            command.Parameters.AddWithValue("@CategoryId", (object?)ticket.CategoryId ?? DBNull.Value);
            command.Parameters.AddWithValue("@SuggestedAgent", (object?)ticket.SuggestedAgent ?? DBNull.Value);
            command.Parameters.AddWithValue("@Reasoning", (object?)ticket.Reasoning ?? DBNull.Value);
            command.Parameters.AddWithValue("@Solution", (object?)ticket.Solution ?? DBNull.Value);
            command.Parameters.AddWithValue("@Keywords", (object?)ticket.Keywords ?? DBNull.Value);
            command.Parameters.AddWithValue("@ClassifiedByML", ticket.ClassifiedByML ?? true);
            command.Parameters.AddWithValue("@ChangedBy", ticket.ChangedBy ?? 0);

            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                ticket.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch
            {
                ticket.Success = 0;
                throw;
            }

            return ticket;
        }

        // Eliminar ticket (borrado lógico)
        public async Task<Ticket> EliminarTicket(Ticket ticket)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_ticketLogicDelete", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@TicketId", ticket.TicketId);

            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                ticket.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch
            {
                ticket.Success = 0;
                throw;
            }

            return ticket;
        }
    }
}