using System.Globalization;
using Porteo.ModelViews.Configurations;
using Porteo.ModelViews.Factures;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Porteo.Services.Factures
{
    /// <summary>Génère le PDF d'une facture (logo + infos agence + lignes + totaux + signature).</summary>
    public static class FacturePdfBuilder
    {
        private static readonly CultureInfo Fr = CultureInfo.GetCultureInfo("fr-FR");
        private const string Emerald = "#0E5C4A";
        private const string Dark = "#16201C";
        private const string Muted = "#586860";
        private const string Border = "#DEE4E1";
        private const string SoftBg = "#EEFBF4";

        static FacturePdfBuilder()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public static byte[] Build(FactureDto f, AgencyProfileDto a)
        {
            a ??= new AgencyProfileDto();
            var logo = DecodeDataUri(a.Logo);
            var signature = DecodeDataUri(a.Signature);
            var agencyName = string.IsNullOrWhiteSpace(a.RaisonSociale) ? "Portéo" : a.RaisonSociale;

            return Document.Create(doc =>
            {
                doc.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(38);
                    page.DefaultTextStyle(t => t.FontSize(10).FontColor(Dark));

                    // ── En-tête : logo / nom agence + bloc FACTURE ──────────────────
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            if (logo != null) col.Item().Height(46).AlignLeft().Image(logo).FitHeight();
                            else col.Item().Text(agencyName).FontSize(20).Bold().FontColor(Emerald);
                            col.Item().PaddingTop(4).Text(agencyName).SemiBold().FontColor(Dark);
                        });
                        row.ConstantItem(220).Column(col =>
                        {
                            col.Item().AlignRight().Text("FACTURE").FontSize(24).Bold().FontColor(Emerald);
                            col.Item().AlignRight().Text(f.Numero ?? "").FontSize(12).SemiBold();
                            col.Item().AlignRight().PaddingTop(4).Text($"Émise le {f.DateEmission.ToString("dd/MM/yyyy", Fr)}").FontColor(Muted);
                            col.Item().AlignRight().Text($"Échéance : {f.DateEcheance.ToString("dd/MM/yyyy", Fr)}").FontColor(Muted);
                            col.Item().AlignRight().PaddingTop(4).Text(StatutLabel(f.Statut)).FontColor(Emerald).SemiBold();
                        });
                    });

                    page.Content().PaddingVertical(18).Column(col =>
                    {
                        // ── Émetteur / Facturé à ───────────────────────────────────
                        col.Item().PaddingBottom(14).Row(row =>
                        {
                            row.RelativeItem().Element(c => InfoBox(c, "ÉMETTEUR", new[]
                            {
                                agencyName,
                                a.Adresse, a.Ville,
                                string.IsNullOrWhiteSpace(a.Siret) ? null : $"SIRET : {a.Siret}",
                                string.IsNullOrWhiteSpace(a.TvaIntra) ? null : $"TVA : {a.TvaIntra}",
                                a.Email, a.Telephone,
                            }));
                            row.ConstantItem(20);
                            row.RelativeItem().Element(c => InfoBox(c, "FACTURÉ À", new[]
                            {
                                f.ClientNom ?? "—",
                            }));
                        });

                        // ── Tableau des lignes ─────────────────────────────────────
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.RelativeColumn(5);
                                cols.RelativeColumn(1);
                                cols.RelativeColumn(2);
                                cols.RelativeColumn(2);
                            });
                            table.Header(h =>
                            {
                                h.Cell().Element(HeadCell).Text("Désignation");
                                h.Cell().Element(HeadCell).AlignRight().Text("Qté");
                                h.Cell().Element(HeadCell).AlignRight().Text("PU HT");
                                h.Cell().Element(HeadCell).AlignRight().Text("Montant HT");
                            });
                            var designation = string.IsNullOrWhiteSpace(f.MissionTitre)
                                ? "Prestation de portage salarial"
                                : $"Prestation — {f.MissionTitre}";
                            table.Cell().Element(BodyCell).Text(designation);
                            table.Cell().Element(BodyCell).AlignRight().Text("1");
                            table.Cell().Element(BodyCell).AlignRight().Text(Money(f.MontantHT));
                            table.Cell().Element(BodyCell).AlignRight().Text(Money(f.MontantHT));
                        });

                        // ── Totaux ─────────────────────────────────────────────────
                        col.Item().PaddingTop(14).AlignRight().Width(240).Column(t =>
                        {
                            t.Item().Element(c => TotalRow(c, "Total HT", Money(f.MontantHT), false));
                            t.Item().Element(c => TotalRow(c, "TVA", Money(f.Tva), false));
                            t.Item().Element(c => TotalRow(c, "Total TTC", Money(f.MontantTTC), true));
                        });

                        // ── IBAN + signature ───────────────────────────────────────
                        col.Item().PaddingTop(26).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                if (!string.IsNullOrWhiteSpace(a.Iban))
                                {
                                    c.Item().Text("Règlement par virement").SemiBold();
                                    c.Item().Text($"IBAN : {a.Iban}").FontColor(Muted);
                                }
                                c.Item().PaddingTop(6).Text($"À régler avant le {f.DateEcheance.ToString("dd/MM/yyyy", Fr)}.").FontColor(Muted);
                            });
                            row.ConstantItem(190).Column(c =>
                            {
                                c.Item().AlignRight().Text("Signature").FontColor(Muted).FontSize(9);
                                if (signature != null)
                                    c.Item().PaddingTop(4).Height(70).AlignRight().Image(signature).FitHeight();
                                else
                                    c.Item().PaddingTop(20).BorderBottom(1).BorderColor(Border);
                            });
                        });
                    });

                    // ── Pied de page légal ─────────────────────────────────────────
                    page.Footer().BorderTop(1).BorderColor(Border).PaddingTop(6).Column(col =>
                    {
                        var legal = string.Join("  ·  ", new[]
                        {
                            agencyName,
                            string.IsNullOrWhiteSpace(a.Siret) ? null : $"SIRET {a.Siret}",
                            string.IsNullOrWhiteSpace(a.TvaIntra) ? null : $"TVA {a.TvaIntra}",
                            a.SiteWeb,
                        }.Where(x => !string.IsNullOrWhiteSpace(x)));
                        col.Item().AlignCenter().Text(legal).FontSize(8).FontColor(Muted);
                    });
                });
            }).GeneratePdf();
        }

        // ── Helpers de style ──────────────────────────────────────────────────
        private static IContainer HeadCell(IContainer c) =>
            c.Background(SoftBg).PaddingVertical(7).PaddingHorizontal(8).DefaultTextStyle(t => t.SemiBold().FontColor(Emerald));
        private static IContainer BodyCell(IContainer c) =>
            c.BorderBottom(1).BorderColor(Border).PaddingVertical(8).PaddingHorizontal(8);

        private static void TotalRow(IContainer c, string label, string value, bool strong)
        {
            c.PaddingVertical(4).Row(row =>
            {
                row.RelativeItem().Text(label).FontColor(strong ? Dark : Muted).FontSize(strong ? 12 : 10).SemiBold();
                row.ConstantItem(110).AlignRight().Text(value)
                    .FontColor(strong ? Emerald : Dark).FontSize(strong ? 13 : 10).Bold();
            });
        }

        private static void InfoBox(IContainer c, string title, string[] lines)
        {
            c.Border(1).BorderColor(Border).Background("#FCFDFC").Padding(12).Column(col =>
            {
                col.Item().Text(title).FontSize(8).FontColor(Muted).Bold().LetterSpacing(0.05f);
                col.Item().PaddingTop(4).Column(inner =>
                {
                    var first = true;
                    foreach (var l in lines)
                    {
                        if (string.IsNullOrWhiteSpace(l)) continue;
                        if (first) inner.Item().Text(l).SemiBold().FontColor(Dark);
                        else inner.Item().Text(l).FontColor(Muted);
                        first = false;
                    }
                });
            });
        }

        private static string Money(decimal d) => d.ToString("#,##0.00", Fr) + " €";

        private static string StatutLabel(string s) => s switch
        {
            "payee" => "PAYÉE",
            "emise" => "ÉMISE",
            "annulee" => "ANNULÉE",
            "brouillon" => "BROUILLON",
            _ => (s ?? "").ToUpperInvariant(),
        };

        private static byte[] DecodeDataUri(string dataUri)
        {
            if (string.IsNullOrWhiteSpace(dataUri)) return null;
            var idx = dataUri.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
            var b64 = idx >= 0 ? dataUri[(idx + 7)..] : dataUri;
            try { return Convert.FromBase64String(b64.Trim()); }
            catch { return null; }
        }
    }
}
