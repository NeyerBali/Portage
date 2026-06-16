using System;
using Porteo.ModelViews.Configurations;
using Porteo.ModelViews.Factures;
using Porteo.Services.Factures;
using Xunit;

namespace Porteo.Tests
{
    public class FacturePdfBuilderTests
    {
        [Fact]
        public void Build_ProducesNonEmptyPdf_WithAndWithoutImages()
        {
            var facture = new FactureDto
            {
                Id = 1,
                Numero = "FAC-2026-0001",
                MontantHT = 1234.56m,
                Tva = 246.91m,
                MontantTTC = 1481.47m,
                Statut = "emise",
                DateEmission = new DateTime(2026, 6, 1),
                DateEcheance = new DateTime(2026, 6, 30),
                MissionTitre = "Développement plateforme",
                ClientNom = "ACME SAS",
            };
            var agency = new AgencyProfileDto
            {
                RaisonSociale = "Portéo SAS",
                Siret = "123 456 789 00010",
                TvaIntra = "FR12345678900",
                Adresse = "10 rue de la Paix",
                Ville = "75002 Paris",
                Email = "contact@porteo.fr",
                Telephone = "01 23 45 67 89",
                Iban = "FR76 3000 1000 0000 0000 0000 123",
                SiteWeb = "porteo.fr",
            };

            var bytes = FacturePdfBuilder.Build(facture, agency);
            Assert.NotNull(bytes);
            Assert.True(bytes.Length > 1000, $"PDF trop petit ({bytes.Length} octets)");
            // En-tête PDF.
            Assert.Equal((byte)'%', bytes[0]);
            Assert.Equal((byte)'P', bytes[1]);

            // Doit aussi fonctionner sans agence (valeurs nulles).
            var minimal = FacturePdfBuilder.Build(facture, null);
            Assert.True(minimal.Length > 1000);
        }
    }
}
