using Microsoft.EntityFrameworkCore;
using Porteo.Models.Monitorings;
using Porteo.Models.Productions;
using Porteo.ModelViews.Monitorings;
using Porteo.Repositories;
using Porteo.Services.Configurations;

namespace Porteo.Services.Monitorings
{
    public interface IPayslipService
    {
        Task<IEnumerable<PayslipDto>> GetAll(int? ownerConsultantId);
        Task<PayslipDto> Generate(int consultantId, string mois);
        Task<bool> Delete(int id);
    }

    public class PayslipService : IPayslipService
    {
        private readonly IUnitOfWork _uow;
        private readonly IConfigService _config;
        public PayslipService(IUnitOfWork uow, IConfigService config) { _uow = uow; _config = config; }

        private IQueryable<Payslip> Q() => _uow.Payslips.Query().Include(p => p.Consultant).AsNoTracking();

        public static PayslipDto Map(Payslip p) => new()
        {
            Id = p.Id, ConsultantId = p.ConsultantId, ConsultantNom = p.Consultant != null ? $"{p.Consultant.Prenom} {p.Consultant.Nom}" : null,
            Mois = p.Mois, JoursTravailles = p.JoursTravailles, Facturable = p.Facturable, FraisGestion = p.FraisGestion,
            Brut = p.Brut, ChargesSalariales = p.ChargesSalariales, ChargesPatronales = p.ChargesPatronales, Net = p.Net,
            Statut = p.Statut, CreatedAt = p.CreatedAt,
        };

        public async Task<IEnumerable<PayslipDto>> GetAll(int? owner)
        {
            var q = Q();
            if (owner.HasValue) q = q.Where(p => p.ConsultantId == owner.Value);
            return (await q.OrderByDescending(p => p.Mois).ToListAsync()).Select(Map);
        }

        public async Task<PayslipDto> Generate(int consultantId, string mois)
        {
            // CRA validés du consultant pour le mois, joints aux missions (pour le TJM).
            var cras = await _uow.Cras.Query().Include(c => c.Mission).AsNoTracking()
                .Where(c => c.ConsultantId == consultantId && c.Mois == mois && c.Statut == CraStatut.Valide)
                .ToListAsync();
            if (cras.Count == 0)
                throw new ArgumentException("Aucun CRA validé pour ce consultant sur ce mois.");

            var jours = cras.Sum(c => c.JoursTravailles);
            var facturable = cras.Sum(c => c.JoursTravailles * (c.Mission?.Tjm ?? 0));

            var fgPct = await _config.GetDecimal(Porteo.Models.Configurations.ParamKeys.FraisGestion, 8m);
            var cpPct = await _config.GetDecimal(Porteo.Models.Configurations.ParamKeys.ChargesPatronales, 42m);
            var csPct = await _config.GetDecimal(Porteo.Models.Configurations.ParamKeys.ChargesSalariales, 22m);

            var fraisGestion = Math.Round(facturable * fgPct / 100m, 2);
            var coutEmployeur = facturable - fraisGestion;
            var brut = Math.Round(coutEmployeur / (1 + cpPct / 100m), 2);
            var chargesPat = Math.Round(coutEmployeur - brut, 2);
            var chargesSal = Math.Round(brut * csPct / 100m, 2);
            var net = Math.Round(brut - chargesSal, 2);

            // Remplace un bulletin existant pour ce consultant+mois.
            var existing = (await _uow.Payslips.Find(p => p.ConsultantId == consultantId && p.Mois == mois)).FirstOrDefault();
            var p = existing ?? new Payslip { ConsultantId = consultantId, Mois = mois, CreatedAt = DateTime.UtcNow };
            p.JoursTravailles = jours; p.Facturable = facturable; p.FraisGestion = fraisGestion;
            p.Brut = brut; p.ChargesSalariales = chargesSal; p.ChargesPatronales = chargesPat; p.Net = net;
            p.Statut = "emis"; p.UpdatedAt = DateTime.UtcNow;
            if (existing == null) _uow.Payslips.Add(p);
            else _uow.Payslips.Update(p);
            await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == p.Id));
        }

        public async Task<bool> Delete(int id)
        {
            var p = await _uow.Payslips.GetById(id);
            if (p == null) return false;
            _uow.Payslips.Delete(p); return await _uow.CompleteAsync();
        }
    }
}
