using Microsoft.EntityFrameworkCore;
using Porteo.Models.Activities;
using Porteo.Models.Clients;
using Porteo.Models.Configurations;
using Porteo.Models.Consultants;
using Porteo.Models.Factures;
using Porteo.Models.Justificatifs;
using Porteo.Models.Missions;
using Porteo.Models.Monitorings;
using Porteo.Models.Productions;
using Porteo.Models.Rh;
using Porteo.Models.Users;

namespace Porteo.Repositories.Context
{
    /// <summary>
    /// Contexte EF Core de Portéo. Source d'écriture unique (les lectures
    /// d'agrégats passent par Dapper, voir couche DAPPER).
    /// </summary>
    public class PorteoDbContext : DbContext
    {
        public PorteoDbContext(DbContextOptions<PorteoDbContext> options) : base(options) { }

        public DbSet<Client> Clients { get; set; }
        public DbSet<Consultant> Consultants { get; set; }
        public DbSet<Mission> Missions { get; set; }
        public DbSet<Facture> Factures { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Justificatif> Justificatifs { get; set; }
        public DbSet<ActivityEntry> Activities { get; set; }
        public DbSet<Cra> Cras { get; set; }
        public DbSet<Absence> Absences { get; set; }
        public DbSet<Demande> Demandes { get; set; }
        public DbSet<GlobalParameter> GlobalParameters { get; set; }
        public DbSet<AgencyProfile> AgencyProfiles { get; set; }
        public DbSet<Payslip> Payslips { get; set; }

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            // ---- Client ----
            b.Entity<Client>(e =>
            {
                e.ToTable("clients");
                e.HasKey(x => x.Id);
                e.Property(x => x.RaisonSociale).IsRequired().HasMaxLength(200);
                e.Property(x => x.Siret).HasMaxLength(20);
                e.Property(x => x.Email).HasMaxLength(200);
                e.HasMany(x => x.Missions)
                 .WithOne(m => m.Client)
                 .HasForeignKey(m => m.ClientId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Consultant ----
            b.Entity<Consultant>(e =>
            {
                e.ToTable("consultants");
                e.HasKey(x => x.Id);
                e.Property(x => x.Nom).IsRequired().HasMaxLength(120);
                e.Property(x => x.Prenom).IsRequired().HasMaxLength(120);
                e.Property(x => x.Email).HasMaxLength(200);
                e.Property(x => x.Tjm).HasColumnType("numeric(10,2)");
                e.Property(x => x.Statut).HasMaxLength(20);
                e.HasIndex(x => x.Email).IsUnique();
                e.HasMany(x => x.Missions)
                 .WithOne(m => m.Consultant)
                 .HasForeignKey(m => m.ConsultantId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Mission ----
            b.Entity<Mission>(e =>
            {
                e.ToTable("missions");
                e.HasKey(x => x.Id);
                e.Property(x => x.Titre).IsRequired().HasMaxLength(200);
                e.Property(x => x.Statut).IsRequired().HasMaxLength(20);
                e.Property(x => x.Tjm).HasColumnType("numeric(10,2)");
                e.HasIndex(x => x.Statut);
                e.HasMany(x => x.Factures)
                 .WithOne(f => f.Mission)
                 .HasForeignKey(f => f.MissionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Facture ----
            b.Entity<Facture>(e =>
            {
                e.ToTable("factures");
                e.HasKey(x => x.Id);
                e.Property(x => x.Numero).IsRequired().HasMaxLength(40);
                e.Property(x => x.Statut).IsRequired().HasMaxLength(20);
                e.Property(x => x.MontantHT).HasColumnType("numeric(12,2)");
                e.Property(x => x.Tva).HasColumnType("numeric(12,2)");
                e.Property(x => x.MontantTTC).HasColumnType("numeric(12,2)");
                e.HasIndex(x => x.Numero).IsUnique();
            });

            // ---- Justificatif ----
            b.Entity<Justificatif>(e =>
            {
                e.ToTable("justificatifs");
                e.HasKey(x => x.Id);
                e.Property(x => x.Libelle).IsRequired().HasMaxLength(200);
                e.Property(x => x.Type).IsRequired().HasMaxLength(20);
                e.Property(x => x.Statut).IsRequired().HasMaxLength(20);
                e.Property(x => x.Montant).HasColumnType("numeric(12,2)");
                e.Property(x => x.Data).HasColumnType("bytea");
                e.HasIndex(x => x.Statut);
                e.HasOne(x => x.Mission).WithMany().HasForeignKey(x => x.MissionId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Consultant).WithMany().HasForeignKey(x => x.ConsultantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ---- ActivityEntry (journal) ----
            b.Entity<ActivityEntry>(e =>
            {
                e.ToTable("activity_entries");
                e.HasKey(x => x.Id);
                e.Property(x => x.Type).IsRequired().HasMaxLength(40);
                e.Property(x => x.Titre).HasMaxLength(200);
                e.HasIndex(x => x.CreatedAt);
            });

            // ---- CRA ----
            b.Entity<Cra>(e =>
            {
                e.ToTable("cras");
                e.HasKey(x => x.Id);
                e.Property(x => x.Mois).IsRequired().HasMaxLength(7);
                e.Property(x => x.Statut).IsRequired().HasMaxLength(20);
                e.HasOne(x => x.Mission).WithMany().HasForeignKey(x => x.MissionId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Consultant).WithMany().HasForeignKey(x => x.ConsultantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Absence ----
            b.Entity<Absence>(e =>
            {
                e.ToTable("absences");
                e.HasKey(x => x.Id);
                e.Property(x => x.Type).IsRequired().HasMaxLength(20);
                e.Property(x => x.Statut).IsRequired().HasMaxLength(20);
                e.Property(x => x.NbJours).HasColumnType("numeric(6,1)");
                e.HasOne(x => x.Consultant).WithMany().HasForeignKey(x => x.ConsultantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Demande RH ----
            b.Entity<Demande>(e =>
            {
                e.ToTable("demandes");
                e.HasKey(x => x.Id);
                e.Property(x => x.Type).IsRequired().HasMaxLength(20);
                e.Property(x => x.Statut).IsRequired().HasMaxLength(20);
                e.Property(x => x.Montant).HasColumnType("numeric(12,2)");
                e.HasOne(x => x.Consultant).WithMany().HasForeignKey(x => x.ConsultantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Paramètres globaux ----
            b.Entity<GlobalParameter>(e =>
            {
                e.ToTable("global_parameters");
                e.HasKey(x => x.Id);
                e.Property(x => x.Cle).IsRequired().HasMaxLength(60);
                e.HasIndex(x => x.Cle).IsUnique();
            });

            // ---- Profil agence ----
            b.Entity<AgencyProfile>(e =>
            {
                e.ToTable("agency_profile");
                e.HasKey(x => x.Id);
                e.Property(x => x.RaisonSociale).HasMaxLength(200);
            });

            // ---- Bulletins de paie ----
            b.Entity<Payslip>(e =>
            {
                e.ToTable("payslips");
                e.HasKey(x => x.Id);
                e.Property(x => x.Mois).IsRequired().HasMaxLength(7);
                foreach (var p in new[] { nameof(Payslip.Facturable), nameof(Payslip.FraisGestion), nameof(Payslip.Brut), nameof(Payslip.ChargesSalariales), nameof(Payslip.ChargesPatronales), nameof(Payslip.Net) })
                    e.Property(p).HasColumnType("numeric(12,2)");
                e.HasOne(x => x.Consultant).WithMany().HasForeignKey(x => x.ConsultantId).OnDelete(DeleteBehavior.Restrict);
            });

            // ---- User ----
            b.Entity<User>(e =>
            {
                e.ToTable("users");
                e.HasKey(x => x.Id);
                e.Property(x => x.Email).IsRequired().HasMaxLength(200);
                e.Property(x => x.Role).IsRequired().HasMaxLength(20);
                e.HasIndex(x => x.Email).IsUnique();
                e.HasOne(x => x.Consultant)
                 .WithMany()
                 .HasForeignKey(x => x.ConsultantId)
                 .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
