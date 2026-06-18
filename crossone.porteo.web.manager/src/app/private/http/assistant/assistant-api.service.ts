import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({ providedIn: 'root' })
export class AssistantApiService {
  private base = `${environment.apiUrl}assistant`;
  constructor(private http: HttpClient, private token: TokenService) {}

  /** Réponse complète (repli si le streaming échoue). */
  ask(question: string): Observable<{ answer: string }> {
    return this.http.post<{ answer: string }>(`${this.base}/ask`, { question });
  }

  /** Réponse en FLUX : émet la réponse token par token (mot-à-mot). */
  askStream(question: string): Observable<string> {
    return new Observable<string>(sub => {
      const ctrl = new AbortController();
      fetch(`${this.base}/ask-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token.getToken() ?? ''}` },
        body: JSON.stringify({ question }),
        signal: ctrl.signal,
      }).then(async res => {
        if (!res.ok || !res.body) { sub.error(new Error('stream-unavailable')); return; }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          sub.next(decoder.decode(value, { stream: true }));
        }
        sub.complete();
      }).catch(err => sub.error(err));
      return () => ctrl.abort();
    });
  }

  /** Résumé IA d'une mission. */
  missionSummary(id: number): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.base}/mission-summary/${id}`, {});
  }
}
