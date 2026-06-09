using System.Data.Common;
using System.Linq.Expressions;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Common
{
    /// <summary>
    /// Contrat générique de dépôt (CRUD EF Core + accès Dapper pour les lectures).
    /// </summary>
    public interface IGenericRepository<T> where T : BaseEntity
    {
        Task<IEnumerable<T>> All();
        Task<T> GetById(int id);
        Task<IEnumerable<T>> Find(Expression<Func<T, bool>> predicate);
        IQueryable<T> Query();
        void Add(T entity);
        void AddRange(IEnumerable<T> entities);
        void Update(T entity);
        void Delete(T entity);

        /// <summary>Lecture Dapper typée (utilisée notamment par le dashboard).</summary>
        Task<IEnumerable<TResult>> ReadAsync<TResult>(string sql, object param = null);
    }

    /// <summary>Implémentation générique au-dessus du <see cref="PorteoDbContext"/>.</summary>
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        protected readonly PorteoDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger _logger;

        public GenericRepository(PorteoDbContext context, ILogger logger)
        {
            _context = context;
            _logger = logger;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<IEnumerable<T>> All() => await _dbSet.AsNoTracking().ToListAsync();

        public virtual async Task<T> GetById(int id) => await _dbSet.FindAsync(id);

        public virtual async Task<IEnumerable<T>> Find(Expression<Func<T, bool>> predicate)
            => await _dbSet.Where(predicate).ToListAsync();

        public virtual IQueryable<T> Query() => _dbSet.AsQueryable();

        public virtual void Add(T entity) => _dbSet.Add(entity);

        public virtual void AddRange(IEnumerable<T> entities) => _dbSet.AddRange(entities);

        public virtual void Update(T entity) => _dbSet.Update(entity);

        public virtual void Delete(T entity) => _dbSet.Remove(entity);

        public async Task<IEnumerable<TResult>> ReadAsync<TResult>(string sql, object param = null)
        {
            DbConnection cnx = _context.Database.GetDbConnection();
            return await cnx.QueryAsync<TResult>(sql, param);
        }
    }
}
