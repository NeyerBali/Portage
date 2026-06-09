using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Porteo.Models.Users;
using Porteo.Repositories.Common;
using Porteo.Repositories.Context;

namespace Porteo.Repositories.Users
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> FindByEmail(string email);
    }

    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(PorteoDbContext context, ILogger logger) : base(context, logger) { }

        public async Task<User> FindByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            var normalized = email.Trim().ToLower();
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
        }
    }
}
