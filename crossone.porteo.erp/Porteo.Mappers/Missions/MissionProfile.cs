using AutoMapper;
using Porteo.Models.Missions;
using Porteo.ModelViews.Missions;

namespace Porteo.Mappers.Missions
{
    public class MissionProfile : Profile
    {
        public MissionProfile()
        {
            CreateMap<Mission, MissionDto>()
                .ForMember(d => d.Montant, o => o.MapFrom(s => s.Tjm * s.Jours))
                .ForMember(d => d.ClientNom, o => o.MapFrom(s => s.Client != null ? s.Client.RaisonSociale : null))
                .ForMember(d => d.ConsultantNom, o => o.MapFrom(s => s.Consultant != null ? s.Consultant.Prenom + " " + s.Consultant.Nom : null))
                .ForMember(d => d.NombreFactures, o => o.MapFrom(s => s.Factures != null ? s.Factures.Count : 0));

            CreateMap<Mission, MissionDetailDto>()
                .IncludeBase<Mission, MissionDto>()
                .ForMember(d => d.ClientSecteur, o => o.MapFrom(s => s.Client != null ? s.Client.Secteur : null))
                .ForMember(d => d.ConsultantSpecialite, o => o.MapFrom(s => s.Consultant != null ? s.Consultant.Specialite : null))
                .ForMember(d => d.ConsultantVille, o => o.MapFrom(s => s.Consultant != null ? s.Consultant.Ville : null))
                .ForMember(d => d.Factures, o => o.MapFrom(s => s.Factures));

            CreateMap<MissionUpsertDto, Mission>();
        }
    }
}
