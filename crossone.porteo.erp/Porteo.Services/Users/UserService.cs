using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using OtpNet;
using Porteo.Models.Users;
using Porteo.ModelViews.Users;
using Porteo.Repositories;
using Porteo.Services.Auth;
using Porteo.Services.Common;

namespace Porteo.Services.Users
{
    public interface IUserService : IGenericService<User>
    {
        Task<User> Authenticate(string email, string password);
        Task<User> FindByEmail(string email);
        TokenResult CreateToken(User user, string secret, int expiryMinutes = 480);
        Task<MeDto> GetMe(int userId);
        Task<bool> ChangePassword(int userId, string currentPassword, string newPassword);
        Task<MeDto> UpdateProfile(int userId, UpdateProfileDto dto);
        Task<MeDto> SetTwoFactor(int userId, bool enabled);

        // ---- 2FA / TOTP / reset ----
        Task<string> StartEmailChallenge(User user);
        bool VerifyEmailCode(User user, string code);
        string GenerateTotpSecret();
        string GetTotpUri(string secret, string email, string issuer = "Porteo");
        bool VerifyTotpCode(string secret, string code);
        Task SaveTotp(int userId, string secret, bool enabled);
        bool VerifyTotpForUser(User user, string code);
        Task<string> CreateResetToken(User user, int hours = 24);
        Task<User> FindByResetToken(string token);
        Task SetPassword(User user, string newPassword);
        Task<User> CreateConsultantAccount(int consultantId, string prenom, string nom, string email);
    }

    public class TokenResult
    {
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class UserService : GenericService<User>, IUserService
    {
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork uow, IMapper mapper) : base(uow, uow.Users)
        {
            _mapper = mapper;
        }

        public Task<User> FindByEmail(string email) => _uow.Users.FindByEmail(email);

        public async Task<User> Authenticate(string email, string password)
        {
            var user = await _uow.Users.FindByEmail(email);
            if (user == null) return null;
            return PasswordHasher.Verify(password, user.PasswordHash, user.PasswordSalt) ? user : null;
        }

        public TokenResult CreateToken(User user, string secret, int expiryMinutes = 480)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email ?? string.Empty),
                new(ClaimTypes.Name, ((user.Prenom ?? "") + " " + (user.Nom ?? "")).Trim()),
                new(ClaimTypes.Role, user.Role ?? UserRole.User),
                new("ConsultantId", user.ConsultantId?.ToString() ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var expires = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            return new TokenResult
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                ExpiresAt = expires
            };
        }

        public async Task<MeDto> GetMe(int userId)
        {
            var user = await _uow.Users.GetById(userId);
            return user == null ? null : _mapper.Map<MeDto>(user);
        }

        public async Task<bool> ChangePassword(int userId, string currentPassword, string newPassword)
        {
            var user = await _uow.Users.GetById(userId);
            if (user == null) return false;
            if (!PasswordHasher.Verify(currentPassword, user.PasswordHash, user.PasswordSalt))
                throw new ArgumentException("Mot de passe actuel incorrect.");

            PasswordHasher.Create(newPassword, out var hash, out var salt);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
            user.UpdatedAt = DateTime.UtcNow;
            _uow.Users.Update(user);
            return await _uow.CompleteAsync();
        }

        public async Task<MeDto> UpdateProfile(int userId, UpdateProfileDto dto)
        {
            var user = await _uow.Users.GetById(userId);
            if (user == null) return null;

            // Empêche d'usurper l'email d'un autre compte
            var existing = await _uow.Users.FindByEmail(dto.Email);
            if (existing != null && existing.Id != userId)
                throw new ArgumentException("Cet email est déjà utilisé.");

            user.Prenom = dto.Prenom;
            user.Nom = dto.Nom;
            user.Email = dto.Email;
            user.Telephone = dto.Telephone;
            user.Fonction = dto.Fonction;
            user.UpdatedAt = DateTime.UtcNow;
            _uow.Users.Update(user);
            await _uow.CompleteAsync();
            return _mapper.Map<MeDto>(user);
        }

        public async Task<MeDto> SetTwoFactor(int userId, bool enabled)
        {
            var user = await _uow.Users.GetById(userId);
            if (user == null) return null;
            user.IsTwoFactorEnabled = enabled;
            user.UpdatedAt = DateTime.UtcNow;
            _uow.Users.Update(user);
            await _uow.CompleteAsync();
            return _mapper.Map<MeDto>(user);
        }

        // ---- 2FA par email ----
        public async Task<string> StartEmailChallenge(User user)
        {
            var code = new Random().Next(100000, 999999).ToString();
            user.VerificationCode = code;
            user.VerificationCodeExpires = DateTime.UtcNow.AddMinutes(10);
            _uow.Users.Update(user);
            await _uow.CompleteAsync();
            return code;
        }

        public bool VerifyEmailCode(User user, string code)
        {
            if (user.VerificationCodeExpires == null || user.VerificationCodeExpires < DateTime.UtcNow) return false;
            return !string.IsNullOrEmpty(user.VerificationCode) && user.VerificationCode == code?.Trim();
        }

        // ---- 2FA par application (TOTP) ----
        public string GenerateTotpSecret() => Base32Encoding.ToString(KeyGeneration.GenerateRandomKey(20));

        public string GetTotpUri(string secret, string email, string issuer = "Porteo")
        {
            var iss = Uri.EscapeDataString(issuer);
            return $"otpauth://totp/{iss}:{Uri.EscapeDataString(email)}?secret={secret}&issuer={iss}&digits=6&period=30";
        }

        public bool VerifyTotpCode(string secret, string code)
        {
            if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(code)) return false;
            try
            {
                var totp = new Totp(Base32Encoding.ToBytes(secret.Trim()));
                return totp.VerifyTotp(code.Trim(), out _, new VerificationWindow(previous: 2, future: 2));
            }
            catch { return false; }
        }

        public bool VerifyTotpForUser(User user, string code)
            => user.TotpEnabled && VerifyTotpCode(user.TotpSecret, code);

        public async Task SaveTotp(int userId, string secret, bool enabled)
        {
            var user = await _uow.Users.GetById(userId);
            if (user == null) return;
            user.TotpSecret = secret;
            user.TotpEnabled = enabled;
            user.UpdatedAt = DateTime.UtcNow;
            _uow.Users.Update(user);
            await _uow.CompleteAsync();
        }

        // ---- Réinitialisation / activation du mot de passe ----
        public async Task<string> CreateResetToken(User user, int hours = 24)
        {
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
            user.ResetToken = token;
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(hours);
            _uow.Users.Update(user);
            await _uow.CompleteAsync();
            return token;
        }

        public async Task<User> FindByResetToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;
            var users = await _uow.Users.Find(u => u.ResetToken == token);
            var user = users.FirstOrDefault();
            if (user == null || user.ResetTokenExpires == null || user.ResetTokenExpires < DateTime.UtcNow) return null;
            return user;
        }

        public async Task SetPassword(User user, string newPassword)
        {
            PasswordHasher.Create(newPassword, out var hash, out var salt);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
            user.ResetToken = null;
            user.ResetTokenExpires = null;
            user.UpdatedAt = DateTime.UtcNow;
            _uow.Users.Update(user);
            await _uow.CompleteAsync();
        }

        public async Task<User> CreateConsultantAccount(int consultantId, string prenom, string nom, string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            var existing = await _uow.Users.FindByEmail(email);
            if (existing != null) return null; // pas de doublon de compte

            // Mot de passe aléatoire temporaire (l'utilisateur le définira via le lien email).
            PasswordHasher.Create(Guid.NewGuid().ToString("N"), out var hash, out var salt);
            var user = new User
            {
                Email = email, Prenom = prenom, Nom = nom, Role = UserRole.User,
                ConsultantId = consultantId, PasswordHash = hash, PasswordSalt = salt, CreatedAt = DateTime.UtcNow,
            };
            _uow.Users.Add(user);
            await _uow.CompleteAsync();
            return user;
        }
    }
}
