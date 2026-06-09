using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Porteo.Api.Helpers;
using Porteo.Models.Users;

namespace Porteo.Api.Filters
{
    /// <summary>
    /// Filtre d'autorisation « propriété des données » : un utilisateur de rôle
    /// « User » doit être rattaché à un consultant (ConsultantId) pour accéder
    /// aux ressources filtrées. L'enforcement par ligne (mission/facture) est
    /// réalisé dans les services à partir de cet identifiant.
    /// (Même rôle que le DataOwnershipProtectionFilter de l'ERP de référence.)
    /// </summary>
    public class DataOwnershipProtectionFilter : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Les administrateurs ont accès à tout.
            if (user.IsAdmin()) return;

            // Un consultant doit être correctement rattaché.
            if (user.GetRole() == UserRole.User && user.GetConsultantId() == null)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
