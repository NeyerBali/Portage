using Microsoft.EntityFrameworkCore;
using Porteo.Models.Rh;
using Porteo.ModelViews.Rh;
using Porteo.Repositories;

namespace Porteo.Services.Rh
{
    public interface IDemandeService
    {
        Task<IEnumerable<DemandeDto>> GetAll(int? ownerConsultantId);
        Task<DemandeDto> Create(DemandeUpsertDto dto, int ownerConsultantId);
        Task<DemandeDto> Repondre(int id, DemandeReponseDto dto);
        Task<bool> Delete(int id, int? ownerConsultantId);
    }

    public class DemandeService : IDemandeService
    {
        private readonly IUnitOfWork _uow;
        public DemandeService(IUnitOfWork uow) { _uow = uow; }

        private IQueryable<Demande> Q() => _uow.Demandes.Query().Include(d => d.Consultant).AsNoTracking();

        public static DemandeDto Map(Demande d) => new()
        {
            Id = d.Id, ConsultantId = d.ConsultantId, ConsultantNom = d.Consultant != null ? $"{d.Consultant.Prenom} {d.Consultant.Nom}" : null,
            Type = d.Type, Objet = d.Objet, Montant = d.Montant, Description = d.Description,
            Statut = d.Statut, Reponse = d.Reponse, CreatedAt = d.CreatedAt,
        };

        public async Task<IEnumerable<DemandeDto>> GetAll(int? owner)
        {
            var q = Q();
            if (owner.HasValue) q = q.Where(d => d.ConsultantId == owner.Value);
            return (await q.OrderByDescending(d => d.CreatedAt).ToListAsync()).Select(Map);
        }

        public async Task<DemandeDto> Create(DemandeUpsertDto dto, int ownerConsultantId)
        {
            var d = new Demande
            {
                ConsultantId = ownerConsultantId, Type = dto.Type, Objet = dto.Objet,
                Montant = dto.Montant, Description = dto.Description, Statut = DemandeStatut.Ouverte, CreatedAt = DateTime.UtcNow,
            };
            _uow.Demandes.Add(d); await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == d.Id));
        }

        public async Task<DemandeDto> Repondre(int id, DemandeReponseDto dto)
        {
            var d = await _uow.Demandes.GetById(id);
            if (d == null) return null;
            d.Statut = dto.Statut == DemandeStatut.Refusee ? DemandeStatut.Refusee : DemandeStatut.Traitee;
            d.Reponse = dto.Reponse; d.UpdatedAt = DateTime.UtcNow;
            _uow.Demandes.Update(d); await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == id));
        }

        public async Task<bool> Delete(int id, int? owner)
        {
            var d = await _uow.Demandes.GetById(id);
            if (d == null) return false;
            if (owner.HasValue && (d.ConsultantId != owner.Value || d.Statut != DemandeStatut.Ouverte)) return false;
            _uow.Demandes.Delete(d); return await _uow.CompleteAsync();
        }
    }
}
