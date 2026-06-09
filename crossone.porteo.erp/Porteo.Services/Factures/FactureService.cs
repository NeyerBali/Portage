using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Porteo.Models.Factures;
using Porteo.ModelViews.Factures;
using Porteo.Repositories;
using Porteo.Services.Common;

namespace Porteo.Services.Factures
{
    public interface IFactureService : IGenericService<Facture>
    {
        Task<IEnumerable<FactureDto>> GetAll(int? ownerConsultantId);
        Task<FactureDto> GetDto(int id, int? ownerConsultantId);
        Task<FactureDto> CreateFacture(FactureUpsertDto dto);
        Task<FactureDto> UpdateFacture(int id, FactureUpsertDto dto);
        Task<FactureDto> MarkPaid(int id);
        Task<bool> DeleteFacture(int id);
    }

    public class FactureService : GenericService<Facture>, IFactureService
    {
        private readonly IMapper _mapper;

        public FactureService(IUnitOfWork uow, IMapper mapper) : base(uow, uow.Factures)
        {
            _mapper = mapper;
        }

        public async Task<IEnumerable<FactureDto>> GetAll(int? ownerConsultantId)
        {
            var query = _uow.Factures.QueryWithRelations();
            if (ownerConsultantId.HasValue)
                query = query.Where(f => f.Mission.ConsultantId == ownerConsultantId.Value);

            var list = await query.OrderByDescending(f => f.DateEmission).ToListAsync();
            return _mapper.Map<List<FactureDto>>(list);
        }

        public async Task<FactureDto> GetDto(int id, int? ownerConsultantId)
        {
            var facture = await _uow.Factures.GetWithRelations(id);
            if (facture == null) return null;
            if (ownerConsultantId.HasValue && facture.Mission?.ConsultantId != ownerConsultantId.Value) return null;
            return _mapper.Map<FactureDto>(facture);
        }

        public async Task<FactureDto> CreateFacture(FactureUpsertDto dto)
        {
            Validate(dto);
            var facture = _mapper.Map<Facture>(dto);
            ComputeAmounts(facture, dto.TauxTva);
            facture.Numero = await GenerateNumero(dto.DateEmission.Year);
            facture.CreatedAt = DateTime.UtcNow;
            facture.DateEmission = DateTime.SpecifyKind(facture.DateEmission, DateTimeKind.Utc);
            facture.DateEcheance = DateTime.SpecifyKind(facture.DateEcheance, DateTimeKind.Utc);
            if (string.IsNullOrWhiteSpace(facture.Statut)) facture.Statut = FactureStatut.Brouillon;

            _uow.Factures.Add(facture);
            await _uow.CompleteAsync();
            return await GetDto(facture.Id, null);
        }

        public async Task<FactureDto> UpdateFacture(int id, FactureUpsertDto dto)
        {
            var facture = await _uow.Factures.GetById(id);
            if (facture == null) return null;
            Validate(dto);
            _mapper.Map(dto, facture);
            ComputeAmounts(facture, dto.TauxTva);
            facture.UpdatedAt = DateTime.UtcNow;
            facture.DateEmission = DateTime.SpecifyKind(facture.DateEmission, DateTimeKind.Utc);
            facture.DateEcheance = DateTime.SpecifyKind(facture.DateEcheance, DateTimeKind.Utc);
            _uow.Factures.Update(facture);
            await _uow.CompleteAsync();
            return await GetDto(facture.Id, null);
        }

        public async Task<FactureDto> MarkPaid(int id)
        {
            var facture = await _uow.Factures.GetById(id);
            if (facture == null) return null;
            facture.Statut = FactureStatut.Payee;
            facture.UpdatedAt = DateTime.UtcNow;
            _uow.Factures.Update(facture);
            await _uow.CompleteAsync();
            return await GetDto(facture.Id, null);
        }

        public async Task<bool> DeleteFacture(int id)
        {
            var facture = await _uow.Factures.GetById(id);
            if (facture == null) return false;
            _uow.Factures.Delete(facture);
            return await _uow.CompleteAsync();
        }

        private async Task<string> GenerateNumero(int year)
        {
            var count = await _uow.Factures.CountForYear(year);
            return $"FAC-{year}-{(count + 1):0000}";
        }

        private static void ComputeAmounts(Facture facture, decimal tauxTva)
        {
            facture.Tva = Math.Round(facture.MontantHT * (tauxTva / 100m), 2);
            facture.MontantTTC = Math.Round(facture.MontantHT + facture.Tva, 2);
        }

        private static void Validate(FactureUpsertDto dto)
        {
            if (dto.MontantHT <= 0)
                throw new ArgumentException("Le montant HT doit être supérieur à 0.");
            if (dto.DateEcheance.Date < dto.DateEmission.Date)
                throw new ArgumentException("L'échéance doit être postérieure ou égale à la date d'émission.");
            if (!string.IsNullOrWhiteSpace(dto.Statut) && !FactureStatut.All.Contains(dto.Statut))
                throw new ArgumentException("Statut de facture invalide.");
        }
    }
}
