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
