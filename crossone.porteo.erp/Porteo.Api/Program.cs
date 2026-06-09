using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Porteo.Api.Data;
using Porteo.Dapper.Dashboard;
using Porteo.Mappers.Missions;
using Porteo.Repositories;
using Porteo.Repositories.Context;
using Porteo.Scheduler;
using Porteo.Services;
using Porteo.Services.Activities;
using Porteo.Services.Alerts;
using Porteo.Services.Clients;
using Porteo.Services.Consultants;
using Porteo.Services.Dashboard;
using Porteo.Services.Factures;
using Porteo.Services.Justificatifs;
using Porteo.Services.Missions;
using Porteo.Services.Search;
using Porteo.Services.Users;
using Npgsql;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Culture invariante : binding fiable des décimaux (point décimal) quel que soit l'OS.
var invariant = System.Globalization.CultureInfo.InvariantCulture;
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = invariant;
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = invariant;

// ---- Port d'écoute (PaaS : Render/Railway/Heroku injectent la variable PORT) ----
var listenPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(listenPort))
    builder.WebHost.UseUrls($"http://0.0.0.0:{listenPort}");

// ---- Serilog ----
builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/porteo-.log", rollingInterval: RollingInterval.Day));

// ---- Controllers + JSON ----
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// ---- CORS (front Angular en dev) ----
const string CorsPolicy = "PorteoCors";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .SetIsOriginAllowed(_ => true)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

// ---- EF Core / PostgreSQL ----
// Accepte aussi bien le format Npgsql (Host=…;Username=…) que l'URL
// PostgreSQL des PaaS (postgres://user:pass@host:port/db).
var cnx = NormalizeConnectionString(builder.Configuration.GetConnectionString("CnxString"));
builder.Services.AddDbContext<PorteoDbContext>(opt =>
    opt.UseNpgsql(cnx, b => b.MigrationsAssembly("Porteo.Api")));

static string NormalizeConnectionString(string raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return raw;
    if (!raw.StartsWith("postgres://") && !raw.StartsWith("postgresql://")) return raw;

    var uri = new Uri(raw);
    var userInfo = uri.UserInfo.Split(':', 2);
    var builderCs = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        Database = uri.AbsolutePath.TrimStart('/'),
        SslMode = SslMode.Prefer,
        TrustServerCertificate = true,
    };
    return builderCs.ConnectionString;
}

// ---- Dependency Injection ----
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddSingleton<IDashboardQueries, DashboardQueries>();

builder.Services.AddScoped<IMissionService, MissionService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IConsultantService, ConsultantService>();
builder.Services.AddScoped<IFactureService, FactureService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IJustificatifService, JustificatifService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IServices, Porteo.Services.Services>();

// ---- AutoMapper ----
builder.Services.AddAutoMapper(typeof(MissionProfile).Assembly);

// ---- JWT ----
var jwtSecret = builder.Configuration.GetSection("AppSettings:Token").Value
                ?? "porteo-super-secret-key-change-me-please-0123456789";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();

// ---- Swagger ----
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Portéo API", Version = "v1", Description = "API REST de gestion du portage salarial." });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Bearer. Saisir : Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// ---- Scheduler (Quartz : relance des factures impayées) ----
builder.Services.AddSchedulerInfrastructure(builder.Configuration.GetSection("Scheduler:RelanceCron").Value);

var app = builder.Build();

// ---- Migrations + seed au démarrage ----
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PorteoDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        await DbInitializer.SeedAsync(db, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Échec de l'initialisation de la base de données.");
    }
}

// ---- Pipeline ----
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portéo API v1"));

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
