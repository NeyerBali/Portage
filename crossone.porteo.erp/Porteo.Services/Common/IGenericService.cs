using Porteo.Models.Common;
using Porteo.Repositories;
using Porteo.Repositories.Common;

namespace Porteo.Services.Common
{
    /// <summary>Service générique CRUD au-dessus d'un repository (pattern de référence).</summary>
    public interface IGenericService<T> where T : BaseEntity
    {
        Task<IEnumerable<T>> ReadAll();
        Task<T> ReadById(int id);
        Task<bool> Create(T entity);
        Task<bool> Update(T entity);
        Task<bool> Delete(T entity);
    }

    /// <summary>Implémentation générique réutilisée par les services de domaine.</summary>
    public abstract class GenericService<T> : IGenericService<T> where T : BaseEntity
    {
        protected readonly IUnitOfWork _uow;
        protected readonly IGenericRepository<T> _repo;

        protected GenericService(IUnitOfWork uow, IGenericRepository<T> repo)
        {
            _uow = uow;
            _repo = repo;
        }

        public virtual Task<IEnumerable<T>> ReadAll() => _repo.All();

        public virtual Task<T> ReadById(int id) => _repo.GetById(id);

        public virtual async Task<bool> Create(T entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            _repo.Add(entity);
            return await _uow.CompleteAsync();
        }

        public virtual async Task<bool> Update(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _repo.Update(entity);
            return await _uow.CompleteAsync();
        }

        public virtual async Task<bool> Delete(T entity)
        {
            _repo.Delete(entity);
            return await _uow.CompleteAsync();
        }
    }
}
