using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Factures;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Factures
{
    public interface IFactureRepository : IGenericRepository<Facture>
    {
        Task<Facture> GetWithRelations(int id);
        IQueryable<Facture> QueryWithRelations();
        Task<int> CountForYear(int year);
    }

    public class FactureRepository : GenericRepository<Facture>, IFactureRepository
    {
        public FactureRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }

        public async Task<Facture> GetWithRelations(int id)
        {
            return await _context.Factures
                .Include(f => f.Mission).ThenInclude(m => m.Client)
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public IQueryable<Facture> QueryWithRelations()
        {
            return _context.Factures
                .Include(f => f.Mission).ThenInclude(m => m.Client)
                .AsNoTracking();
        }

        public async Task<int> CountForYear(int year)
        {
            return await _context.Factures.CountAsync(f => f.DateEmission.Year == year);
        }
    }
}
