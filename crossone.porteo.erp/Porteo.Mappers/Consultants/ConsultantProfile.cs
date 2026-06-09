using AutoMapper;
using Porteo.Models.Consultants;
using Porteo.ModelViews.Consultants;

namespace Porteo.Mappers.Consultants
{
    public class ConsultantProfile : Profile
    {
        public ConsultantProfile()
        {
            CreateMap<Consultant, ConsultantDto>();
            CreateMap<Consultant, ConsultantDetailDto>();
            CreateMap<ConsultantUpsertDto, Consultant>();
        }
    }
}
