using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Missions;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Missions
{
    public interface IMissionRepository : IGenericRepository<Mission>
    {
        /// <summary>Mission avec client, consultant et factures.</summary>
        Task<Mission> GetWithRelations(int id);
        /// <summary>Requête de base incluant client + consultant (pour listes/filtres).</summary>
        IQueryable<Mission> QueryWithRelations();
    }

    public class MissionRepository : GenericRepository<Mission>, IMissionRepository
    {
        public MissionRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }

        public async Task<Mission> GetWithRelations(int id)
        {
            return await _context.Missions
                .Include(m => m.Client)
                .Include(m => m.Consultant)
                .Include(m => m.Factures)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public IQueryable<Mission> QueryWithRelations()
        {
            return _context.Missions
                .Include(m => m.Client)
                .Include(m => m.Consultant)
                .AsNoTracking();
        }
    }
}
