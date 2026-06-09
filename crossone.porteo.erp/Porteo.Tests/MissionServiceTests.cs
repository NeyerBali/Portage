using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Mappers.Clients;
using Porteo.Mappers.Consultants;
using Porteo.Mappers.Factures;
using Porteo.Mappers.Missions;
using Porteo.Models.Clients;
using Porteo.Models.Consultants;
using Porteo.Models.Missions;
using Porteo.ModelViews.Missions;
using Porteo.Repositories;
using Porteo.Repositories.Context;
using Porteo.Services.Missions;

namespace Porteo.Tests
{
    public class MissionServiceTests
    {
        private static IMapper BuildMapper()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MissionProfile>();
                cfg.AddProfile<ClientProfile>();
                cfg.AddProfile<ConsultantProfile>();
                cfg.AddProfile<FactureProfile>();
            });
            return config.CreateMapper();
        }

        private static (MissionService service, PorteoDbContext ctx) BuildService()
        {
            var options = new DbContextOptionsBuilder<PorteoDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var ctx = new PorteoDbContext(options);

            ctx.Clients.Add(new Client { Id = 1, RaisonSociale = "ACME" });
            ctx.Clients.Add(new Client { Id = 2, RaisonSociale = "Globex" });
            ctx.Consultants.Add(new Consultant { Id = 1, Nom = "Rousseau", Prenom = "Camille" });
            ctx.Consultants.Add(new Consultant { Id = 2, Nom = "Lefèvre", Prenom = "Maxime" });
            ctx.Missions.AddRange(
                new Mission { Id = 1, Titre = "Mission A", Statut = MissionStatut.EnCours, ClientId = 1, ConsultantId = 1, Tjm = 600, Jours = 10, DateDebut = new DateTime(2026, 1, 1), DateFin = new DateTime(2026, 2, 1) },
                new Mission { Id = 2, Titre = "Mission B", Statut = MissionStatut.Terminee, ClientId = 2, ConsultantId = 2, Tjm = 700, Jours = 20, DateDebut = new DateTime(2026, 1, 5), DateFin = new DateTime(2026, 3, 1) }
            );
            ctx.SaveChanges();

            var loggerFactory = LoggerFactory.Create(b => { });
            var uow = new UnitOfWork(ctx, loggerFactory);
            return (new MissionService(uow, BuildMapper()), ctx);
        }

        [Fact]
        public async Task GetPaged_Admin_ReturnsAllMissions()
        {
            var (service, _) = BuildService();
            var result = await service.GetPaged(new MissionQueryParams { PageSize = 10 }, ownerConsultantId: null);
            Assert.Equal(2, result.Total);
        }

        [Fact]
        public async Task GetPaged_Consultant_ReturnsOnlyOwnedMissions()
        {
            var (service, _) = BuildService();
            var result = await service.GetPaged(new MissionQueryParams { PageSize = 10 }, ownerConsultantId: 1);
            Assert.Single(result.Items);
            Assert.All(result.Items, m => Assert.Equal(1, m.ConsultantId));
        }

        [Fact]
        public async Task GetPaged_FilterByStatut_Works()
        {
            var (service, _) = BuildService();
            var result = await service.GetPaged(new MissionQueryParams { Statut = MissionStatut.EnCours, PageSize = 10 }, null);
            Assert.Single(result.Items);
            Assert.Equal("Mission A", result.Items.First().Titre);
        }

        [Fact]
        public async Task CreateMission_PersistsAndComputesMontant()
        {
            var (service, ctx) = BuildService();
            var dto = new MissionUpsertDto
            {
                Titre = "Nouvelle mission",
                Statut = MissionStatut.Brouillon,
                ClientId = 1,
                ConsultantId = 1,
                Tjm = 500,
                Jours = 8,
                DateDebut = new DateTime(2026, 4, 1),
                DateFin = new DateTime(2026, 5, 1)
            };

            var created = await service.CreateMission(dto);

            Assert.NotNull(created);
            Assert.Equal(4000m, created.Montant); // 500 * 8
            Assert.Equal(3, ctx.Missions.Count());
        }

        [Fact]
        public async Task CreateMission_ThrowsWhenEndBeforeStart()
        {
            var (service, _) = BuildService();
            var dto = new MissionUpsertDto
            {
                Titre = "Invalide",
                Statut = MissionStatut.Brouillon,
                ClientId = 1,
                ConsultantId = 1,
                Tjm = 500,
                Jours = 8,
                DateDebut = new DateTime(2026, 5, 1),
                DateFin = new DateTime(2026, 4, 1)
            };

            await Assert.ThrowsAsync<ArgumentException>(() => service.CreateMission(dto));
        }
    }
}
