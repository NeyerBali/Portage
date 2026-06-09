import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResult, LoginRequest, Me, Role } from 'src/app/shared/models';
import { TokenService } from '../services/token.service';

const USER_KEY = 'porteo-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthResult | null>(this.readUser());
  user$ = this._user$.asObservable();

  constructor(private http: HttpClient, private token: TokenService, private router: Router) {}

  get currentUser(): AuthResult | null { return this._user$.value; }
  get role(): Role | null { return this._user$.value?.role ?? null; }
  get isAdmin(): boolean { return this.role === 'Admin'; }
  get consultantId(): number | null { return this._user$.value?.consultantId ?? null; }
  get fullName(): string { return this._user$.value?.fullName ?? ''; }

  isLoggedIn(): boolean {
    return this.token.isValid() && !!this._user$.value;
  }

  login(payload: LoginRequest): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${environment.apiUrl}auth/login`, payload).pipe(
      tap(res => {
        this.token.setToken(res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res));
        localStorage.setItem('porteo-authed', 'true');
        localStorage.setItem('porteo-role', res.role);
        this._user$.next(res);
      })
    );
  }

  me(): Observable<Me> {
    return this.http.get<Me>(`${environment.apiUrl}auth/me`);
  }

  logout(redirect = true): void {
    this.token.clear();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('porteo-authed');
    localStorage.removeItem('porteo-role');
    this._user$.next(null);
    if (redirect) this.router.navigate(['/auth/login']);
  }

  private readUser(): AuthResult | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthResult) : null;
    } catch {
      return null;
    }
  }
}
