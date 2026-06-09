using AutoMapper;
using Porteo.Models.Factures;
using Porteo.ModelViews.Factures;

namespace Porteo.Mappers.Factures
{
    public class FactureProfile : Profile
    {
        public FactureProfile()
        {
            CreateMap<Facture, FactureDto>()
                .ForMember(d => d.MissionTitre, o => o.MapFrom(s => s.Mission != null ? s.Mission.Titre : null))
                .ForMember(d => d.ClientId, o => o.MapFrom(s => s.Mission != null ? s.Mission.ClientId : 0))
                .ForMember(d => d.ClientNom, o => o.MapFrom(s => s.Mission != null && s.Mission.Client != null ? s.Mission.Client.RaisonSociale : null));

            // MontantHT/TVA/TTC recalculés dans le service à partir du taux.
            CreateMap<FactureUpsertDto, Facture>()
                .ForMember(d => d.Tva, o => o.Ignore())
                .ForMember(d => d.MontantTTC, o => o.Ignore());
        }
    }
}
