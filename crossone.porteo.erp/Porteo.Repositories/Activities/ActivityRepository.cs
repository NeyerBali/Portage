using Microsoft.Extensions.Logging;
using Porteo.Models.Activities;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Activities
{
    public interface IActivityRepository : IGenericRepository<ActivityEntry> { }

    public class ActivityRepository : GenericRepository<ActivityEntry>, IActivityRepository
    {
        public ActivityRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }
    }
}
