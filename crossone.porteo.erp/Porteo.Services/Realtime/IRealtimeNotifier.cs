namespace Porteo.Services.Realtime
{
    /// <summary>
    /// Diffusion de notifications temps réel (implémentée par SignalR côté API).
    /// Abstraction : la couche Services n'a pas de dépendance à SignalR.
    /// </summary>
    public interface IRealtimeNotifier
    {
        Task Notify(string type, string titre, string description, int? consultantId = null);
    }

    /// <summary>Implémentation par défaut (no-op) — utilisée si aucune n'est enregistrée.</summary>
    public sealed class NullRealtimeNotifier : IRealtimeNotifier
    {
        public Task Notify(string type, string titre, string description, int? consultantId = null) => Task.CompletedTask;
    }
}
