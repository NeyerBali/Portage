using AutoMapper;
using Porteo.Models.Users;
using Porteo.ModelViews.Users;

namespace Porteo.Mappers.Users
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDto>();
            CreateMap<User, MeDto>()
                .ForMember(d => d.FullName, o => o.MapFrom(s => s.Prenom + " " + s.Nom));
        }
    }
}
