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
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<List<ChatLog>> ObtenerPorTicketId()
        {
            var lista = new List<ChatLog>();

            using SqlConnection connection = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_chatLogSelectByTicketId", connection);
            cmd.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(new ChatLog
                {
                    LogId = Convert.ToInt32(reader["LogId"]),
                    TicketId = Convert.ToInt32(reader["TicketId"]),
                    Question = reader["Question"].ToString() ?? string.Empty,
                    Answer = reader["Answer"].ToString() ?? string.Empty,
                    CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                });
            }

            return lista;
        }

        public async Task<ChatLog?> ObtenerPorId(int logId)
        {
            ChatLog? item = null;

            using SqlConnection connection = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_chatLogSelectById", connection);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@LogId", logId);

            await connection.OpenAsync();
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                item = new ChatLog
                {
                    LogId = Convert.ToInt32(reader["LogId"]),
                    TicketId = Convert.ToInt32(reader["TicketId"]),
                    Question = reader["Question"].ToString() ?? string.Empty,
                    Answer = reader["Answer"].ToString() ?? string.Empty,
                    CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                };
            }

            return item;
        }

        public async Task<ChatLog> Crear(ChatLog modelo)
        {
            using SqlConnection connection = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_chatLogInsert", connection);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@TicketId", modelo.TicketId);
            cmd.Parameters.AddWithValue("@Question", modelo.Question);
            cmd.Parameters.AddWithValue("@Answer", modelo.Answer);

            SqlParameter pId = new SqlParameter("@NewLogId", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            SqlParameter pSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };

            cmd.Parameters.Add(pId);
            cmd.Parameters.Add(pSuccess);

            await connection.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            modelo.NewLogId = (int?)pId.Value;
            modelo.Success = (bool)pSuccess.Value ? 1 : 0;
            return modelo;
        }

        public async Task<ChatLog> Editar(ChatLog modelo)
        {
            using SqlConnection connection = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_chatLogUpdate", connection);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@LogId", modelo.LogId);
            cmd.Parameters.AddWithValue("@Question", modelo.Question);
            cmd.Parameters.AddWithValue("@Answer", modelo.Answer);

            SqlParameter pSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(pSuccess);

            await connection.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            modelo.Success = (bool)pSuccess.Value ? 1 : 0;
            return modelo;
        }

        public async Task<ChatLog> Eliminar(ChatLog modelo)
        {
            using SqlConnection connection = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_chatLogLogicDelete", connection);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@LogId", modelo.LogId);

            SqlParameter pSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(pSuccess);

            await connection.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            modelo.Success = (bool)pSuccess.Value ? 1 : 0;
            return modelo;
        }
    }
}