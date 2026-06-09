import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'porteo-token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded?.exp) return true;
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
