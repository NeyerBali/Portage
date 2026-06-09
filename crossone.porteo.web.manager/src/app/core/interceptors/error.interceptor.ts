import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';

/** Gestion centralisée des erreurs HTTP : 401 -> déconnexion, toast d'erreur sinon. */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private toastr: ToastrService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.toastr.warning('Session expirée, veuillez vous reconnecter.', 'Authentification');
          this.auth.logout();
        } else if (error.status === 403) {
          this.toastr.error('Accès refusé à cette ressource.', 'Autorisation');
        } else if (error.status === 0) {
          this.toastr.error('Impossible de joindre le serveur.', 'Réseau');
        } else if (!req.url.endsWith('auth/login')) {
          const msg = error.error?.message || error.error?.title || 'Une erreur est survenue.';
          this.toastr.error(msg, 'Erreur');
        }
        return throwError(() => error);
      })
    );
  }
}
