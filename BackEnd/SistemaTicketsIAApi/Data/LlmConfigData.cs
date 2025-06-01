using SistemaTicketsIAApi.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace SistemaTicketsIAApi.Data
{
    public class LLMConfigData
    {
        private readonly string _connectionString;

        public LLMConfigData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")
                ?? throw new ArgumentNullException("CadenaSQL", "La cadena de conexión no está configurada.");
        }

        // SELECT ALL
        public async Task<List<LLMConfig>> ObtenerTodos()
        {
            var lista = new List<LLMConfig>();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_llmConfigSelectAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(new LLMConfig
                {
                    LLMId = Convert.ToInt32(reader["LLMId"]),
                    ModelName = reader["ModelName"].ToString() ?? string.Empty,
                    ApiKey = reader["ApiKey"].ToString() ?? string.Empty,
                    IsActive = Convert.ToBoolean(reader["IsActive"]),
                    LastUsed = reader["LastUsed"] as DateTime?,
                    Notes = reader["Notes"]?.ToString(),
                    State = Convert.ToInt32(reader["State"])
                });
            }

            return lista;
        }

        // SELECT BY ID
        public async Task<LLMConfig?> ObtenerPorId(int id)
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_llmConfigSelectById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@LLMId", id);

            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new LLMConfig
                {
                    LLMId = Convert.ToInt32(reader["LLMId"]),
                    ModelName = reader["ModelName"].ToString() ?? string.Empty,
                    ApiKey = reader["ApiKey"].ToString() ?? string.Empty,
                    IsActive = Convert.ToBoolean(reader["IsActive"]),
                    LastUsed = reader["LastUsed"] as DateTime?,
                    Notes = reader["Notes"]?.ToString(),
                    State = Convert.ToInt32(reader["State"])
                };
            }

            return null;
        }

        // INSERT
        public async Task<LLMConfig> CrearNuevo(LLMConfig objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_llmConfigInsert", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@ModelName", objeto.ModelName);
            command.Parameters.AddWithValue("@ApiKey", objeto.ApiKey);
            command.Parameters.AddWithValue("@IsActive", objeto.IsActive);
            command.Parameters.AddWithValue("@Notes", (object?)objeto.Notes ?? DBNull.Value);

            var paramId = new SqlParameter("@NewLLMId", SqlDbType.Int) { Direction = ParameterDirection.Output };
            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };

            command.Parameters.Add(paramId);
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;

                if (objeto.Success == 1)
                {
                    objeto.NewLLMId = Convert.ToInt32(paramId.Value);
                }
                else
                {
                    objeto.NewLLMId = null;
                }
            }
            catch (SqlException sqlEx)
            {
                objeto.Success = 0;
                objeto.NewLLMId = null;
                throw new Exception("Error de base de datos al crear LLMConfig.", sqlEx);
            }

            return objeto;
        }

        // UPDATE
        public async Task<LLMConfig> Editar(LLMConfig objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_llmConfigUpdate", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@LLMId", objeto.LLMId);
            command.Parameters.AddWithValue("@ModelName", objeto.ModelName);
            command.Parameters.AddWithValue("@ApiKey", objeto.ApiKey);
            command.Parameters.AddWithValue("@IsActive", objeto.IsActive);
            command.Parameters.AddWithValue("@Notes", (object?)objeto.Notes ?? DBNull.Value);

            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                objeto.Success = 0;
                throw new Exception("Error de base de datos al editar LLMConfig.", sqlEx);
            }

            return objeto;
        }

        // LOGIC DELETE
        public async Task<LLMConfig> Eliminar(LLMConfig objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_llmConfigLogicDelete", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@LLMId", objeto.LLMId);

            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                objeto.Success = 0;
                throw;
            }

            return objeto;
        }

        // UPDATE LAST USED
        public async Task<int> ActualizarUltimoUso(int llmId)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_llmConfigUpdateLastUsed", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@LLMId", llmId);

            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();
                return Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                throw;
            }
        }
    }
}
