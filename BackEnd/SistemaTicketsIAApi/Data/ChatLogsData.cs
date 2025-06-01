using Microsoft.Data.SqlClient;
using SistemaTicketsIAApi.Models;
using System.Data;

namespace SistemaTicketsIAApi.Data
{
    public class ChatLogData
    {
        private readonly string _connectionString;

        public ChatLogData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")
                ?? throw new ArgumentNullException("CadenaSQL", "La cadena de conexión no está configurada.");
        }

        // Obtener logs por TicketId
        public async Task<List<ChatLog>> ObtenerPorTicketId()
        {
            var lista = new List<ChatLog>();

            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await using var command = new SqlCommand("sp_chatLogSelectByTicketId", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                await using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    lista.Add(new ChatLog
                    {
                        LogId = Convert.ToInt32(reader["LogId"]),
                        TicketId = Convert.ToInt32(reader["TicketId"]),
                        Question = reader["Question"]?.ToString() ?? string.Empty,
                        Answer = reader["Answer"]?.ToString() ?? string.Empty,
                        CreatedAt = reader["CreatedAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["CreatedAt"])
                    });
                }
            }
            catch (SqlException sqlEx)
            {
                throw new Exception("Error de base de datos al obtener los logs del ticket.", sqlEx);
            }

            return lista;
        }

        // Obtener log por ID
        public async Task<ChatLog?> ObtenerPorId(int logId)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await using var command = new SqlCommand("sp_chatLogSelectById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@LogId", logId);
                await connection.OpenAsync();

                await using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return new ChatLog
                    {
                        LogId = Convert.ToInt32(reader["LogId"]),
                        TicketId = Convert.ToInt32(reader["TicketId"]),
                        Question = reader["Question"]?.ToString() ?? string.Empty,
                        Answer = reader["Answer"]?.ToString() ?? string.Empty,
                        CreatedAt = reader["CreatedAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["CreatedAt"])
                    };
                }
            }
            catch (SqlException sqlEx)
            {
                throw;
            }

            return null;
        }

        // Crear log
        public async Task<ChatLog> Crear(ChatLog modelo)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await using var command = new SqlCommand("sp_chatLogInsert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@TicketId", modelo.TicketId);
                command.Parameters.AddWithValue("@Question", modelo.Question);
                command.Parameters.AddWithValue("@Answer", modelo.Answer);

                var paramId = new SqlParameter("@NewLogId", SqlDbType.Int) { Direction = ParameterDirection.Output };
                var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };

                command.Parameters.Add(paramId);
                command.Parameters.Add(paramSuccess);

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                modelo.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
                modelo.NewLogId = modelo.Success == 1 ? Convert.ToInt32(paramId.Value) : null;
            }
            catch (SqlException sqlEx)
            {
                modelo.Success = 0;
                modelo.NewLogId = null;
                throw;
            }

            return modelo;
        }

        // Editar log
        public async Task<ChatLog> Editar(ChatLog modelo)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await using var command = new SqlCommand("sp_chatLogUpdate", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@LogId", modelo.LogId);
                command.Parameters.AddWithValue("@Question", modelo.Question);
                command.Parameters.AddWithValue("@Answer", modelo.Answer);

                var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                command.Parameters.Add(paramSuccess);

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                modelo.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                modelo.Success = 0;
                throw;
            }

            return modelo;
        }

        // Eliminar log
        public async Task<ChatLog> Eliminar(ChatLog modelo)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await using var command = new SqlCommand("sp_chatLogLogicDelete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@LogId", modelo.LogId);

                var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                command.Parameters.Add(paramSuccess);

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                modelo.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                modelo.Success = 0;
                throw;
            }

            return modelo;
        }
    }
}