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
    }
}
