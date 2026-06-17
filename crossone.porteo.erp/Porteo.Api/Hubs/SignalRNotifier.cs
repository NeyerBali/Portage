using Microsoft.AspNetCore.SignalR;
using Porteo.Services.Realtime;

namespace Porteo.Api.Hubs
{
    /// <summary>Implémentation SignalR de <see cref="IRealtimeNotifier"/> : diffuse l'événement « notification ».</summary>
    public sealed class SignalRNotifier : IRealtimeNotifier
    {
        private readonly IHubContext<NotificationsHub> _hub;
        public SignalRNotifier(IHubContext<NotificationsHub> hub) => _hub = hub;

        public Task Notify(string type, string titre, string description, int? consultantId = null)
            => _hub.Clients.All.SendAsync("notification", type, titre, description, DateTime.UtcNow.ToString("o"));
    }
}
