using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Monitorings
{
    public class PayslipDto
    {
        public int Id { get; set; }
        public int ConsultantId { get; set; }
        public string ConsultantNom { get; set; }
        public string Mois { get; set; }
        public int JoursTravailles { get; set; }
        public decimal Facturable { get; set; }
        public decimal FraisGestion { get; set; }
        public decimal Brut { get; set; }
        public decimal ChargesSalariales { get; set; }
        public decimal ChargesPatronales { get; set; }
        public decimal Net { get; set; }
        public string Statut { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GeneratePayslipDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Le consultant est requis.")]
        public int ConsultantId { get; set; }
        [Required(ErrorMessage = "Le mois est requis.")]
        public string Mois { get; set; }
    }
}
