using Porteo.Models.Common;
using Porteo.Models.Consultants;

namespace Porteo.Models.Users
{
    /// <summary>
    /// Compte utilisateur. Le hash et le sel du mot de passe sont stockés
    /// (HMACSHA512) comme dans l'ERP de référence.
    /// </summary>
    public class User : BaseEntity
    {
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        /// <summary>Voir <see cref="UserRole"/>.</summary>
        public string Role { get; set; } = UserRole.User;
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Telephone { get; set; }
        public string Fonction { get; set; }
        /// <summary>Vérification en deux étapes (2FA) activée.</summary>
        public bool IsTwoFactorEnabled { get; set; }

        // ---- 2FA par email ----
        public string VerificationCode { get; set; }
        public DateTime? VerificationCodeExpires { get; set; }

        // ---- 2FA par application d'authentification (TOTP) ----
        public string TotpSecret { get; set; }
        public bool TotpEnabled { get; set; }

        // ---- Réinitialisation / activation du mot de passe ----
        public string ResetToken { get; set; }
        public DateTime? ResetTokenExpires { get; set; }

        /// <summary>Renseigné si l'utilisateur est un consultant (filtre d'appartenance).</summary>
        public int? ConsultantId { get; set; }
        public Consultant Consultant { get; set; }
    }
}
