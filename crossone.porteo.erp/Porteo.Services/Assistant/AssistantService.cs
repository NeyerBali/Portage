using System.Globalization;
using System.Net.Http;
using System.Runtime.CompilerServices;
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
        IAsyncEnumerable<string> AskStream(string question, CancellationToken ct = default);
        Task<string> SummarizeMission(int missionId);
    }

    /// <summary>
    /// Assistant IA (Groq, API compatible OpenAI). Construit un contexte à partir des
    /// vraies données puis interroge le modèle — en une fois (Ask) ou en flux (AskStream).
    /// </summary>
    public class AssistantService : IAssistantService
    {
        private static readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(60) };
        private static readonly CultureInfo Fr = CultureInfo.GetCultureInfo("fr-FR");
        private const string Endpoint = "https://api.groq.com/openai/v1/chat/completions";

        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _config;

        public AssistantService(IUnitOfWork uow, IConfiguration config) { _uow = uow; _config = config; }

        private string ApiKey => _config["Groq:ApiKey"] ?? "";
        private string Model => _config["Groq:Model"] ?? "llama-3.3-70b-versatile";

        private const string SystemBase =
            "Tu es l'assistant intelligent de Portéo, une plateforme de portage salarial. " +
            "Tu aides l'administrateur à piloter son activité : factures impayées, relances, missions, trésorerie. " +
            "Réponds en français, de manière concise, claire et professionnelle. " +
            "Appuie-toi UNIQUEMENT sur les données fournies ; si une information manque, dis-le. " +
            "Pour un e-mail de relance, produis un objet et un corps prêts à envoyer, courtois et fermes.";

        // ── Question simple (réponse complète) ───────────────────────────────────
        public async Task<string> Ask(string question)
        {
            if (string.IsNullOrWhiteSpace(ApiKey))
                return "⚠️ L'assistant n'est pas encore configuré (clé Groq manquante côté serveur).";
            var system = SystemBase + "\n\n=== DONNÉES ACTUELLES DE L'AGENCE ===\n" + await BuildContext();
            using var doc = await CallGroq(system, question, stream: false);
            return doc!.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()?.Trim()
                   ?? "(réponse vide)";
        }

        // ── Question en FLUX (mot-à-mot, SSE Groq) ────────────────────────────────
        public async IAsyncEnumerable<string> AskStream(string question, [EnumeratorCancellation] CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(ApiKey)) { yield return "⚠️ Assistant non configuré (clé Groq manquante)."; yield break; }
            var system = SystemBase + "\n\n=== DONNÉES ACTUELLES DE L'AGENCE ===\n" + await BuildContext();

            using var req = BuildRequest(system, question, stream: true);
            using var resp = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
            resp.EnsureSuccessStatusCode();
            await using var stream = await resp.Content.ReadAsStreamAsync(ct);
            using var reader = new StreamReader(stream);

            string line;
            while ((line = await reader.ReadLineAsync(ct)) != null)
            {
                if (!line.StartsWith("data:")) continue;
                var data = line[5..].Trim();
                if (data == "[DONE]") yield break;

                string token = null;
                try
                {
                    using var doc = JsonDocument.Parse(data);
                    var choices = doc.RootElement.GetProperty("choices");
                    if (choices.GetArrayLength() > 0 && choices[0].GetProperty("delta").TryGetProperty("content", out var c))
                        token = c.GetString();
                }
                catch { /* ligne non-JSON : on ignore */ }

                if (!string.IsNullOrEmpty(token)) yield return token;
            }
        }

        // ── Résumé IA d'une mission ───────────────────────────────────────────────
        public async Task<string> SummarizeMission(int missionId)
        {
            if (string.IsNullOrWhiteSpace(ApiKey)) return "⚠️ Assistant non configuré (clé Groq manquante).";
            var m = await _uow.Missions.GetWithRelations(missionId);
            if (m == null) return "Mission introuvable.";

            var factures = (m.Factures ?? new List<Facture>())
                .Select(f => $"{f.Numero} [{f.Statut}] {Money(f.MontantTTC)} éch. {f.DateEcheance:dd/MM/yyyy}");
            var ctx =
                $"Mission : {m.Titre}\nClient : {m.Client?.RaisonSociale}\nConsultant : {m.Consultant?.Prenom} {m.Consultant?.Nom}\n" +
                $"Statut : {m.Statut}\nPériode : {m.DateDebut:dd/MM/yyyy} → {m.DateFin:dd/MM/yyyy}\n" +
                $"TJM : {m.Tjm}€ × {m.Jours} j = {Money(m.Tjm * m.Jours)}\n" +
                $"Factures : {(factures.Any() ? string.Join(" ; ", factures) : "aucune")}";

            var system = "Tu es l'assistant Portéo (portage salarial). Résume cette mission en 4 à 5 puces claires " +
                         "(avancement, facturation, points d'attention/risques). En français, concis, sans bla-bla.";
            using var doc = await CallGroq(system + "\n\n=== MISSION ===\n" + ctx, "Fais le résumé.", stream: false);
            return doc!.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()?.Trim()
                   ?? "(résumé vide)";
        }

        // ── Helpers Groq ──────────────────────────────────────────────────────────
        private HttpRequestMessage BuildRequest(string system, string user, bool stream)
        {
            var payload = new
            {
                model = Model,
                temperature = 0.3,
                max_tokens = 800,
                stream,
                messages = new[]
                {
                    new { role = "system", content = system },
                    new { role = "user", content = user },
                },
            };
            var req = new HttpRequestMessage(HttpMethod.Post, Endpoint);
            req.Headers.TryAddWithoutValidation("Authorization", $"Bearer {ApiKey}");
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            return req;
        }

        private async Task<JsonDocument> CallGroq(string system, string user, bool stream)
        {
            using var req = BuildRequest(system, user, stream);
            using var resp = await _http.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode) throw new InvalidOperationException($"Groq {(int)resp.StatusCode} : {body}");
            return JsonDocument.Parse(body);
        }

        private async Task<string> BuildContext()
        {
            var sb = new StringBuilder();
            var today = DateTime.UtcNow.Date;

            var agency = (await _uow.AgencyProfiles.All()).FirstOrDefault();
            if (agency != null) sb.AppendLine($"Agence : {agency.RaisonSociale} — {agency.Email} — IBAN {agency.Iban}.");

            var factures = await _uow.Factures.QueryWithRelations().AsNoTracking().ToListAsync();
            var impayees = factures.Where(f => f.Statut == FactureStatut.Emise).OrderBy(f => f.DateEcheance).ToList();
            var caEncaisse = factures.Where(f => f.Statut == FactureStatut.Payee).Sum(f => f.MontantTTC);

            sb.AppendLine($"CA encaissé (factures payées) : {Money(caEncaisse)}.");
            sb.AppendLine($"Total impayé (factures émises) : {Money(impayees.Sum(f => f.MontantTTC))} sur {impayees.Count} facture(s).");
            sb.AppendLine();
            sb.AppendLine("FACTURES IMPAYÉES (numéro · client · mission · montant TTC · échéance · retard) :");
            if (impayees.Count == 0) sb.AppendLine("- Aucune.");
            foreach (var f in impayees.Take(25))
            {
                var retard = (today - f.DateEcheance.Date).Days;
                sb.AppendLine($"- {f.Numero} · {f.Mission?.Client?.RaisonSociale ?? "?"} · {f.Mission?.Titre ?? "?"} · {Money(f.MontantTTC)} · {f.DateEcheance:dd/MM/yyyy} · {(retard > 0 ? $"EN RETARD {retard} j" : $"dans {-retard} j")}");
            }

            var missions = await _uow.Missions.QueryWithRelations().AsNoTracking().ToListAsync();
            var actives = missions.Where(m => m.Statut == MissionStatut.EnCours).ToList();
            sb.AppendLine();
            sb.AppendLine($"MISSIONS EN COURS ({actives.Count}) (titre · client · consultant · fin · TJM×jours) :");
            foreach (var m in actives.Take(25))
                sb.AppendLine($"- {m.Titre} · {m.Client?.RaisonSociale ?? "?"} · {m.Consultant?.Prenom} {m.Consultant?.Nom} · fin {m.DateFin:dd/MM/yyyy} · {m.Tjm}€×{m.Jours}j");

            return sb.ToString();
        }

        private static string Money(decimal d) => d.ToString("#,##0", Fr) + " €";
    }
}
