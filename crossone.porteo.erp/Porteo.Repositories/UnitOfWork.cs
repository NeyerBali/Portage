using Microsoft.Extensions.Logging;
using Porteo.Repositories.Clients;
using Porteo.Repositories.Consultants;
using Porteo.Repositories.Context;
using Porteo.Repositories.Factures;
using Porteo.Repositories.Missions;
using Porteo.Repositories.Users;

namespace Porteo.Repositories
{
    /// <summary>
    /// Unité de travail : point d'accès unique aux repositories et au commit
    /// transactionnel (même pattern que l'ERP de référence).
    /// </summary>
    public interface IUnitOfWork
    {
        IClientRepository Clients { get; }
        IConsultantRepository Consultants { get; }
        IMissionRepository Missions { get; }
        IFactureRepository Factures { get; }
        IUserRepository Users { get; }

        Task<bool> CompleteAsync();
        bool Complete();
    }

    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly PorteoDbContext _context;
        private readonly ILogger _logger;

        public IClientRepository Clients { get; }
        public IConsultantRepository Consultants { get; }
        public IMissionRepository Missions { get; }
        public IFactureRepository Factures { get; }
        public IUserRepository Users { get; }

        public UnitOfWork(PorteoDbContext context, ILoggerFactory loggerFactory)
        {
            _context = context;
            _logger = loggerFactory.CreateLogger("Porteo.Repositories");

            Clients = new ClientRepository(_context, _logger);
            Consultants = new ConsultantRepository(_context, _logger);
            Missions = new MissionRepository(_context, _logger);
            Factures = new FactureRepository(_context, _logger);
            Users = new UserRepository(_context, _logger);
        }

        public async Task<bool> CompleteAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de l'enregistrement asynchrone des changements.");
                throw;
            }
        }

        public bool Complete()
        {
            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de l'enregistrement des changements.");
                throw;
            }
        }

        public void Dispose() => _context.Dispose();
    }
}
