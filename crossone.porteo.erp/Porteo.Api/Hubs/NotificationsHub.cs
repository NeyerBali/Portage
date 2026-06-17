using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Porteo.Api.Hubs
{
    /// <summary>Hub temps réel : pousse les notifications (activités) aux clients connectés.</summary>
    [Authorize]
    public class NotificationsHub : Hub
    {
    }
}
