namespace Porteo.Models.Users
{
    /// <summary>
    /// Rôles applicatifs. Un utilisateur « User » rattaché à un Consultant
    /// (ConsultantId non nul) se comporte comme un consultant : il ne voit
    /// que ses propres missions (filtre d'appartenance des données).
    /// </summary>
    public static class UserRole
    {
        public const string Admin = "Admin";
        public const string User = "User";

        public static readonly string[] All = { Admin, User };
    }
}
