using Microsoft.EntityFrameworkCore;
using Porteo.Models.Productions;
using Porteo.ModelViews.Productions;
using Porteo.Repositories;

namespace Porteo.Services.Productions
{
    // ===================== CRA =====================
    public interface ICraService
    {
        Task<IEnumerable<CraDto>> GetAll(int? ownerConsultantId);
        Task<CraDto> Create(CraUpsertDto dto, int? ownerConsultantId);
        Task<CraDto> Submit(int id, int? ownerConsultantId);
        Task<CraDto> SetStatut(int id, string statut);
        Task<bool> Delete(int id, int? ownerConsultantId);
    }

    public class CraService : ICraService
    {
        private readonly IUnitOfWork _uow;
        public CraService(IUnitOfWork uow) { _uow = uow; }

        private IQueryable<Cra> Q() =>
            _uow.Cras.Query().Include(c => c.Mission).Include(c => c.Consultant).AsNoTracking();

        public static CraDto Map(Cra c) => new()
        {
            Id = c.Id, MissionId = c.MissionId, MissionTitre = c.Mission?.Titre,
            ConsultantId = c.ConsultantId, ConsultantNom = c.Consultant != null ? $"{c.Consultant.Prenom} {c.Consultant.Nom}" : null,
            Mois = c.Mois, JoursTravailles = c.JoursTravailles, JoursAbsence = c.JoursAbsence,
            Commentaire = c.Commentaire, Statut = c.Statut, CreatedAt = c.CreatedAt,
        };

        public async Task<IEnumerable<CraDto>> GetAll(int? owner)
        {
            var q = Q();
            if (owner.HasValue) q = q.Where(c => c.ConsultantId == owner.Value);
            return (await q.OrderByDescending(c => c.Mois).ToListAsync()).Select(Map);
        }

        public async Task<CraDto> Create(CraUpsertDto dto, int? owner)
        {
            var mission = await _uow.Missions.GetById(dto.MissionId) ?? throw new ArgumentException("Mission introuvable.");
            if (owner.HasValue && mission.ConsultantId != owner.Value) throw new ArgumentException("Mission non rattachée à votre profil.");
            var c = new Cra
            {
                MissionId = dto.MissionId, ConsultantId = mission.ConsultantId, Mois = dto.Mois,
                JoursTravailles = dto.JoursTravailles, JoursAbsence = dto.JoursAbsence,
                Commentaire = dto.Commentaire, Statut = CraStatut.Brouillon, CreatedAt = DateTime.UtcNow,
            };
            _uow.Cras.Add(c);
            await _uow.CompleteAsync();
            return Map((await Q().FirstAsync(x => x.Id == c.Id)));
        }

        public async Task<CraDto> Submit(int id, int? owner)
        {
            var c = await _uow.Cras.GetById(id);
            if (c == null || (owner.HasValue && c.ConsultantId != owner.Value)) return null;
            c.Statut = CraStatut.Soumis; c.UpdatedAt = DateTime.UtcNow;
            _uow.Cras.Update(c); await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == id));
        }

        public async Task<CraDto> SetStatut(int id, string statut)
        {
            var c = await _uow.Cras.GetById(id);
            if (c == null) return null;
            c.Statut = statut; c.UpdatedAt = DateTime.UtcNow;
            _uow.Cras.Update(c); await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == id));
        }

        public async Task<bool> Delete(int id, int? owner)
        {
            var c = await _uow.Cras.GetById(id);
            if (c == null) return false;
            if (owner.HasValue && (c.ConsultantId != owner.Value || c.Statut != CraStatut.Brouillon)) return false;
            _uow.Cras.Delete(c); return await _uow.CompleteAsync();
        }
    }

    // ===================== Absences =====================
    public interface IAbsenceService
    {
        Task<IEnumerable<AbsenceDto>> GetAll(int? ownerConsultantId);
        Task<AbsenceDto> Create(AbsenceUpsertDto dto, int ownerConsultantId);
        Task<AbsenceDto> SetStatut(int id, string statut);
        Task<bool> Delete(int id, int? ownerConsultantId);
    }

    public class AbsenceService : IAbsenceService
    {
        private readonly IUnitOfWork _uow;
        public AbsenceService(IUnitOfWork uow) { _uow = uow; }

        private IQueryable<Absence> Q() => _uow.Absences.Query().Include(a => a.Consultant).AsNoTracking();

        public static AbsenceDto Map(Absence a) => new()
        {
            Id = a.Id, ConsultantId = a.ConsultantId, ConsultantNom = a.Consultant != null ? $"{a.Consultant.Prenom} {a.Consultant.Nom}" : null,
            Type = a.Type, DateDebut = a.DateDebut, DateFin = a.DateFin, NbJours = a.NbJours, Motif = a.Motif, Statut = a.Statut,
        };

        public async Task<IEnumerable<AbsenceDto>> GetAll(int? owner)
        {
            var q = Q();
            if (owner.HasValue) q = q.Where(a => a.ConsultantId == owner.Value);
            return (await q.OrderByDescending(a => a.DateDebut).ToListAsync()).Select(Map);
        }

        public async Task<AbsenceDto> Create(AbsenceUpsertDto dto, int ownerConsultantId)
        {
            if (dto.DateFin.Date < dto.DateDebut.Date) throw new ArgumentException("La date de fin doit être ≥ à la date de début.");
            var nb = BusinessDays(dto.DateDebut, dto.DateFin);
            var a = new Absence
            {
                ConsultantId = ownerConsultantId, Type = dto.Type,
                DateDebut = DateTime.SpecifyKind(dto.DateDebut, DateTimeKind.Utc),
                DateFin = DateTime.SpecifyKind(dto.DateFin, DateTimeKind.Utc),
                NbJours = nb, Motif = dto.Motif, Statut = AbsenceStatut.Demande, CreatedAt = DateTime.UtcNow,
            };
            _uow.Absences.Add(a); await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == a.Id));
        }

        public async Task<AbsenceDto> SetStatut(int id, string statut)
        {
            var a = await _uow.Absences.GetById(id);
            if (a == null) return null;
            a.Statut = statut; a.UpdatedAt = DateTime.UtcNow;
            _uow.Absences.Update(a); await _uow.CompleteAsync();
            return Map(await Q().FirstAsync(x => x.Id == id));
        }

        public async Task<bool> Delete(int id, int? owner)
        {
            var a = await _uow.Absences.GetById(id);
            if (a == null) return false;
            if (owner.HasValue && (a.ConsultantId != owner.Value || a.Statut != AbsenceStatut.Demande)) return false;
            _uow.Absences.Delete(a); return await _uow.CompleteAsync();
        }

        private static decimal BusinessDays(DateTime start, DateTime end)
        {
            int days = 0;
            for (var d = start.Date; d <= end.Date; d = d.AddDays(1))
                if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday) days++;
            return days;
        }
    }
}
