using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Porteo.Models.Missions;
using Porteo.ModelViews.Common;
using Porteo.ModelViews.Missions;
using Porteo.Repositories;
using Porteo.Services.Common;

namespace Porteo.Services.Missions
{
    public interface IMissionService : IGenericService<Mission>
    {
        Task<PagedResult<MissionDto>> GetPaged(MissionQueryParams q, int? ownerConsultantId);
        Task<MissionDto> GetDto(int id, int? ownerConsultantId);
        Task<MissionDetailDto> GetDetail(int id, int? ownerConsultantId);
        Task<MissionDto> CreateMission(MissionUpsertDto dto);
        Task<MissionDto> UpdateMission(int id, MissionUpsertDto dto, int? ownerConsultantId);
        Task<bool> DeleteMission(int id, int? ownerConsultantId);
    }

    public class MissionService : GenericService<Mission>, IMissionService
    {
        private readonly IMapper _mapper;

        public MissionService(IUnitOfWork uow, IMapper mapper) : base(uow, uow.Missions)
        {
            _mapper = mapper;
        }

        public async Task<PagedResult<MissionDto>> GetPaged(MissionQueryParams q, int? ownerConsultantId)
        {
            q ??= new MissionQueryParams();
            var query = _uow.Missions.QueryWithRelations();

            // Filtre d'appartenance : un consultant ne voit que ses missions.
            if (ownerConsultantId.HasValue)
                query = query.Where(m => m.ConsultantId == ownerConsultantId.Value);

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                var s = q.Search.Trim().ToLower();
                query = query.Where(m =>
                    m.Titre.ToLower().Contains(s) ||
                    (m.Client != null && m.Client.RaisonSociale.ToLower().Contains(s)) ||
                    (m.Consultant != null && (m.Consultant.Nom.ToLower().Contains(s) || m.Consultant.Prenom.ToLower().Contains(s))));
            }

            if (!string.IsNullOrWhiteSpace(q.Statut))
                query = query.Where(m => m.Statut == q.Statut);
            if (q.ClientId.HasValue)
                query = query.Where(m => m.ClientId == q.ClientId.Value);
            if (q.ConsultantId.HasValue)
                query = query.Where(m => m.ConsultantId == q.ConsultantId.Value);
            if (q.DebutApres.HasValue)
                query = query.Where(m => m.DateDebut >= q.DebutApres.Value);
            if (q.DebutAvant.HasValue)
                query = query.Where(m => m.DateDebut <= q.DebutAvant.Value);

            query = ApplySort(query, q.SortBy, q.SortDir);

            var total = await query.CountAsync();
            var page = q.Page < 1 ? 1 : q.Page;
            var size = q.PageSize < 1 ? 8 : q.PageSize;

            var items = await query
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            var dtos = _mapper.Map<List<MissionDto>>(items);
            return new PagedResult<MissionDto>(dtos, total, page, size);
        }

        private static IQueryable<Mission> ApplySort(IQueryable<Mission> query, string sortBy, string dir)
        {
            bool desc = string.Equals(dir, "desc", StringComparison.OrdinalIgnoreCase);
            return (sortBy?.ToLower()) switch
            {
                "titre" => desc ? query.OrderByDescending(m => m.Titre) : query.OrderBy(m => m.Titre),
                "client" => desc ? query.OrderByDescending(m => m.Client.RaisonSociale) : query.OrderBy(m => m.Client.RaisonSociale),
                "consultant" => desc ? query.OrderByDescending(m => m.Consultant.Nom) : query.OrderBy(m => m.Consultant.Nom),
                "statut" => desc ? query.OrderByDescending(m => m.Statut) : query.OrderBy(m => m.Statut),
                "montant" => desc ? query.OrderByDescending(m => m.Tjm * m.Jours) : query.OrderBy(m => m.Tjm * m.Jours),
                _ => desc ? query.OrderByDescending(m => m.DateDebut) : query.OrderBy(m => m.DateDebut),
            };
        }

        public async Task<MissionDto> GetDto(int id, int? ownerConsultantId)
        {
            var mission = await _uow.Missions.GetWithRelations(id);
            if (mission == null) return null;
            if (ownerConsultantId.HasValue && mission.ConsultantId != ownerConsultantId.Value) return null;
            return _mapper.Map<MissionDto>(mission);
        }

        public async Task<MissionDetailDto> GetDetail(int id, int? ownerConsultantId)
        {
            var mission = await _uow.Missions.GetWithRelations(id);
            if (mission == null) return null;
            if (ownerConsultantId.HasValue && mission.ConsultantId != ownerConsultantId.Value) return null;
            return _mapper.Map<MissionDetailDto>(mission);
        }

        public async Task<MissionDto> CreateMission(MissionUpsertDto dto)
        {
            Validate(dto);
            var mission = _mapper.Map<Mission>(dto);
            mission.CreatedAt = DateTime.UtcNow;
            mission.DateDebut = DateTime.SpecifyKind(mission.DateDebut, DateTimeKind.Utc);
            mission.DateFin = DateTime.SpecifyKind(mission.DateFin, DateTimeKind.Utc);
            _uow.Missions.Add(mission);
            await _uow.CompleteAsync();
            return await GetDto(mission.Id, null);
        }

        public async Task<MissionDto> UpdateMission(int id, MissionUpsertDto dto, int? ownerConsultantId)
        {
            var mission = await _uow.Missions.GetById(id);
            if (mission == null) return null;
            if (ownerConsultantId.HasValue && mission.ConsultantId != ownerConsultantId.Value) return null;

            Validate(dto);
            _mapper.Map(dto, mission);
            mission.UpdatedAt = DateTime.UtcNow;
            mission.DateDebut = DateTime.SpecifyKind(mission.DateDebut, DateTimeKind.Utc);
            mission.DateFin = DateTime.SpecifyKind(mission.DateFin, DateTimeKind.Utc);
            _uow.Missions.Update(mission);
            await _uow.CompleteAsync();
            return await GetDto(mission.Id, null);
        }

        public async Task<bool> DeleteMission(int id, int? ownerConsultantId)
        {
            var mission = await _uow.Missions.GetById(id);
            if (mission == null) return false;
            if (ownerConsultantId.HasValue && mission.ConsultantId != ownerConsultantId.Value) return false;
            _uow.Missions.Delete(mission);
            return await _uow.CompleteAsync();
        }

        private static void Validate(MissionUpsertDto dto)
        {
            if (dto.DateFin.Date < dto.DateDebut.Date)
                throw new ArgumentException("La date de fin doit être postérieure ou égale à la date de début.");
            if (dto.Tjm <= 0)
                throw new ArgumentException("Le TJM doit être supérieur à 0.");
            if (dto.Jours <= 0)
                throw new ArgumentException("Le nombre de jours doit être supérieur à 0.");
            if (!MissionStatut.All.Contains(dto.Statut))
                throw new ArgumentException("Statut de mission invalide.");
        }
    }
}
