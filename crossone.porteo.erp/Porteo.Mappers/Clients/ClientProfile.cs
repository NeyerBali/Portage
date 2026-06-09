using AutoMapper;
using Porteo.Models.Clients;
using Porteo.ModelViews.Clients;

namespace Porteo.Mappers.Clients
{
    public class ClientProfile : Profile
    {
        public ClientProfile()
        {
            // Les agrégats (NombreMissions, CaCumule, ...) sont calculés dans le service.
            CreateMap<Client, ClientDto>();
            CreateMap<Client, ClientDetailDto>();
            CreateMap<ClientUpsertDto, Client>();
        }
    }
}
