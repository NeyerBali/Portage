using Microsoft.EntityFrameworkCore;
using Porteo.Models.Activities;
using Porteo.Models.Clients;
using Porteo.Models.Configurations;
using Porteo.Models.Consultants;
using Porteo.Models.Factures;
using Porteo.Models.Justificatifs;
using Porteo.Models.Missions;
using Porteo.Models.Productions;
using Porteo.Models.Rh;
using Porteo.Models.Users;
using Porteo.Repositories.Context;
using Porteo.Services.Auth;

namespace Porteo.Api.Data
{
    /// <summary>
    /// Applique les migrations puis insère un jeu de données de démonstration
    /// (clients, consultants, missions, factures, 1 admin + 1 consultant).
    /// </summary>
    public static class DbInitializer
    {
        private static DateTime Utc(int year, int month, int day)
            => DateTime.SpecifyKind(new DateTime(year, month, day), DateTimeKind.Utc);

        public static async Task SeedAsync(PorteoDbContext db, ILogger logger)
        {
            await db.Database.MigrateAsync();

            if (await db.Users.AnyAsync())
            {
                // Base déjà initialisée : on complète les nouvelles tables si vides.
                await TopUpAsync(db, logger);
                return;
            }

            logger.LogInformation("Initialisation des données de démonstration…");
            var now = DateTime.UtcNow;

            // ---- Consultants ----
            var consultants = new List<Consultant>
            {
                new() { Nom = "Rousseau", Prenom = "Camille", Email = "camille.rousseau@porteo.dev", Telephone = "06 12 34 56 78", Specialite = "Développeuse Fullstack", Tjm = 650, Ville = "Lyon", Competences = "Angular, .NET, SQL", Statut = "active", CreatedAt = now },
                new() { Nom = "Lefèvre", Prenom = "Maxime", Email = "maxime.lefevre@porteo.dev", Telephone = "06 22 33 44 55", Specialite = "Ingénieur DevOps", Tjm = 720, Ville = "Paris", Competences = "Docker, Kubernetes, AWS", Statut = "active", CreatedAt = now },
                new() { Nom = "Benali", Prenom = "Sofia", Email = "sofia.benali@porteo.dev", Telephone = "06 33 44 55 66", Specialite = "Data Engineer", Tjm = 700, Ville = "Nantes", Competences = "Python, Spark, SQL", Statut = "active", CreatedAt = now },
                new() { Nom = "Girard", Prenom = "Thomas", Email = "thomas.girard@porteo.dev", Telephone = "06 44 55 66 77", Specialite = "Designer UX/UI", Tjm = 550, Ville = "Bordeaux", Competences = "Figma, Design System, Accessibilité", Statut = "paused", CreatedAt = now },
                new() { Nom = "Marchand", Prenom = "Léa", Email = "lea.marchand@porteo.dev", Telephone = "06 55 66 77 88", Specialite = "Cheffe de projet", Tjm = 600, Ville = "Lille", Competences = "Agile, Scrum, Jira", Statut = "active", CreatedAt = now },
            };
            db.Consultants.AddRange(consultants);

            // ---- Clients ----
            var clients = new List<Client>
            {
                new() { RaisonSociale = "Société Générale", Siret = "55212022200013", Secteur = "Banque & Finance", Contact = "Julien Mercier", Email = "contact@socgen.example", Telephone = "01 42 14 20 00", Adresse = "29 Bd Haussmann", Ville = "Paris", CreatedAt = now },
                new() { RaisonSociale = "Decathlon", Siret = "30659604100025", Secteur = "Distribution", Contact = "Aurélie Dubois", Email = "achats@decathlon.example", Telephone = "03 20 33 50 00", Adresse = "4 Bd de Mons", Ville = "Villeneuve-d'Ascq", CreatedAt = now },
                new() { RaisonSociale = "Doctolib", Siret = "79434704000028", Secteur = "Santé & Tech", Contact = "Karim Haddad", Email = "tech@doctolib.example", Telephone = "01 76 36 00 00", Adresse = "54 Quai Charles Pasqua", Ville = "Levallois-Perret", CreatedAt = now },
                new() { RaisonSociale = "EDF", Siret = "55208131766522", Secteur = "Énergie", Contact = "Nathalie Roy", Email = "si@edf.example", Telephone = "01 40 42 22 22", Adresse = "22-30 Av. de Wagram", Ville = "Paris", CreatedAt = now },
                new() { RaisonSociale = "BlaBlaCar", Siret = "49108189000037", Secteur = "Mobilité", Contact = "Hugo Petit", Email = "it@blablacar.example", Telephone = "01 84 80 00 00", Adresse = "84 Av. de la République", Ville = "Paris", CreatedAt = now },
            };
            db.Clients.AddRange(clients);

            await db.SaveChangesAsync(); // récupère les Id

            var c = consultants;
            var cl = clients;

            // ---- Missions ----
            var missions = new List<Mission>
            {
                new() { Titre = "Refonte portail client", Description = "Migration Angular 16 + design system.", Statut = MissionStatut.EnCours, DateDebut = Utc(2026,1,6), DateFin = Utc(2026,6,30), Tjm = 650, Jours = 80, ClientId = cl[0].Id, ConsultantId = c[0].Id, CreatedAt = now.AddDays(-40) },
                new() { Titre = "Plateforme CI/CD", Description = "Mise en place GitOps + Kubernetes.", Statut = MissionStatut.EnCours, DateDebut = Utc(2026,2,1), DateFin = Utc(2026,7,31), Tjm = 720, Jours = 60, ClientId = cl[2].Id, ConsultantId = c[1].Id, CreatedAt = now.AddDays(-30) },
                new() { Titre = "Data lake énergie", Description = "Ingestion temps réel des compteurs.", Statut = MissionStatut.Facturee, DateDebut = Utc(2025,9,1), DateFin = Utc(2025,12,20), Tjm = 700, Jours = 70, ClientId = cl[3].Id, ConsultantId = c[2].Id, CreatedAt = now.AddDays(-120) },
                new() { Titre = "Design system mobile", Description = "Composants UI réutilisables.", Statut = MissionStatut.Terminee, DateDebut = Utc(2025,10,1), DateFin = Utc(2025,12,15), Tjm = 550, Jours = 45, ClientId = cl[1].Id, ConsultantId = c[3].Id, CreatedAt = now.AddDays(-100) },
                new() { Titre = "Cadrage app covoiturage", Description = "Atelier produit + backlog.", Statut = MissionStatut.Brouillon, DateDebut = Utc(2026,3,1), DateFin = Utc(2026,4,30), Tjm = 600, Jours = 30, ClientId = cl[4].Id, ConsultantId = c[4].Id, CreatedAt = now.AddDays(-10) },
                new() { Titre = "API paiement", Description = "Intégration PSP + 3DS.", Statut = MissionStatut.EnCours, DateDebut = Utc(2026,1,15), DateFin = Utc(2026,5,15), Tjm = 650, Jours = 50, ClientId = cl[0].Id, ConsultantId = c[0].Id, CreatedAt = now.AddDays(-25) },
                new() { Titre = "Observabilité", Description = "Stack Prometheus / Grafana.", Statut = MissionStatut.Facturee, DateDebut = Utc(2025,11,1), DateFin = Utc(2026,1,31), Tjm = 720, Jours = 40, ClientId = cl[2].Id, ConsultantId = c[1].Id, CreatedAt = now.AddDays(-80) },
                new() { Titre = "Reporting BI", Description = "Dashboards décisionnels.", Statut = MissionStatut.Terminee, DateDebut = Utc(2025,8,1), DateFin = Utc(2025,10,30), Tjm = 700, Jours = 55, ClientId = cl[3].Id, ConsultantId = c[2].Id, CreatedAt = now.AddDays(-150) },
                new() { Titre = "Audit accessibilité", Description = "Mise en conformité RGAA.", Statut = MissionStatut.Annulee, DateDebut = Utc(2025,12,1), DateFin = Utc(2026,1,15), Tjm = 550, Jours = 20, ClientId = cl[1].Id, ConsultantId = c[3].Id, CreatedAt = now.AddDays(-60) },
                new() { Titre = "Coaching agile", Description = "Accompagnement 3 squads.", Statut = MissionStatut.EnCours, DateDebut = Utc(2026,2,10), DateFin = Utc(2026,6,10), Tjm = 600, Jours = 35, ClientId = cl[4].Id, ConsultantId = c[4].Id, CreatedAt = now.AddDays(-15) },
            };
            db.Missions.AddRange(missions);
            await db.SaveChangesAsync();

            // ---- Factures ----
            decimal Ttc(decimal ht) => Math.Round(ht * 1.20m, 2);
            decimal Tva(decimal ht) => Math.Round(ht * 0.20m, 2);

            var m = missions;
            var factures = new List<Facture>
            {
                new() { Numero = "FAC-2025-0001", MissionId = m[2].Id, MontantHT = 49000, Tva = Tva(49000), MontantTTC = Ttc(49000), Statut = FactureStatut.Payee, DateEmission = Utc(2025,12,22), DateEcheance = Utc(2026,1,22), CreatedAt = now.AddDays(-110) },
                new() { Numero = "FAC-2025-0002", MissionId = m[7].Id, MontantHT = 38500, Tva = Tva(38500), MontantTTC = Ttc(38500), Statut = FactureStatut.Payee, DateEmission = Utc(2025,11,5), DateEcheance = Utc(2025,12,5), CreatedAt = now.AddDays(-140) },
                new() { Numero = "FAC-2026-0001", MissionId = m[6].Id, MontantHT = 28800, Tva = Tva(28800), MontantTTC = Ttc(28800), Statut = FactureStatut.Emise, DateEmission = Utc(2026,2,1), DateEcheance = Utc(2026,3,3), CreatedAt = now.AddDays(-35) },
                new() { Numero = "FAC-2026-0002", MissionId = m[0].Id, MontantHT = 26000, Tva = Tva(26000), MontantTTC = Ttc(26000), Statut = FactureStatut.Emise, DateEmission = Utc(2026,3,1), DateEcheance = Utc(2026,4,1), CreatedAt = now.AddDays(-20) },
                new() { Numero = "FAC-2026-0003", MissionId = m[1].Id, MontantHT = 21600, Tva = Tva(21600), MontantTTC = Ttc(21600), Statut = FactureStatut.Emise, DateEmission = Utc(2026,4,1), DateEcheance = Utc(2026,5,2), CreatedAt = now.AddDays(-12) },
                new() { Numero = "FAC-2026-0004", MissionId = m[3].Id, MontantHT = 12000, Tva = Tva(12000), MontantTTC = Ttc(12000), Statut = FactureStatut.Brouillon, DateEmission = Utc(2026,5,1), DateEcheance = Utc(2026,6,1), CreatedAt = now.AddDays(-5) },
                // Facture émise en retard (déclenche la relance Quartz)
                new() { Numero = "FAC-2026-0005", MissionId = m[5].Id, MontantHT = 18000, Tva = Tva(18000), MontantTTC = Ttc(18000), Statut = FactureStatut.Emise, DateEmission = Utc(2026,1,10), DateEcheance = Utc(2026,2,10), CreatedAt = now.AddDays(-50) },
            };
            db.Factures.AddRange(factures);

            // ---- Justificatifs (déposés par des consultants) ----
            db.Justificatifs.AddRange(
                new Justificatif { MissionId = m[0].Id, ConsultantId = m[0].ConsultantId, Type = JustificatifType.Frais, Libelle = "Frais de déplacement Lyon-Paris", Montant = 184.50m, DateJustificatif = Utc(2026, 2, 12), Notes = "Train A/R + taxi", Statut = JustificatifStatut.EnAttente, CreatedAt = now.AddDays(-8) },
                new Justificatif { MissionId = m[0].Id, ConsultantId = m[0].ConsultantId, Type = JustificatifType.Cra, Libelle = "CRA Janvier 2026", Montant = null, DateJustificatif = Utc(2026, 2, 1), Notes = "18 jours travaillés", Statut = JustificatifStatut.Valide, DateTraitement = now.AddDays(-20), CreatedAt = now.AddDays(-25) },
                new Justificatif { MissionId = m[2].Id, ConsultantId = m[2].ConsultantId, Type = JustificatifType.Document, Libelle = "Attestation de formation Spark", Montant = null, DateJustificatif = Utc(2025, 11, 15), Statut = JustificatifStatut.Valide, DateTraitement = now.AddDays(-60), CreatedAt = now.AddDays(-62) },
                new Justificatif { MissionId = m[1].Id, ConsultantId = m[1].ConsultantId, Type = JustificatifType.Frais, Libelle = "Hôtel mission Doctolib", Montant = 320m, DateJustificatif = Utc(2026, 3, 5), Notes = "2 nuits", Statut = JustificatifStatut.EnAttente, CreatedAt = now.AddDays(-4) }
            );

            // ---- Journal d'activité (amorçage) ----
            db.Activities.AddRange(
                new ActivityEntry { Type = "mission_created", Titre = "Mission créée", Description = "Refonte portail client · Société Générale", UserName = "Portéo Admin", ConsultantId = c[0].Id, CreatedAt = now.AddDays(-40) },
                new ActivityEntry { Type = "facture_paid", Titre = "Facture payée", Description = "FAC-2025-0001 · EDF", UserName = "Portéo Admin", CreatedAt = now.AddDays(-30) },
                new ActivityEntry { Type = "justif_created", Titre = "Justificatif déposé", Description = "CRA Janvier 2026 · Camille Rousseau", UserName = "Camille Rousseau", ConsultantId = c[0].Id, CreatedAt = now.AddDays(-25) },
                new ActivityEntry { Type = "justif_validated", Titre = "Justificatif validé", Description = "CRA Janvier 2026", UserName = "Portéo Admin", ConsultantId = c[0].Id, CreatedAt = now.AddDays(-20) }
            );

            // ---- Utilisateurs ----
            PasswordHasher.Create("Porteo2026!", out var adminHash, out var adminSalt);
            PasswordHasher.Create("Porteo2026!", out var consHash, out var consSalt);

            db.Users.AddRange(
                new User { Email = "neyerbali6@gmail.com", Nom = "Admin", Prenom = "Portéo", Role = UserRole.Admin, PasswordHash = adminHash, PasswordSalt = adminSalt, CreatedAt = now },
                new User { Email = "neyerbali6+consultant@gmail.com", Nom = "Rousseau", Prenom = "Camille", Role = UserRole.User, ConsultantId = c[0].Id, PasswordHash = consHash, PasswordSalt = consSalt, CreatedAt = now }
            );

            await db.SaveChangesAsync();
            await TopUpAsync(db, logger);
            logger.LogInformation("Seed terminé : {Consultants} consultants, {Clients} clients, {Missions} missions, {Factures} factures.",
                consultants.Count, clients.Count, missions.Count, factures.Count);
        }

        /// <summary>Complète les tables RH/config si elles sont vides (idempotent).</summary>
        private static async Task TopUpAsync(PorteoDbContext db, ILogger logger)
        {
            var now = DateTime.UtcNow;
            var changed = false;

            // Bascule les emails de démo vers une vraie boîte (réception du code 2FA).
            var oldAdmin = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@porteo.dev");
            if (oldAdmin != null) { oldAdmin.Email = "neyerbali6@gmail.com"; changed = true; }
            var oldCons = await db.Users.FirstOrDefaultAsync(u => u.Email == "consultant@porteo.dev");
            if (oldCons != null) { oldCons.Email = "neyerbali6+consultant@gmail.com"; changed = true; }

            // Nettoyage : supprime les lignes dont le texte contient le caractère de
            // remplacement U+FFFD (« � ») — accents corrompus par un ancien encodage.
            const char MOJIBAKE = '�';
            var badActs = (await db.Activities.ToListAsync())
                .Where(a => (a.Titre?.IndexOf(MOJIBAKE) >= 0) || (a.Description?.IndexOf(MOJIBAKE) >= 0)).ToList();
            if (badActs.Count > 0) { db.Activities.RemoveRange(badActs); changed = true; logger.LogInformation("Nettoyage : {N} activité(s) corrompue(s) supprimée(s).", badActs.Count); }
            var badJustifs = (await db.Justificatifs.ToListAsync())
                .Where(j => (j.Libelle?.IndexOf(MOJIBAKE) >= 0) || (j.Notes?.IndexOf(MOJIBAKE) >= 0)).ToList();
            if (badJustifs.Count > 0) { db.Justificatifs.RemoveRange(badJustifs); changed = true; logger.LogInformation("Nettoyage : {N} justificatif(s) corrompu(s) supprimé(s).", badJustifs.Count); }

            if (!await db.GlobalParameters.AnyAsync())
            {
                db.GlobalParameters.AddRange(
                    new GlobalParameter { Cle = ParamKeys.TauxTva, Libelle = "Taux de TVA (%)", Valeur = "20", Groupe = "Facturation", CreatedAt = now },
                    new GlobalParameter { Cle = ParamKeys.FraisGestion, Libelle = "Frais de gestion (%)", Valeur = "8", Groupe = "Portage", CreatedAt = now },
                    new GlobalParameter { Cle = ParamKeys.ChargesSalariales, Libelle = "Charges salariales (%)", Valeur = "22", Groupe = "Paie", CreatedAt = now },
                    new GlobalParameter { Cle = ParamKeys.ChargesPatronales, Libelle = "Charges patronales (%)", Valeur = "42", Groupe = "Paie", CreatedAt = now });
                changed = true;
            }

            if (!await db.AgencyProfiles.AnyAsync())
            {
                db.AgencyProfiles.Add(new AgencyProfile
                {
                    RaisonSociale = "Portéo SAS", Siret = "90112233400015", TvaIntra = "FR90901122334",
                    Adresse = "12 rue de la République", Ville = "Lyon", Email = "contact@porteo.dev",
                    Telephone = "04 78 00 00 00", SiteWeb = "https://porteo.dev", Iban = "FR76 3000 4000 0100 0001 2345 678", CreatedAt = now,
                });
                changed = true;
            }

            // Démo RH (CRA / absence / demande) pour le premier consultant ayant une mission.
            if (!await db.Cras.AnyAsync())
            {
                var mission = await db.Missions.OrderBy(m => m.Id).FirstOrDefaultAsync();
                if (mission != null)
                {
                    db.Cras.AddRange(
                        new Cra { MissionId = mission.Id, ConsultantId = mission.ConsultantId, Mois = "2026-01", JoursTravailles = 18, JoursAbsence = 2, Commentaire = "Mois complet", Statut = CraStatut.Valide, CreatedAt = now.AddDays(-30) },
                        new Cra { MissionId = mission.Id, ConsultantId = mission.ConsultantId, Mois = "2026-02", JoursTravailles = 20, JoursAbsence = 0, Statut = CraStatut.Soumis, CreatedAt = now.AddDays(-5) });
                    if (!await db.Absences.AnyAsync())
                        db.Absences.Add(new Absence { ConsultantId = mission.ConsultantId, Type = AbsenceType.CongePaye, DateDebut = new DateTime(2026, 4, 14, 0, 0, 0, DateTimeKind.Utc), DateFin = new DateTime(2026, 4, 18, 0, 0, 0, DateTimeKind.Utc), NbJours = 5, Motif = "Congés de printemps", Statut = AbsenceStatut.Demande, CreatedAt = now.AddDays(-3) });
                    if (!await db.Demandes.AnyAsync())
                        db.Demandes.Add(new Demande { ConsultantId = mission.ConsultantId, Type = DemandeType.Attestation, Objet = "Attestation employeur", Description = "Pour dossier logement", Statut = DemandeStatut.Ouverte, CreatedAt = now.AddDays(-2) });
                    changed = true;
                }
            }

            if (changed) { await db.SaveChangesAsync(); logger.LogInformation("Top-up RH/config appliqué."); }
        }
    }
}
