using Porteo.Services.Activities;
using Porteo.Services.Alerts;
using Porteo.Services.Clients;
using Porteo.Services.Configurations;
using Porteo.Services.Consultants;
using Porteo.Services.Dashboard;
using Porteo.Services.Factures;
using Porteo.Services.Justificatifs;
using Porteo.Services.Missions;
using Porteo.Services.Monitorings;
using Porteo.Services.Productions;
using Porteo.Services.Rh;
using Porteo.Services.Search;
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
        IJustificatifService Justificatifs { get; }
        IActivityService Activities { get; }
        IAlertService Alerts { get; }
        ISearchService Search { get; }
        ICraService Cras { get; }
        IAbsenceService Absences { get; }
        IDemandeService Demandes { get; }
        IConfigService Config { get; }
        IPayslipService Payslips { get; }
    }

    public class Services : IServices
    {
        public IMissionService Missions { get; }
        public IClientService Clients { get; }
        public IConsultantService Consultants { get; }
        public IFactureService Factures { get; }
        public IUserService Users { get; }
        public IDashboardService Dashboard { get; }
        public IJustificatifService Justificatifs { get; }
        public IActivityService Activities { get; }
        public IAlertService Alerts { get; }
        public ISearchService Search { get; }
        public ICraService Cras { get; }
        public IAbsenceService Absences { get; }
        public IDemandeService Demandes { get; }
        public IConfigService Config { get; }
        public IPayslipService Payslips { get; }

        public Services(
            IMissionService missions,
            IClientService clients,
            IConsultantService consultants,
            IFactureService factures,
            IUserService users,
            IDashboardService dashboard,
            IJustificatifService justificatifs,
            IActivityService activities,
            IAlertService alerts,
            ISearchService search,
            ICraService cras,
            IAbsenceService absences,
            IDemandeService demandes,
            IConfigService config,
            IPayslipService payslips)
        {
            Missions = missions;
            Clients = clients;
            Consultants = consultants;
            Factures = factures;
            Users = users;
            Dashboard = dashboard;
            Justificatifs = justificatifs;
            Activities = activities;
            Alerts = alerts;
            Search = search;
            Cras = cras;
            Absences = absences;
            Demandes = demandes;
            Config = config;
            Payslips = payslips;
        }
    }
}
