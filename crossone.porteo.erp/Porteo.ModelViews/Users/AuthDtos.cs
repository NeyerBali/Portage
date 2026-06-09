using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Users
{
    /// <summary>Identifiants de connexion.</summary>
    public class LoginDto
    {
        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Format d'email invalide.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Le mot de passe est requis.")]
        public string Password { get; set; }
    }

    /// <summary>Réponse renvoyée après une authentification réussie.</summary>
    public class AuthResultDto
    {
        public string Token { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public int? ConsultantId { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>Réponse du login quand une 2ᵉ étape est requise (pas encore de token).</summary>
    public class TwoFactorChallengeDto
    {
        public bool NeedsTwoFactor { get; set; } = true;
        public bool HasTotp { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
    }

    public class EmailDto { public string Email { get; set; } }
    public class VerifyCodeDto { public string Email { get; set; } public string Code { get; set; } }
    public class TotpSetupResultDto { public string QrImage { get; set; } public string Secret { get; set; } public string QrUri { get; set; } }
    public class CodeDto { public string Code { get; set; } }
    public class ForgotPasswordDto { public string Email { get; set; } }
    public class ResetPasswordDto { public string Token { get; set; } public string NewPassword { get; set; } }

    /// <summary>Profil de l'utilisateur connecté (GET /api/auth/me).</summary>
    public class MeDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public int? ConsultantId { get; set; }
        public string Telephone { get; set; }
        public string Fonction { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public bool TotpEnabled { get; set; }
    }

    /// <summary>Mise à jour du profil (onglet Profil des paramètres).</summary>
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Le prénom est requis.")]
        public string Prenom { get; set; }
        [Required(ErrorMessage = "Le nom est requis.")]
        public string Nom { get; set; }
        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Format d'email invalide.")]
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string Fonction { get; set; }
    }

    /// <summary>Changement de mot de passe (onglet Sécurité).</summary>
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Le mot de passe actuel est requis.")]
        public string CurrentPassword { get; set; }
        [Required(ErrorMessage = "Le nouveau mot de passe est requis.")]
        [MinLength(6, ErrorMessage = "Au moins 6 caractères.")]
        public string NewPassword { get; set; }
    }

    /// <summary>Activation / désactivation de la 2FA.</summary>
    public class TwoFactorDto
    {
        public bool Enabled { get; set; }
    }

    /// <summary>Utilisateur (administration des comptes).</summary>
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Role { get; set; }
        public int? ConsultantId { get; set; }
    }
}
