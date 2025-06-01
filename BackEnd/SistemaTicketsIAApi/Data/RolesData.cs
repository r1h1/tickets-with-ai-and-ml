using SistemaTicketsIAApi.Models;
using System.Data;
using Microsoft.Data.SqlClient;

namespace SistemaTicketsIAApi.Data
{
    public class RolesData
    {
        private readonly string _connectionString;

        public RolesData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")
                ?? throw new ArgumentNullException("CadenaSQL", "La cadena de conexión no está configurada.");
        }

        // Obtener todos los roles
        public async Task<List<Roles>> ObtenerTodosLosRoles()
        {
            var roles = new List<Roles>();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_rolSelectAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                roles.Add(new Roles
                {
                    RoleId = Convert.ToInt32(reader["RoleId"]),
                    RoleName = reader["RoleName"]?.ToString() ?? string.Empty,
                    AssignedMenus = reader["AssignedMenus"]?.ToString() ?? string.Empty,
                    State = Convert.ToInt32(reader["State"])
                });
            }

            return roles;
        }

        // Obtener un solo rol por ID
        public async Task<Roles?> ObtenerRolPorId(int id)
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new SqlCommand("sp_rolSelectById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@RoleId", id);

            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Roles
                {
                    RoleId = Convert.ToInt32(reader["RoleId"]),
                    RoleName = reader["RoleName"]?.ToString() ?? string.Empty,
                    AssignedMenus = reader["AssignedMenus"]?.ToString() ?? string.Empty,
                    State = Convert.ToInt32(reader["State"])
                };
            }

            return null;
        }

        // Crear roles
        public async Task<Roles> CrearNuevoRol(Roles objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_rolInsert", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Parámetros de entrada
            command.Parameters.AddWithValue("@RoleName", objeto.RoleName);
            command.Parameters.AddWithValue("@AssignedMenus", objeto.AssignedMenus ?? (object)DBNull.Value);

            // Parámetros de salida
            var paramId = new SqlParameter("@NewRoleId", SqlDbType.Int) { Direction = ParameterDirection.Output };
            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };

            command.Parameters.Add(paramId);
            command.Parameters.Add(paramSuccess);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                objeto.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
                objeto.NewRoleId = objeto.Success == 1 ? Convert.ToInt32(paramId.Value) : null;
            }
            catch (SqlException)
            {
                objeto.Success = 0;
                objeto.NewRoleId = null;
                throw;
            }

            return objeto;
        }

        // Editar roles
        public async Task<Roles> EditarRol(Roles objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_rolUpdate", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Parámetros de entrada
            command.Parameters.AddWithValue("@RoleId", objeto.RoleId);
            command.Parameters.AddWithValue("@RoleName", objeto.RoleName);
            command.Parameters.AddWithValue("@AssignedMenus", objeto.AssignedMenus ?? (object)DBNull.Value);

            // Parámetro de salida
            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
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

        // Eliminar rol
        public async Task<Roles> EliminarRol(Roles objeto)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("sp_rolLogicDelete", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@RoleId", objeto.RoleId);

            var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
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