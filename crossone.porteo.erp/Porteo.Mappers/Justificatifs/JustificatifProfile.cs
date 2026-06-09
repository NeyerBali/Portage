using AutoMapper;
using Porteo.Models.Justificatifs;
using Porteo.ModelViews.Justificatifs;

namespace Porteo.Mappers.Justificatifs
{
    public class JustificatifProfile : Profile
    {
        public JustificatifProfile()
        {
            CreateMap<Justificatif, JustificatifDto>()
                .ForMember(d => d.HasFile, o => o.MapFrom(s => s.Data != null && s.Data.Length > 0))
                .ForMember(d => d.MissionTitre, o => o.MapFrom(s => s.Mission != null ? s.Mission.Titre : null))
                .ForMember(d => d.ClientNom, o => o.MapFrom(s => s.Mission != null && s.Mission.Client != null ? s.Mission.Client.RaisonSociale : null))
                .ForMember(d => d.ConsultantNom, o => o.MapFrom(s => s.Consultant != null ? s.Consultant.Prenom + " " + s.Consultant.Nom : null));
        }
    }
}
