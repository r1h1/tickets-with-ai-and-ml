using SistemaTicketsIAApi.Models;
using System.Data;
using Microsoft.Data.SqlClient;

namespace SistemaTicketsIAApi.Data
{
    public class UsersData
    {
        private readonly string _connectionString;

        public UsersData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")
                ?? throw new ArgumentNullException("CadenaSQL", "La cadena de conexión no está configurada.");
        }

        // Obtener todos los usuarios
        public async Task<List<Users>> ObtenerTodosLosUsuarios()
        {
            var users = new List<Users>();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_userSelectAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                users.Add(new Users
                {
                    UserId = Convert.ToInt32(reader["UserId"]),
                    Name = reader["Name"]?.ToString() ?? string.Empty,
                    Email = reader["Email"]?.ToString() ?? string.Empty,
                    RoleId = Convert.ToInt32(reader["RoleId"]),
                    RoleName = reader["RoleName"]?.ToString() ?? string.Empty,
                    SeniorityLevel = reader["SeniorityLevel"]?.ToString() ?? string.Empty,
                    IsActive = Convert.ToInt32(reader["IsActive"]),
                    CreatedAt = reader["CreatedAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["CreatedAt"]),
                    State = Convert.ToInt32(reader["State"]),
                });
            }

            return users;
        }

        // Obtener un solo usuario por ID
        public async Task<Users?> ObtenerUsuarioPorId(int id)
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_userSelectById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@UserId", id);

            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Users
                {
                    UserId = Convert.ToInt32(reader["UserId"]),
                    Name = reader["Name"]?.ToString() ?? string.Empty,
                    Email = reader["Email"]?.ToString() ?? string.Empty,
                    RoleId = Convert.ToInt32(reader["RoleId"]),
                    RoleName = reader["RoleName"]?.ToString() ?? string.Empty,
                    SeniorityLevel = reader["SeniorityLevel"]?.ToString() ?? string.Empty,
                    IsActive = Convert.ToInt32(reader["IsActive"]),
                    CreatedAt = reader["CreatedAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["CreatedAt"]),
                    State = Convert.ToInt32(reader["State"]),
                };
            }

            return null;
        }

        // Crear Usuario
        public async Task<Users> CrearNuevoUsuario(Users objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_userInsert", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Parámetros de entrada
            command.Parameters.AddWithValue("@Name", objeto.Name);
            command.Parameters.Add("@Email", SqlDbType.NVarChar, 150).Value = objeto.Email;
            command.Parameters.AddWithValue("@RoleId", objeto.RoleId);
            command.Parameters.AddWithValue("@SeniorityLevel", objeto.SeniorityLevel);

            // Parámetros de salida
            var paramId = new SqlParameter("@NewUserId", SqlDbType.Int)
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

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;

                if (objeto.Success == 1)
                {
                    objeto.NewUserId = Convert.ToInt32(paramId.Value);
                }
                else
                {
                    objeto.NewUserId = null;
                }
            }
            catch (SqlException)
            {
                objeto.Success = 0;
                objeto.NewUserId = null;
                throw;
            }

            return objeto;
        }

        // Editar Usuarios
        public async Task<Users> EditarUsuario(Users objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_userUpdate", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Parámetros de entrada
            command.Parameters.AddWithValue("@UserId", objeto.UserId);
            command.Parameters.AddWithValue("@Name", objeto.Name);
            command.Parameters.AddWithValue("@Email", objeto.Email);
            command.Parameters.AddWithValue("@RoleId", objeto.RoleId);
            command.Parameters.AddWithValue("@SeniorityLevel", objeto.SeniorityLevel);

            // Parámetros de salida
            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };

            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException)
            {
                objeto.Success = 0;
                throw;
            }

            return objeto;
        }

        // Eliminar Usuario
        public async Task<Users> EliminarUsuario(Users objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_userLogicDelete", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Parámetro de entrada
            command.Parameters.AddWithValue("@UserId", objeto.UserId);

            // Parámetro de salida
            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException)
            {
                objeto.Success = 0;
                throw;
            }

            return objeto;
        }
    }
}
