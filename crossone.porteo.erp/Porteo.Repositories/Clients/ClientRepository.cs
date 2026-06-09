using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Clients;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Clients
{
    public interface IClientRepository : IGenericRepository<Client>
    {
        /// <summary>Charge un client avec ses missions (relation 1‑N) + client/consultant des missions.</summary>
        Task<Client> GetWithMissions(int id);
    }

    public class ClientRepository : GenericRepository<Client>, IClientRepository
    {
        public ClientRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }

        public async Task<Client> GetWithMissions(int id)
        {
            return await _context.Clients
                .Include(c => c.Missions).ThenInclude(m => m.Consultant)
                .Include(c => c.Missions).ThenInclude(m => m.Factures)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
