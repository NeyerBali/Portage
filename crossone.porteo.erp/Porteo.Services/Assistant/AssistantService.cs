using System.Globalization;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Porteo.Models.Factures;
using Porteo.Models.Missions;
using Porteo.Repositories;

namespace Porteo.Services.Assistant
{
    public interface IAssistantService
    {
        Task<string> Ask(string question);
    }

    /// <summary>
    /// Assistant IA (Groq, API compatible OpenAI). Construit un contexte à partir des
    /// vraies données (factures impayées, missions) puis interroge le modèle.
    /// </summary>
    public class AssistantService : IAssistantService
    {
        private static readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(40) };
        private static readonly CultureInfo Fr = CultureInfo.GetCultureInfo("fr-FR");

        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _config;

        public AssistantService(IUnitOfWork uow, IConfiguration config) { _uow = uow; _config = config; }

        public async Task<string> Ask(string question)
        {
            var apiKey = _config["Groq:ApiKey"] ?? "";
            if (string.IsNullOrWhiteSpace(apiKey))
                return "⚠️ L'assistant n'est pas encore configuré (clé Groq manquante côté serveur).";

            var model = _config["Groq:Model"] ?? "llama-3.3-70b-versatile";
            var context = await BuildContext();

            var system =
                "Tu es l'assistant intelligent de Portéo, une plateforme de portage salarial. " +
                "Tu aides l'administrateur à piloter son activité : factures impayées, relances, missions, trésorerie. " +
                "Réponds en français, de manière concise, claire et professionnelle. " +
                "Appuie-toi UNIQUEMENT sur les données fournies ci-dessous ; si une information manque, dis-le. " +
                "Quand on te demande de rédiger un e-mail de relance, produis un objet et un corps prêts à envoyer, courtois et fermes.\n\n" +
                "=== DONNÉES ACTUELLES DE L'AGENCE ===\n" + context;

            var payload = new
            {
                model,
                temperature = 0.3,
                max_tokens = 800,
                messages = new[]
                {
                    new { role = "system", content = system },
                    new { role = "user", content = question },
                },
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
            req.Headers.TryAddWithoutValidation("Authorization", $"Bearer {apiKey}");
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var resp = await _http.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
                throw new InvalidOperationException($"Groq {(int)resp.StatusCode} : {body}");

            using var doc = JsonDocument.Parse(body);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()?.Trim()
                   ?? "(réponse vide)";
        }

        /// <summary>Résumé textuel des données réelles, injecté dans le prompt.</summary>
        private async Task<string> BuildContext()
        {
            var sb = new StringBuilder();
            var today = DateTime.UtcNow.Date;

            // Profil agence
            var agency = (await _uow.AgencyProfiles.All()).FirstOrDefault();
            if (agency != null)
                sb.AppendLine($"Agence : {agency.RaisonSociale} — {agency.Email} — IBAN {agency.Iban}.");

            // Factures (émises = impayées, + payées pour le CA)
            var factures = await _uow.Factures.QueryWithRelations().AsNoTracking().ToListAsync();
            var impayees = factures.Where(f => f.Statut == FactureStatut.Emise)
                                   .OrderBy(f => f.DateEcheance).ToList();
            var caEncaisse = factures.Where(f => f.Statut == FactureStatut.Payee).Sum(f => f.MontantTTC);
            var totalImpaye = impayees.Sum(f => f.MontantTTC);

            sb.AppendLine($"CA encaissé (factures payées) : {Money(caEncaisse)}.");
            sb.AppendLine($"Total impayé (factures émises) : {Money(totalImpaye)} sur {impayees.Count} facture(s).");
            sb.AppendLine();
            sb.AppendLine("FACTURES IMPAYÉES (numéro · client · mission · montant TTC · échéance · jours de retard) :");
            if (impayees.Count == 0) sb.AppendLine("- Aucune.");
            foreach (var f in impayees.Take(25))
            {
                var retard = (today - f.DateEcheance.Date).Days;
                var retardTxt = retard > 0 ? $"EN RETARD de {retard} j" : $"échéance dans {-retard} j";
                sb.AppendLine($"- {f.Numero} · {f.Mission?.Client?.RaisonSociale ?? "?"} · {f.Mission?.Titre ?? "?"} · {Money(f.MontantTTC)} · {f.DateEcheance:dd/MM/yyyy} · {retardTxt}");
            }

            // Missions actives + se terminant bientôt
            var missions = await _uow.Missions.QueryWithRelations().AsNoTracking().ToListAsync();
            var actives = missions.Where(m => m.Statut == MissionStatut.EnCours).ToList();
            sb.AppendLine();
            sb.AppendLine($"MISSIONS EN COURS ({actives.Count}) (titre · client · consultant · fin · TJM×jours) :");
            foreach (var m in actives.Take(25))
                sb.AppendLine($"- {m.Titre} · {m.Client?.RaisonSociale ?? "?"} · {m.Consultant?.Prenom} {m.Consultant?.Nom} · fin {m.DateFin:dd/MM/yyyy} · {m.Tjm}€×{m.Jours}j");

            var bientotFin = actives.Where(m => (m.DateFin.Date - today).Days is >= 0 and <= 30).ToList();
            if (bientotFin.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine($"MISSIONS SE TERMINANT SOUS 30 JOURS ({bientotFin.Count}) :");
                foreach (var m in bientotFin)
                    sb.AppendLine($"- {m.Titre} ({m.Client?.RaisonSociale}) — fin le {m.DateFin:dd/MM/yyyy}");
            }

            return sb.ToString();
        }

        private static string Money(decimal d) => d.ToString("#,##0", Fr) + " €";
    }
}
