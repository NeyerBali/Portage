using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Porteo.Models.Consultants;
using Porteo.Models.Missions;
using Porteo.ModelViews.Consultants;
using Porteo.ModelViews.Missions;
using Porteo.Repositories;
using Porteo.Services.Common;

namespace Porteo.Services.Consultants
{
    public interface IConsultantService : IGenericService<Consultant>
    {
        Task<IEnumerable<ConsultantDto>> GetAll();
        Task<ConsultantDetailDto> GetDetail(int id);
        Task<ConsultantDto> CreateConsultant(ConsultantUpsertDto dto);
        Task<ConsultantDto> UpdateConsultant(int id, ConsultantUpsertDto dto);
        Task<bool> DeleteConsultant(int id);
    }

    public class ConsultantService : GenericService<Consultant>, IConsultantService
    {
        private readonly IMapper _mapper;

        public ConsultantService(IUnitOfWork uow, IMapper mapper) : base(uow, uow.Consultants)
        {
            _mapper = mapper;
        }

        public async Task<IEnumerable<ConsultantDto>> GetAll()
        {
            var consultants = await _uow.Consultants.Query()
                .Include(c => c.Missions)
                .AsNoTracking()
                .ToListAsync();

            return consultants.Select(ToDto).OrderBy(c => c.Nom).ToList();
        }

        public async Task<ConsultantDetailDto> GetDetail(int id)
        {
            var consultant = await _uow.Consultants.GetWithMissions(id);
            if (consultant == null) return null;

            var dto = _mapper.Map<ConsultantDetailDto>(consultant);
            ApplyAggregates(dto, consultant.Missions);
            dto.Missions = consultant.Missions
                .Select(m => _mapper.Map<MissionDto>(m))
                .OrderByDescending(m => m.DateDebut)
                .ToList();
            return dto;
        }

        public async Task<ConsultantDto> CreateConsultant(ConsultantUpsertDto dto)
        {
            var consultant = _mapper.Map<Consultant>(dto);
            consultant.CreatedAt = DateTime.UtcNow;
            _uow.Consultants.Add(consultant);
            await _uow.CompleteAsync();
            return _mapper.Map<ConsultantDto>(consultant);
        }

        public async Task<ConsultantDto> UpdateConsultant(int id, ConsultantUpsertDto dto)
        {
            var consultant = await _uow.Consultants.GetById(id);
            if (consultant == null) return null;
            _mapper.Map(dto, consultant);
            consultant.UpdatedAt = DateTime.UtcNow;
            _uow.Consultants.Update(consultant);
            await _uow.CompleteAsync();
            return _mapper.Map<ConsultantDto>(consultant);
        }

        public async Task<bool> DeleteConsultant(int id)
        {
            var consultant = await _uow.Consultants.Query()
                .Include(c => c.Missions)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (consultant == null) return false;
            if (consultant.Missions.Any())
                throw new InvalidOperationException("Impossible de supprimer un consultant qui possède des missions.");
            _uow.Consultants.Delete(consultant);
            return await _uow.CompleteAsync();
        }

        private ConsultantDto ToDto(Consultant consultant)
        {
            var dto = _mapper.Map<ConsultantDto>(consultant);
            ApplyAggregates(dto, consultant.Missions);
            return dto;
        }

        private static void ApplyAggregates(ConsultantDto dto, IEnumerable<Mission> missions)
        {
            var list = (missions ?? new List<Mission>()).ToList();
            dto.NombreMissions = list.Count;
            dto.MissionsActives = list.Count(m => m.Statut == MissionStatut.EnCours);
            dto.CaCumule = list.Sum(m => m.Tjm * m.Jours);
        }
    }
}
