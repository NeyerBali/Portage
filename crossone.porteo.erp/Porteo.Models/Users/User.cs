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

        /// <summary>Renseigné si l'utilisateur est un consultant (filtre d'appartenance).</summary>
        public int? ConsultantId { get; set; }
        public Consultant Consultant { get; set; }
    }
}
