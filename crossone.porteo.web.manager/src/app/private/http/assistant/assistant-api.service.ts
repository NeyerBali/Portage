import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AssistantApiService {
  private base = `${environment.apiUrl}assistant`;
  constructor(private http: HttpClient) {}

  /** Pose une question à l'assistant IA (contexte = données réelles de l'agence). */
  ask(question: string): Observable<{ answer: string }> {
    return this.http.post<{ answer: string }>(`${this.base}/ask`, { question });
  }
}
