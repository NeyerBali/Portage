using Microsoft.EntityFrameworkCore;
using Porteo.Models.Configurations;
using Porteo.ModelViews.Configurations;
using Porteo.Repositories;

namespace Porteo.Services.Configurations
{
    public interface IConfigService
    {
        Task<IEnumerable<GlobalParameterDto>> GetParameters();
        Task<GlobalParameterDto> UpdateParameter(string cle, string valeur);
        Task<AgencyProfileDto> GetAgency();
        Task<AgencyProfileDto> UpdateAgency(AgencyProfileDto dto);
        Task<SimulationResult> Simulate(SimulationRequest req);
        Task<decimal> GetDecimal(string cle, decimal fallback);
    }

    public class ConfigService : IConfigService
    {
        private readonly IUnitOfWork _uow;
        public ConfigService(IUnitOfWork uow) { _uow = uow; }

        public async Task<IEnumerable<GlobalParameterDto>> GetParameters()
        {
            var list = await _uow.Parameters.Query().AsNoTracking().OrderBy(p => p.Groupe).ThenBy(p => p.Libelle).ToListAsync();
            return list.Select(p => new GlobalParameterDto { Id = p.Id, Cle = p.Cle, Libelle = p.Libelle, Valeur = p.Valeur, Groupe = p.Groupe });
        }

        public async Task<GlobalParameterDto> UpdateParameter(string cle, string valeur)
        {
            var p = (await _uow.Parameters.Find(x => x.Cle == cle)).FirstOrDefault();
            if (p == null) return null;
            p.Valeur = valeur; p.UpdatedAt = DateTime.UtcNow;
            _uow.Parameters.Update(p); await _uow.CompleteAsync();
            return new GlobalParameterDto { Id = p.Id, Cle = p.Cle, Libelle = p.Libelle, Valeur = p.Valeur, Groupe = p.Groupe };
        }

        public async Task<decimal> GetDecimal(string cle, decimal fallback)
        {
            var p = (await _uow.Parameters.Find(x => x.Cle == cle)).FirstOrDefault();
            return p != null && decimal.TryParse(p.Valeur, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var v) ? v : fallback;
        }

        public async Task<AgencyProfileDto> GetAgency()
        {
            var a = (await _uow.AgencyProfiles.All()).FirstOrDefault();
            if (a == null) return new AgencyProfileDto();
            return Map(a);
        }

        public async Task<AgencyProfileDto> UpdateAgency(AgencyProfileDto dto)
        {
            var a = (await _uow.AgencyProfiles.All()).FirstOrDefault();
            if (a == null)
            {
                a = new AgencyProfile { CreatedAt = DateTime.UtcNow };
                _uow.AgencyProfiles.Add(a);
            }
            a.RaisonSociale = dto.RaisonSociale; a.Siret = dto.Siret; a.TvaIntra = dto.TvaIntra;
            a.Adresse = dto.Adresse; a.Ville = dto.Ville; a.Email = dto.Email; a.Telephone = dto.Telephone;
            a.SiteWeb = dto.SiteWeb; a.Iban = dto.Iban; a.UpdatedAt = DateTime.UtcNow;
            // Logo/Signature : ne pas écraser si le client renvoie null (ex. sauvegarde des champs texte seuls).
            if (dto.Logo != null) a.Logo = dto.Logo;
            if (dto.Signature != null) a.Signature = dto.Signature;
            await _uow.CompleteAsync();
            return Map(a);
        }

        public async Task<SimulationResult> Simulate(SimulationRequest req)
        {
            var fg = req.FraisGestionPct ?? await GetDecimal(ParamKeys.FraisGestion, 8m);
            var cp = req.ChargesPatronalesPct ?? await GetDecimal(ParamKeys.ChargesPatronales, 42m);
            var cs = req.ChargesSalarialesPct ?? await GetDecimal(ParamKeys.ChargesSalariales, 22m);

            var facturable = req.Tjm * req.JoursParMois;
            var fraisGestion = Math.Round(facturable * fg / 100m, 2);
            var coutEmployeur = facturable - fraisGestion;                 // enveloppe salariale
            var brut = Math.Round(coutEmployeur / (1 + cp / 100m), 2);     // brut chargé patronal
            var chargesPat = Math.Round(coutEmployeur - brut, 2);
            var chargesSal = Math.Round(brut * cs / 100m, 2);
            var net = Math.Round(brut - chargesSal, 2);

            return new SimulationResult
            {
                Facturable = facturable, FraisGestion = fraisGestion, CoutEmployeur = coutEmployeur,
                ChargesPatronales = chargesPat, Brut = brut, ChargesSalariales = chargesSal, Net = net,
                FraisGestionPct = fg, ChargesSalarialesPct = cs, ChargesPatronalesPct = cp,
            };
        }

        private static AgencyProfileDto Map(AgencyProfile a) => new()
        {
            Id = a.Id, RaisonSociale = a.RaisonSociale, Siret = a.Siret, TvaIntra = a.TvaIntra,
            Adresse = a.Adresse, Ville = a.Ville, Email = a.Email, Telephone = a.Telephone, SiteWeb = a.SiteWeb, Iban = a.Iban,
            Logo = a.Logo, Signature = a.Signature,
        };
    }
}
