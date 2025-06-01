using Microsoft.Data.SqlClient;
using SistemaTicketsIAApi.Models;
using System.Data;

namespace SistemaTicketsIAApi.Data
{
    public class CategoryData
    {
        private readonly string _connectionString;

        public CategoryData(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("CadenaSQL")
                ?? throw new ArgumentNullException("CadenaSQL", "La cadena de conexión no está configurada.");
        }

        // Obtener todas las categorías
        public async Task<List<Category>> ObtenerTodos()
        {
            var categorias = new List<Category>();

            try
            {
                await using var conn = new SqlConnection(_connectionString);
                await using var cmd = new SqlCommand("sp_categorySelectAll", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await conn.OpenAsync();
                await using var reader = await cmd.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    categorias.Add(new Category
                    {
                        CategoryId = Convert.ToInt32(reader["CategoryId"]),
                        Name = reader["Name"]?.ToString() ?? string.Empty,
                        Description = reader["Description"]?.ToString() ?? string.Empty,
                        State = Convert.ToInt32(reader["State"])
                    });
                }
            }
            catch (SqlException sqlEx)
            {
                throw new Exception("Error de base de datos al obtener las categorías.", sqlEx);
            }

            return categorias;
        }

        // Obtener categoría por ID
        public async Task<Category?> ObtenerPorId(int id)
        {
            try
            {
                await using var conn = new SqlConnection(_connectionString);
                await using var cmd = new SqlCommand("sp_categorySelectById", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@CategoryId", id);
                await conn.OpenAsync();

                await using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    return new Category
                    {
                        CategoryId = Convert.ToInt32(reader["CategoryId"]),
                        Name = reader["Name"]?.ToString() ?? string.Empty,
                        Description = reader["Description"]?.ToString() ?? string.Empty,
                        State = Convert.ToInt32(reader["State"])
                    };
                }
            }
            catch (SqlException sqlEx)
            {
                throw new Exception("Error de base de datos al obtener la categoría.", sqlEx);
            }

            return null;
        }

        // Crear categoría
        public async Task<Category> Crear(Category categoria)
        {
            try
            {
                await using var conn = new SqlConnection(_connectionString);
                await using var cmd = new SqlCommand("sp_categoryInsert", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@Name", categoria.Name);
                cmd.Parameters.AddWithValue("@Description", categoria.Description);

                var paramId = new SqlParameter("@NewCategoryId", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
                {
                    Direction = ParameterDirection.Output
                };

                cmd.Parameters.Add(paramId);
                cmd.Parameters.Add(paramSuccess);

                await conn.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                categoria.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
                categoria.NewCategoryId = categoria.Success == 1 ? Convert.ToInt32(paramId.Value) : null;
            }
            catch (SqlException sqlEx)
            {
                categoria.Success = 0;
                categoria.NewCategoryId = null;
                throw;
            }

            return categoria;
        }

        // Editar categoría
        public async Task<Category> Editar(Category categoria)
        {
            try
            {
                await using var conn = new SqlConnection(_connectionString);
                await using var cmd = new SqlCommand("sp_categoryUpdate", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@CategoryId", categoria.CategoryId);
                cmd.Parameters.AddWithValue("@Name", categoria.Name);
                cmd.Parameters.AddWithValue("@Description", categoria.Description);

                var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(paramSuccess);

                await conn.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                categoria.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                categoria.Success = 0;
                throw;
            }

            return categoria;
        }

        // Eliminar categoría (lógica)
        public async Task<Category> Eliminar(Category categoria)
        {
            try
            {
                await using var conn = new SqlConnection(_connectionString);
                await using var cmd = new SqlCommand("sp_categoryLogicDelete", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@CategoryId", categoria.CategoryId);

                var paramSuccess = new SqlParameter("@Success", SqlDbType.Bit)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(paramSuccess);

                await conn.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                categoria.Success = Convert.ToBoolean(paramSuccess.Value) ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                categoria.Success = 0;
                throw;
            }

            return categoria;
        }
    }
}
