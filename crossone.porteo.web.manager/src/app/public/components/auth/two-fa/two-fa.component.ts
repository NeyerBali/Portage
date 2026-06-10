import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-two-fa',
  standalone: false,
  templateUrl: './two-fa.component.html',
  styleUrls: ['../login/login.component.scss'],
})
export class TwoFaComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;
  code = ['', '', '', '', '', ''];
  err = '';
  loading = false;
  sending = false;
  emailSent = false;
  countdown = 0;
  private timerId?: any;

  email = '';
  fullName = '';
  hasTotp = false;
  method: 'email' | 'totp' = 'email';
  private returnUrl = '/';

  constructor(private router: Router, private auth: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    const st: any = history.state || {};
    this.email = st.email;
    this.fullName = st.fullName;
    this.hasTotp = !!st.hasTotp;
    this.returnUrl = st.returnUrl || '/';
    if (!this.email) { this.router.navigate(['/auth/login']); return; }
    this.method = this.hasTotp ? 'totp' : 'email';
    if (this.method === 'email') this.sendEmail();
  }
  ngOnDestroy(): void { if (this.timerId) clearInterval(this.timerId); }

  switch(m: 'email' | 'totp'): void {
    this.method = m; this.err = ''; this.code = ['', '', '', '', '', ''];
    if (m === 'email' && !this.emailSent) this.sendEmail();
  }

  sendEmail(): void {
    this.sending = true;
    this.auth.sendVerification(this.email).subscribe({
      next: () => { this.sending = false; this.emailSent = true; this.startCountdown(); this.toastr.info(`Code envoyé à ${this.email}.`, 'Vérification'); },
      error: () => { this.sending = false; this.toastr.error("Impossible d'envoyer l'email.", 'Erreur'); },
    });
  }

  private startCountdown(): void {
    this.countdown = 45;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => { if (this.countdown > 0) this.countdown--; }, 1000);
  }
  get countdownLabel(): string { const m = Math.floor(this.countdown / 60); const s = (this.countdown % 60).toString().padStart(2, '0'); return `${m}:${s}`; }

  private focusBox(i: number): void { this.inputs.get(i)?.nativeElement.focus(); }

  /** Saisie clavier : on gère tout ici avec preventDefault → le navigateur n'insère
   *  jamais le caractère lui-même (évite la duplication d'un chiffre dans 2 cases). */
  onKey(i: number, e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey) return; // laisser passer copier/coller
    const k = e.key;
    if (k === 'Backspace') {
      e.preventDefault();
      if (this.code[i]) { this.code[i] = ''; }
      else if (i > 0) { this.code[i - 1] = ''; this.focusBox(i - 1); }
      return;
    }
    if (k === 'Delete') { e.preventDefault(); this.code[i] = ''; return; }
    if (k === 'ArrowLeft') { e.preventDefault(); if (i > 0) this.focusBox(i - 1); return; }
    if (k === 'ArrowRight') { e.preventDefault(); if (i < 5) this.focusBox(i + 1); return; }
    if (k === 'Tab' || k === 'Enter') return;
    if (/^\d$/.test(k)) {
      e.preventDefault();
      this.code[i] = k; this.err = '';
      if (i < 5) this.focusBox(i + 1);
      return;
    }
    if (k.length === 1) e.preventDefault(); // bloque les lettres / autres caractères
  }

  /** Repli pour l'auto-remplissage (code reçu par email) ou les claviers virtuels. */
  onInput(i: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');
    if (digits.length > 1) {
      for (let j = 0; j < 6; j++) this.code[j] = digits[j] || '';
      input.value = this.code[i];
      this.focusBox(Math.min(digits.length, 5));
    } else if (digits.length === 1) {
      this.code[i] = digits;
      if (i < 5) this.focusBox(i + 1);
    } else if (input.value !== this.code[i]) {
      this.code[i] = '';
    }
    this.err = '';
  }

  onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    for (let j = 0; j < 6; j++) this.code[j] = text[j] || '';
    this.err = '';
    this.focusBox(Math.min(text.length, 5));
  }

  verify(): void {
    const code = this.code.join('');
    if (code.length < 6) { this.err = 'Saisissez les 6 chiffres du code.'; return; }
    this.loading = true;
    const obs = this.method === 'totp' ? this.auth.verifyTotp(this.email, code) : this.auth.verifyCode(this.email, code);
    obs.subscribe({
      next: res => { this.loading = false; this.toastr.success(`Bienvenue ${res.fullName} !`, 'Connecté'); this.router.navigateByUrl(this.returnUrl); },
      error: () => { this.loading = false; this.err = 'Code invalide ou expiré.'; this.code = ['', '', '', '', '', '']; },
    });
  }
}
