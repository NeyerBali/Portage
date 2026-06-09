using System.Security.Cryptography;
using System.Text;

namespace Porteo.Services.Auth
{
    /// <summary>
    /// Hachage de mot de passe HMACSHA512 (hash + sel), identique à l'ERP de référence.
    /// </summary>
    public static class PasswordHasher
    {
        public static void Create(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password ?? string.Empty));
        }

        public static bool Verify(string password, byte[] hash, byte[] salt)
        {
            if (hash == null || salt == null) return false;
            using var hmac = new HMACSHA512(salt);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(password ?? string.Empty));
            return computed.SequenceEqual(hash);
        }
    }
}
