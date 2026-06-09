using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Porteo.Models.Clients;
using Porteo.Models.Factures;
using Porteo.Models.Missions;
using Porteo.ModelViews.Clients;
using Porteo.ModelViews.Missions;
using Porteo.Repositories;
using Porteo.Services.Common;

namespace Porteo.Services.Clients
{
    public interface IClientService : IGenericService<Client>
    {
        Task<IEnumerable<ClientDto>> GetAll();
        Task<ClientDetailDto> GetDetail(int id);
        Task<ClientDto> CreateClient(ClientUpsertDto dto);
        Task<ClientDto> UpdateClient(int id, ClientUpsertDto dto);
        Task<bool> DeleteClient(int id);
    }

    public class ClientService : GenericService<Client>, IClientService
    {
        private readonly IMapper _mapper;

        public ClientService(IUnitOfWork uow, IMapper mapper) : base(uow, uow.Clients)
        {
            _mapper = mapper;
        }

        public async Task<IEnumerable<ClientDto>> GetAll()
        {
            var clients = await _uow.Clients.Query()
                .Include(c => c.Missions).ThenInclude(m => m.Factures)
                .AsNoTracking()
                .ToListAsync();

            return clients.Select(ToDto).OrderBy(c => c.RaisonSociale).ToList();
        }

        public async Task<ClientDetailDto> GetDetail(int id)
        {
            var client = await _uow.Clients.GetWithMissions(id);
            if (client == null) return null;

            var dto = _mapper.Map<ClientDetailDto>(client);
            ApplyAggregates(dto, client.Missions);
            dto.Missions = client.Missions
                .Select(m => _mapper.Map<MissionDto>(m))
                .OrderByDescending(m => m.DateDebut)
                .ToList();
            return dto;
        }

        public async Task<ClientDto> CreateClient(ClientUpsertDto dto)
        {
            var client = _mapper.Map<Client>(dto);
            client.CreatedAt = DateTime.UtcNow;
            _uow.Clients.Add(client);
            await _uow.CompleteAsync();
            return _mapper.Map<ClientDto>(client);
        }

        public async Task<ClientDto> UpdateClient(int id, ClientUpsertDto dto)
        {
            var client = await _uow.Clients.GetById(id);
            if (client == null) return null;
            _mapper.Map(dto, client);
            client.UpdatedAt = DateTime.UtcNow;
            _uow.Clients.Update(client);
            await _uow.CompleteAsync();
            return _mapper.Map<ClientDto>(client);
        }

        public async Task<bool> DeleteClient(int id)
        {
            var client = await _uow.Clients.Query()
                .Include(c => c.Missions)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (client == null) return false;
            if (client.Missions.Any())
                throw new InvalidOperationException("Impossible de supprimer un client qui possède des missions.");
            _uow.Clients.Delete(client);
            return await _uow.CompleteAsync();
        }

        private ClientDto ToDto(Client client)
        {
            var dto = _mapper.Map<ClientDto>(client);
            ApplyAggregates(dto, client.Missions);
            return dto;
        }

        private static void ApplyAggregates(ClientDto dto, IEnumerable<Mission> missions)
        {
            missions ??= new List<Mission>();
            var list = missions.ToList();
            dto.NombreMissions = list.Count;
            dto.MissionsActives = list.Count(m => m.Statut == MissionStatut.EnCours);
            dto.CaCumule = list.Sum(m => m.Tjm * m.Jours);
            dto.EncoursImpaye = list
                .SelectMany(m => m.Factures ?? new List<Facture>())
                .Where(f => f.Statut == FactureStatut.Emise)
                .Sum(f => f.MontantTTC);
        }
    }
}
