using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Justificatifs;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Justificatifs
{
    public interface IJustificatifRepository : IGenericRepository<Justificatif>
    {
        Task<Justificatif> GetWithRelations(int id);
        IQueryable<Justificatif> QueryWithRelations();
    }

    public class JustificatifRepository : GenericRepository<Justificatif>, IJustificatifRepository
    {
        public JustificatifRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }

        public async Task<Justificatif> GetWithRelations(int id)
        {
            return await _context.Justificatifs
                .Include(j => j.Mission).ThenInclude(m => m.Client)
                .Include(j => j.Consultant)
                .FirstOrDefaultAsync(j => j.Id == id);
        }

        public IQueryable<Justificatif> QueryWithRelations()
        {
            return _context.Justificatifs
                .Include(j => j.Mission).ThenInclude(m => m.Client)
                .Include(j => j.Consultant)
                .AsNoTracking();
        }
    }
}
