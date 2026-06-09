using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
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
    }
}
