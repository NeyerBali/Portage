using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Porteo.Models.Justificatifs;
using Porteo.ModelViews.Justificatifs;
using Porteo.Repositories;
using Porteo.Services.Activities;

namespace Porteo.Services.Justificatifs
{
    public interface IJustificatifService
    {
        Task<IEnumerable<JustificatifDto>> GetAll(int? ownerConsultantId);
        Task<JustificatifDto> GetDto(int id, int? ownerConsultantId);
        Task<Justificatif> GetForDownload(int id, int? ownerConsultantId);
        Task<JustificatifDto> Create(JustificatifCreateForm form, byte[] fileData, string fileName, string contentType, int? ownerConsultantId, int? userId, string userName);
        Task<JustificatifDto> Validate(int id, int? userId, string userName);
        Task<JustificatifDto> Reject(int id, string motif, int? userId, string userName);
        Task<bool> Delete(int id, int? ownerConsultantId);
    }

    public class JustificatifService : IJustificatifService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IActivityService _activity;

        public JustificatifService(IUnitOfWork uow, IMapper mapper, IActivityService activity)
        {
            _uow = uow;
            _mapper = mapper;
            _activity = activity;
        }

        public async Task<IEnumerable<JustificatifDto>> GetAll(int? ownerConsultantId)
        {
            var query = _uow.Justificatifs.QueryWithRelations();
            if (ownerConsultantId.HasValue)
                query = query.Where(j => j.ConsultantId == ownerConsultantId.Value);
            var list = await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
            return _mapper.Map<List<JustificatifDto>>(list);
        }

        public async Task<JustificatifDto> GetDto(int id, int? ownerConsultantId)
        {
            var j = await _uow.Justificatifs.GetWithRelations(id);
            if (j == null) return null;
            if (ownerConsultantId.HasValue && j.ConsultantId != ownerConsultantId.Value) return null;
            return _mapper.Map<JustificatifDto>(j);
        }

        public async Task<Justificatif> GetForDownload(int id, int? ownerConsultantId)
        {
            var j = await _uow.Justificatifs.GetById(id);
            if (j == null || j.Data == null) return null;
            if (ownerConsultantId.HasValue && j.ConsultantId != ownerConsultantId.Value) return null;
            return j;
        }

        public async Task<JustificatifDto> Create(JustificatifCreateForm form, byte[] fileData, string fileName, string contentType, int? ownerConsultantId, int? userId, string userName)
        {
            var mission = await _uow.Missions.GetById(form.MissionId);
            if (mission == null) throw new ArgumentException("Mission introuvable.");
            // Un consultant ne peut déposer que sur ses propres missions.
            if (ownerConsultantId.HasValue && mission.ConsultantId != ownerConsultantId.Value)
                throw new ArgumentException("Vous ne pouvez déposer un justificatif que sur vos missions.");
            if (!JustificatifType.All.Contains(form.Type))
                throw new ArgumentException("Type de justificatif invalide.");

            var j = new Justificatif
            {
                MissionId = form.MissionId,
                ConsultantId = mission.ConsultantId,
                Type = form.Type,
                Libelle = form.Libelle,
                Montant = form.Montant,
                DateJustificatif = DateTime.SpecifyKind(form.DateJustificatif == default ? DateTime.UtcNow : form.DateJustificatif, DateTimeKind.Utc),
                Notes = form.Notes,
                Statut = JustificatifStatut.EnAttente,
                FileName = fileName,
                ContentType = contentType,
                Data = fileData,
                CreatedAt = DateTime.UtcNow,
            };
            _uow.Justificatifs.Add(j);
            await _uow.CompleteAsync();

            await _activity.Log("justif_created", "Justificatif déposé", $"{form.Libelle} · {mission.Titre}", userId, userName, mission.ConsultantId);
            return await GetDto(j.Id, null);
        }

        public async Task<JustificatifDto> Validate(int id, int? userId, string userName)
        {
            var j = await _uow.Justificatifs.GetById(id);
            if (j == null) return null;
            j.Statut = JustificatifStatut.Valide;
            j.MotifRefus = null;
            j.DateTraitement = DateTime.UtcNow;
            j.UpdatedAt = DateTime.UtcNow;
            _uow.Justificatifs.Update(j);
            await _uow.CompleteAsync();
            await _activity.Log("justif_validated", "Justificatif validé", j.Libelle, userId, userName, j.ConsultantId);
            return await GetDto(j.Id, null);
        }

        public async Task<JustificatifDto> Reject(int id, string motif, int? userId, string userName)
        {
            var j = await _uow.Justificatifs.GetById(id);
            if (j == null) return null;
            j.Statut = JustificatifStatut.Refuse;
            j.MotifRefus = motif;
            j.DateTraitement = DateTime.UtcNow;
            j.UpdatedAt = DateTime.UtcNow;
            _uow.Justificatifs.Update(j);
            await _uow.CompleteAsync();
            await _activity.Log("justif_rejected", "Justificatif refusé", $"{j.Libelle} — {motif}", userId, userName, j.ConsultantId);
            return await GetDto(j.Id, null);
        }

        public async Task<bool> Delete(int id, int? ownerConsultantId)
        {
            var j = await _uow.Justificatifs.GetById(id);
            if (j == null) return false;
            if (ownerConsultantId.HasValue && (j.ConsultantId != ownerConsultantId.Value || j.Statut != JustificatifStatut.EnAttente))
                return false; // un consultant ne supprime que ses justificatifs encore en attente
            _uow.Justificatifs.Delete(j);
            return await _uow.CompleteAsync();
        }
    }
}
