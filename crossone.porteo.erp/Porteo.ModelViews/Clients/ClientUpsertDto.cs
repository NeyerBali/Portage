using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Clients
{
    /// <summary>DTO d'entrée pour la création / l'édition d'un client.</summary>
    public class ClientUpsertDto
    {
        [Required(ErrorMessage = "La raison sociale est requise.")]
        public string RaisonSociale { get; set; }

        public string Siret { get; set; }

        [Required(ErrorMessage = "Le secteur est requis.")]
        public string Secteur { get; set; }

        [Required(ErrorMessage = "Le contact est requis.")]
        public string Contact { get; set; }

        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Format d'email invalide.")]
        public string Email { get; set; }

        public string Telephone { get; set; }
        public string Adresse { get; set; }

        [Required(ErrorMessage = "La ville est requise.")]
        public string Ville { get; set; }
    }
}
