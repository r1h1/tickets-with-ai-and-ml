using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SistemaTicketsIAApi.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicios al contenedor
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cargar clave secreta para JWT
var secretKey = builder.Configuration.GetSection("settings")["secretkey"];
var keyBytes = Encoding.ASCII.GetBytes(secretKey!);

builder.Services.AddAuthentication(config =>
{
    config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(config =>
{
    config.RequireHttpsMetadata = false;
    config.SaveToken = true;
    config.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero // Para validar expiraci�n exacta
    };
});

builder.Services.AddAuthorization();

// Configuraci�n de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", app =>
    {
        app.AllowAnyOrigin()
           .AllowAnyHeader()
           .AllowAnyMethod();
    });
});

// Inyecci�n de dependencias
builder.Services.AddSingleton<UsersData>();
builder.Services.AddSingleton<RolesData>();
builder.Services.AddSingleton<AuthData>();

var app = builder.Build();

// Configuraci�n del pipeline HTTP
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("NuevaPolitica");

app.UseHttpsRedirection();

app.UseAuthentication(); // Agregado para JWT
app.UseAuthorization();

app.MapControllers();

app.Run();