using Microsoft.EntityFrameworkCore;
using Porteo.ModelViews.Search;
using Porteo.Repositories;

namespace Porteo.Services.Search
{
    public interface ISearchService
    {
        Task<IEnumerable<SearchResultDto>> Search(string q, bool isAdmin, int? consultantId);
    }

    public class SearchService : ISearchService
    {
        private readonly IUnitOfWork _uow;
        public SearchService(IUnitOfWork uow) { _uow = uow; }

        public async Task<IEnumerable<SearchResultDto>> Search(string q, bool isAdmin, int? consultantId)
        {
            var results = new List<SearchResultDto>();
            if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2) return results;
            var s = q.Trim().ToLower();

            // Missions (périmètre consultant)
            var missQ = _uow.Missions.QueryWithRelations();
            if (!isAdmin && consultantId.HasValue) missQ = missQ.Where(m => m.ConsultantId == consultantId.Value);
            var missions = await missQ.Where(m =>
                    m.Titre.ToLower().Contains(s) ||
                    (m.Client != null && m.Client.RaisonSociale.ToLower().Contains(s)) ||
                    (m.Consultant != null && (m.Consultant.Nom.ToLower().Contains(s) || m.Consultant.Prenom.ToLower().Contains(s))))
                .OrderByDescending(m => m.DateDebut).Take(6).ToListAsync();
            results.AddRange(missions.Select(m => new SearchResultDto
            {
                Type = "mission", Id = m.Id, Titre = m.Titre,
                SousTitre = $"{m.Client?.RaisonSociale} · {m.Consultant?.Prenom} {m.Consultant?.Nom}", Route = $"/missions/{m.Id}"
            }));

            if (isAdmin)
            {
                var clients = await _uow.Clients.Query().AsNoTracking()
                    .Where(c => c.RaisonSociale.ToLower().Contains(s) || c.Secteur.ToLower().Contains(s) || c.Ville.ToLower().Contains(s))
                    .Take(5).ToListAsync();
                results.AddRange(clients.Select(c => new SearchResultDto
                {
                    Type = "client", Id = c.Id, Titre = c.RaisonSociale, SousTitre = $"{c.Secteur} · {c.Ville}", Route = $"/clients/{c.Id}"
                }));

                var consultants = await _uow.Consultants.Query().AsNoTracking()
                    .Where(c => c.Nom.ToLower().Contains(s) || c.Prenom.ToLower().Contains(s) || c.Specialite.ToLower().Contains(s))
                    .Take(5).ToListAsync();
                results.AddRange(consultants.Select(c => new SearchResultDto
                {
                    Type = "consultant", Id = c.Id, Titre = $"{c.Prenom} {c.Nom}", SousTitre = $"{c.Specialite} · {c.Ville}", Route = $"/consultants/{c.Id}"
                }));
            }

            return results;
        }
    }
}
