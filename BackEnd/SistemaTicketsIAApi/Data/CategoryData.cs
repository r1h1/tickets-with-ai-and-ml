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
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<List<Category>> ObtenerTodos()
        {
            var categorias = new List<Category>();

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("sp_categorySelectAll", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                categorias.Add(new Category
                {
                    CategoryId = Convert.ToInt32(reader["CategoryId"]),
                    Name = reader["Name"].ToString(),
                    Description = reader["Description"].ToString(),
                    State = Convert.ToInt32(reader["State"])
                });
            }

            return categorias;
        }

        public async Task<Category> ObtenerPorId(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("sp_categorySelectById", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@CategoryId", id);

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Category
                {
                    CategoryId = Convert.ToInt32(reader["CategoryId"]),
                    Name = reader["Name"].ToString(),
                    Description = reader["Description"].ToString(),
                    State = Convert.ToInt32(reader["State"])
                };
            }

            return null;
        }

        public async Task<Category> Crear(Category categoria)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("sp_categoryInsert", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Name", categoria.Name);
            cmd.Parameters.AddWithValue("@Description", categoria.Description);

            var idOut = new SqlParameter("@NewCategoryId", SqlDbType.Int) { Direction = ParameterDirection.Output };
            var successOut = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };

            cmd.Parameters.Add(idOut);
            cmd.Parameters.Add(successOut);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            categoria.NewCategoryId = (int?)idOut.Value;
            categoria.Success = (bool?)successOut.Value == true ? 1 : 0;

            return categoria;
        }

        public async Task<Category> Editar(Category categoria)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("sp_categoryUpdate", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@CategoryId", categoria.CategoryId);
            cmd.Parameters.AddWithValue("@Name", categoria.Name);
            cmd.Parameters.AddWithValue("@Description", categoria.Description);

            var successOut = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(successOut);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            categoria.Success = (bool?)successOut.Value == true ? 1 : 0;

            return categoria;
        }

        public async Task<Category> Eliminar(Category categoria)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("sp_categoryLogicDelete", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@CategoryId", categoria.CategoryId);

            var successOut = new SqlParameter("@Success", SqlDbType.Bit) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(successOut);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            categoria.Success = (bool?)successOut.Value == true ? 1 : 0;

            return categoria;
        }
    }
}
