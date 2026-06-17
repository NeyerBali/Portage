import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';

export interface RealtimeNotification { type: string; titre: string; description: string; when: string; }

/** Connexion SignalR temps réel : pousse les notifications (activités) aux clients. */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private hub?: HubConnection;
  private readonly _notifications = new Subject<RealtimeNotification>();
  readonly notifications$ = this._notifications.asObservable();

  constructor(private token: TokenService) {}

  connect(): void {
    if (this.hub && this.hub.state !== HubConnectionState.Disconnected) return;
    const hubUrl = environment.apiUrl.replace(/api\/?$/, '') + 'hub';
    this.hub = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => this.token.getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hub.on('notification', (type: string, titre: string, description: string, when: string) => {
      this._notifications.next({ type, titre, description, when });
    });

    this.hub.start().catch(() => { /* hub indisponible : silencieux */ });
  }

  disconnect(): void {
    this.hub?.stop().catch(() => {});
    this.hub = undefined;
  }
}
