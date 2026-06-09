using System.Security.Claims;
using Porteo.Models.Users;

namespace Porteo.Api.Helpers
{
    /// <summary>Accès typé aux claims de l'utilisateur courant.</summary>
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : 0;
        }

        public static string GetRole(this ClaimsPrincipal user)
            => user.FindFirstValue(ClaimTypes.Role) ?? UserRole.User;

        public static bool IsAdmin(this ClaimsPrincipal user)
            => string.Equals(user.GetRole(), UserRole.Admin, StringComparison.OrdinalIgnoreCase);

        public static int? GetConsultantId(this ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue("ConsultantId");
            return int.TryParse(raw, out var id) ? id : (int?)null;
        }

        /// <summary>
        /// Identifiant de consultant à utiliser comme filtre d'appartenance :
        /// null pour un administrateur (voit tout), l'id du consultant sinon.
        /// </summary>
        public static int? OwnerConsultantId(this ClaimsPrincipal user)
            => user.IsAdmin() ? null : user.GetConsultantId();
    }
}
