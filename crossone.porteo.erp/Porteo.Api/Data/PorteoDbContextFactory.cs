using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Porteo.Repositories.Context;

namespace Porteo.Api.Data
{
    /// <summary>
    /// Factory utilisée par les outils EF Core en conception (dotnet ef migrations …)
    /// pour instancier le contexte sans démarrer toute l'application.
    /// </summary>
    public class PorteoDbContextFactory : IDesignTimeDbContextFactory<PorteoDbContext>
    {
        public PorteoDbContext CreateDbContext(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var cnx = config.GetConnectionString("CnxString")
                      ?? "Host=localhost;Port=5432;Database=porteo;Username=postgres;Password=root";

            var options = new DbContextOptionsBuilder<PorteoDbContext>()
                .UseNpgsql(cnx, b => b.MigrationsAssembly("Porteo.Api"))
                .Options;

            return new PorteoDbContext(options);
        }
    }
}
