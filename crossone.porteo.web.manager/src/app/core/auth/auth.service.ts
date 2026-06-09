import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResult, ChangePasswordRequest, LoginRequest, Me, Role, TotpSetupResult, TwoFactorChallenge, UpdateProfileRequest } from 'src/app/shared/models';
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

  /** Étape 1 : identifiants → renvoie un défi 2FA (pas encore de jeton). */
  login(payload: LoginRequest): Observable<TwoFactorChallenge> {
    return this.http.post<TwoFactorChallenge>(`${environment.apiUrl}auth/login`, payload);
  }

  /** Méthode email : envoie le code de vérification. */
  sendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}auth/send-verification`, { email });
  }

  /** Étape 2 (email) : vérifie le code et ouvre la session. */
  verifyCode(email: string, code: string): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${environment.apiUrl}auth/verify`, { email, code }).pipe(tap(r => this.store(r)));
  }

  /** Étape 2 (authentificateur) : vérifie le code TOTP et ouvre la session. */
  verifyTotp(email: string, code: string): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${environment.apiUrl}auth/verify-totp`, { email, code }).pipe(tap(r => this.store(r)));
  }

  // ---- Authentificateur (réglages) ----
  setupTotp(): Observable<TotpSetupResult> { return this.http.get<TotpSetupResult>(`${environment.apiUrl}auth/setup-totp`); }
  confirmTotp(code: string): Observable<{ message: string }> { return this.http.post<{ message: string }>(`${environment.apiUrl}auth/confirm-totp`, { code }); }
  disableTotp(): Observable<{ message: string }> { return this.http.post<{ message: string }>(`${environment.apiUrl}auth/disable-totp`, {}); }

  // ---- Mot de passe oublié / reset ----
  forgotPassword(email: string): Observable<{ message: string }> { return this.http.post<{ message: string }>(`${environment.apiUrl}auth/forgot-password`, { email }); }
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> { return this.http.post<{ message: string }>(`${environment.apiUrl}auth/reset-password`, { token, newPassword }); }

  private store(res: AuthResult): void {
    this.token.setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    localStorage.setItem('porteo-authed', 'true');
    localStorage.setItem('porteo-role', res.role);
    this._user$.next(res);
  }

  me(): Observable<Me> {
    return this.http.get<Me>(`${environment.apiUrl}auth/me`);
  }

  updateProfile(dto: UpdateProfileRequest): Observable<Me> {
    return this.http.post<Me>(`${environment.apiUrl}auth/profile`, dto).pipe(
      tap(me => this.patchStoredUser(me))
    );
  }

  changePassword(dto: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}auth/change-password`, dto);
  }

  setTwoFactor(enabled: boolean): Observable<Me> {
    return this.http.post<Me>(`${environment.apiUrl}auth/two-factor`, { enabled });
  }

  /** Met à jour le nom/email affichés (sidebar, topbar) après édition du profil. */
  private patchStoredUser(me: Me): void {
    const current = this._user$.value;
    if (!current) return;
    const updated: AuthResult = { ...current, fullName: me.fullName, email: me.email };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this._user$.next(updated);
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
