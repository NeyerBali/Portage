namespace Porteo.Dapper.Dashboard
{
    /// <summary>
    /// Requêtes SQL d'agrégation du dashboard (lectures Dapper).
    /// Les identifiants PascalCase sont entre guillemets car PostgreSQL
    /// replie les identifiants non quotés en minuscules.
    /// </summary>
    public interface IDashboardQueries : IQuery
    {
        /// <summary>CA (somme HT des factures émises/payées) groupé par mois AAAA-MM.</summary>
        string CaParMois(int? consultantId = null);
        /// <summary>Nombre de missions et montant total par statut.</summary>
        string MissionsParStatut(int? consultantId = null);
        /// <summary>Top 5 clients par chiffre d'affaires (TJM × Jours).</summary>
        string TopClients();
        /// <summary>KPIs agrégés (CA, missions actives, consultants, factures impayées).</summary>
        string Kpis(int? consultantId = null);
    }

    public class DashboardQueries : IDashboardQueries
    {
        public string GetTableName() => "missions";

        public string GetManagerQuery() => CaParMois(null);

        public string GetConsultantQuery(int consultantId) => CaParMois(consultantId);

        public string CaParMois(int? consultantId = null)
        {
            var filtre = consultantId.HasValue
                ? $@"AND m.""ConsultantId"" = {consultantId.Value}"
                : string.Empty;

            return $@"
                SELECT to_char(f.""DateEmission"", 'YYYY-MM') AS ""Mois"",
                       SUM(f.""MontantHT"")                    AS ""Montant""
                FROM factures f
                JOIN missions m ON m.""Id"" = f.""MissionId""
                WHERE f.""Statut"" IN ('emise','payee')
                  AND f.""DateEmission"" >= (CURRENT_DATE - INTERVAL '12 months')
                  {filtre}
                GROUP BY 1
                ORDER BY 1;";
        }

        public string MissionsParStatut(int? consultantId = null)
        {
            var filtre = consultantId.HasValue
                ? $@"WHERE m.""ConsultantId"" = {consultantId.Value}"
                : string.Empty;

            return $@"
                SELECT m.""Statut""                       AS ""Statut"",
                       COUNT(*)                            AS ""Nombre"",
                       COALESCE(SUM(m.""Tjm"" * m.""Jours""),0) AS ""Montant""
                FROM missions m
                {filtre}
                GROUP BY m.""Statut"";";
        }

        public string TopClients()
        {
            return @"
                SELECT c.""Id""              AS ""ClientId"",
                       c.""RaisonSociale""    AS ""RaisonSociale"",
                       COALESCE(SUM(m.""Tjm"" * m.""Jours""),0) AS ""Ca"",
                       COUNT(m.""Id"")        AS ""NombreMissions""
                FROM clients c
                LEFT JOIN missions m ON m.""ClientId"" = c.""Id""
                GROUP BY c.""Id"", c.""RaisonSociale""
                ORDER BY ""Ca"" DESC
                LIMIT 5;";
        }

        public string Kpis(int? consultantId = null)
        {
            var fMission = consultantId.HasValue ? $@"WHERE m.""ConsultantId"" = {consultantId.Value}" : string.Empty;
            var fFacture = consultantId.HasValue
                ? $@"JOIN missions m ON m.""Id"" = f.""MissionId"" WHERE m.""ConsultantId"" = {consultantId.Value} AND"
                : "WHERE";

            return $@"
                SELECT
                  (SELECT COALESCE(SUM(f.""MontantHT""),0)
                     FROM factures f {fFacture} f.""Statut"" IN ('emise','payee'))            AS ""CaTotal"",
                  (SELECT COUNT(*) FROM missions m {fMission}{(consultantId.HasValue ? " AND" : " WHERE")} m.""Statut"" = 'en_cours') AS ""MissionsActives"",
                  (SELECT COUNT(*) FROM consultants)                                          AS ""Consultants"",
                  (SELECT COUNT(*) FROM factures f {(consultantId.HasValue ? $@"JOIN missions m ON m.""Id"" = f.""MissionId"" WHERE m.""ConsultantId"" = {consultantId.Value} AND" : "WHERE")} f.""Statut"" = 'emise') AS ""FacturesImpayees"";";
        }
    }

    /// <summary>Projection du résultat de <see cref="IDashboardQueries.Kpis"/>.</summary>
    public class KpiAggregateRow
    {
        public decimal CaTotal { get; set; }
        public int MissionsActives { get; set; }
        public int Consultants { get; set; }
        public int FacturesImpayees { get; set; }
    }
}
