using AutoMapper;
using Porteo.Models.Activities;
using Porteo.ModelViews.Activities;

namespace Porteo.Mappers.Activities
{
    public class ActivityProfile : Profile
    {
        public ActivityProfile()
        {
            CreateMap<ActivityEntry, ActivityDto>();
        }
    }
}
