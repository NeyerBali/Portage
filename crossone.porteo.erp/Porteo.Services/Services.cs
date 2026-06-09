using Porteo.Services.Clients;
using Porteo.Services.Consultants;
using Porteo.Services.Dashboard;
using Porteo.Services.Factures;
using Porteo.Services.Missions;
using Porteo.Services.Users;

namespace Porteo.Services
{
    /// <summary>
    /// Façade agrégeant tous les services de domaine (même esprit que l'IServices
    /// de l'ERP de référence) — injectée dans les contrôleurs.
    /// </summary>
    public interface IServices
    {
        IMissionService Missions { get; }
        IClientService Clients { get; }
        IConsultantService Consultants { get; }
        IFactureService Factures { get; }
        IUserService Users { get; }
        IDashboardService Dashboard { get; }
    }

    public class Services : IServices
    {
        public IMissionService Missions { get; }
        public IClientService Clients { get; }
        public IConsultantService Consultants { get; }
        public IFactureService Factures { get; }
        public IUserService Users { get; }
        public IDashboardService Dashboard { get; }

        public Services(
            IMissionService missions,
            IClientService clients,
            IConsultantService consultants,
            IFactureService factures,
            IUserService users,
            IDashboardService dashboard)
        {
            Missions = missions;
            Clients = clients;
            Consultants = consultants;
            Factures = factures;
            Users = users;
            Dashboard = dashboard;
        }
    }
}
