import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  countdown = 42;
  private timerId?: any;

  constructor(private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.timerId = setInterval(() => { if (this.countdown > 0) this.countdown--; }, 1000);
  }
  ngOnDestroy(): void { if (this.timerId) clearInterval(this.timerId); }

  get countdownLabel(): string {
    const m = Math.floor(this.countdown / 60);
    const s = (this.countdown % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  set(i: number, value: string): void {
    if (!/^\d?$/.test(value)) { this.code[i] = ''; return; }
    this.code[i] = value;
    this.err = '';
    if (value && i < 5) this.inputs.get(i + 1)?.nativeElement.focus();
  }

  onKey(i: number, e: KeyboardEvent): void {
    if (e.key === 'Backspace' && !this.code[i] && i > 0) this.inputs.get(i - 1)?.nativeElement.focus();
  }

  verify(): void {
    if (this.code.join('').length < 6) { this.err = 'Saisissez les 6 chiffres du code.'; return; }
    this.toastr.success('Connexion vérifiée.', 'Bienvenue sur Portéo');
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl);
  }

  resend(): void { this.countdown = 42; this.toastr.info('Un nouveau code a été envoyé (démonstration).', '2FA'); }
}
