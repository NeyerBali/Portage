using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Porteo.Models.Activities;
using Porteo.ModelViews.Activities;
using Porteo.Repositories;

namespace Porteo.Services.Activities
{
    public interface IActivityService
    {
        Task Log(string type, string titre, string description, int? userId = null, string userName = null, int? consultantId = null);
        Task<IEnumerable<ActivityDto>> GetRecent(int take = 50, int? ownerConsultantId = null);
    }

    public class ActivityService : IActivityService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public ActivityService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task Log(string type, string titre, string description, int? userId = null, string userName = null, int? consultantId = null)
        {
            _uow.Activities.Add(new ActivityEntry
            {
                Type = type, Titre = titre, Description = description,
                UserId = userId, UserName = userName, ConsultantId = consultantId,
                CreatedAt = DateTime.UtcNow,
            });
            await _uow.CompleteAsync();
        }

        public async Task<IEnumerable<ActivityDto>> GetRecent(int take = 50, int? ownerConsultantId = null)
        {
            var query = _uow.Activities.Query().AsNoTracking();
            if (ownerConsultantId.HasValue)
                query = query.Where(a => a.ConsultantId == ownerConsultantId.Value);
            var list = await query.OrderByDescending(a => a.CreatedAt).Take(take).ToListAsync();
            return _mapper.Map<List<ActivityDto>>(list);
        }
    }
}
