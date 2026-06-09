using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Consultants;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Consultants
{
    public interface IConsultantRepository : IGenericRepository<Consultant>
    {
        Task<Consultant> GetWithMissions(int id);
    }

    public class ConsultantRepository : GenericRepository<Consultant>, IConsultantRepository
    {
        public ConsultantRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }

        public async Task<Consultant> GetWithMissions(int id)
        {
            return await _context.Consultants
                .Include(c => c.Missions).ThenInclude(m => m.Client)
                .Include(c => c.Missions).ThenInclude(m => m.Factures)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
