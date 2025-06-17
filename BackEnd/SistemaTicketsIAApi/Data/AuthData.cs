using Microsoft.Data.SqlClient;
using SistemaTicketsIAApi.Models;
using System.Data;

namespace SistemaTicketsIAApi.Data
{
    public class AuthData
    {
        private readonly string _connectionString;

        public AuthData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Login validando UserId + Email
        public async Task<Auth?> GetByUserId(int userId, string Email)
        {
            Auth? auth = null;

            using (var con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                using (var cmd = new SqlCommand("sp_authSelectByUserId", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@Email", Email);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            auth = new Auth
                            {
                                AuthId = Convert.ToInt32(reader["AuthId"]),
                                UserId = Convert.ToInt32(reader["UserId"]),
                                PasswordHash = reader["PasswordHash"].ToString()!,
                                Salt = reader["Salt"].ToString()!,
                                LastLogin = reader["LastLogin"] != DBNull.Value
                                    ? Convert.ToDateTime(reader["LastLogin"])
                                    : null,
                                State = Convert.ToInt32(reader["State"]),
                                RoleId = Convert.ToInt32(reader["RoleId"]),
                                Email = reader["Email"].ToString()!
                            };
                        }
                    }
                }
            }

            return auth;
        }

        // Validar existencia del usuario en Auth
        public async Task<Auth?> GetByUserIdOnly(int userId)
        {
            Auth? auth = null;

            using (var con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                using (var cmd = new SqlCommand("sp_authSelectByUserIdOnly", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            auth = new Auth
                            {
                                AuthId = Convert.ToInt32(reader["AuthId"]),
                                UserId = Convert.ToInt32(reader["UserId"]),
                                PasswordHash = reader["PasswordHash"].ToString()!,
                                Salt = reader["Salt"].ToString()!,
                                LastLogin = reader["LastLogin"] != DBNull.Value ? Convert.ToDateTime(reader["LastLogin"]) : null,
                                State = Convert.ToInt32(reader["State"]),
                                RoleId = Convert.ToInt32(reader["RoleId"]),
                                Email = reader["Email"].ToString()!
                            };
                        }
                    }
                }
            }

            return auth;
        }


        // Registro de usuario
        public async Task<int> Insert(Auth model)
        {
            int newId = 0;

            using (var con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                using (var cmd = new SqlCommand("sp_authInsert", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", model.UserId);
                    cmd.Parameters.AddWithValue("@PasswordHash", model.PasswordHash);
                    cmd.Parameters.AddWithValue("@Salt", model.Salt);

                    var outputId = new SqlParameter("@NewAuthId", SqlDbType.Int) { Direction = ParameterDirection.Output };
                    var success = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                    cmd.Parameters.Add(outputId);
                    cmd.Parameters.Add(success);

                    await cmd.ExecuteNonQueryAsync();

                    if (Convert.ToBoolean(success.Value))
                        newId = Convert.ToInt32(outputId.Value);
                }
            }

            return newId;
        }

        // Cambio de contraseña
        public async Task<bool> UpdatePassword(int userId, string newHash, string salt)
        {
            bool isSuccess = false;

            using (var con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                using (var cmd = new SqlCommand("sp_authUpdatePassword", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@PasswordHash", newHash);
                    cmd.Parameters.AddWithValue("@Salt", salt);

                    var success = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                    cmd.Parameters.Add(success);

                    await cmd.ExecuteNonQueryAsync();
                    isSuccess = Convert.ToBoolean(success.Value);
                }
            }

            return isSuccess;
        }

        // Actualiza última fecha de login
        public async Task<bool> UpdateLastLogin(int userId)
        {
            bool isSuccess = false;

            using (var con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                using (var cmd = new SqlCommand("sp_authUpdateLastLogin", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    var success = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                    cmd.Parameters.Add(success);

                    await cmd.ExecuteNonQueryAsync();
                    isSuccess = Convert.ToBoolean(success.Value);
                }
            }

            return isSuccess;
        }

        // Eliminación lógica del auth
        public async Task<bool> LogicalDelete(int userId)
        {
            bool isSuccess = false;

            using (var con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                using (var cmd = new SqlCommand("sp_authLogicDelete", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    var success = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                    cmd.Parameters.Add(success);

                    await cmd.ExecuteNonQueryAsync();
                    isSuccess = Convert.ToBoolean(success.Value);
                }
            }

            return isSuccess;
        }
    }
}