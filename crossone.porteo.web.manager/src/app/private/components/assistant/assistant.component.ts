import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../http/api.service';

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

@Component({
  selector: 'app-assistant',
  standalone: false,
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss'],
})
export class AssistantComponent implements AfterViewChecked {
  messages: ChatMessage[] = [];
  input = '';
  loading = false;
  streaming = false;
  @ViewChild('scroll') scroll?: ElementRef<HTMLElement>;
  private shouldScroll = false;

  readonly suggestions = [
    'Quelles sont mes factures impayées les plus en retard ?',
    'Rédige un e-mail de relance pour la facture la plus en retard.',
    'Quelles missions se terminent dans les 30 jours ?',
    'Fais-moi une synthèse de mon activité et des points à surveiller.',
  ];

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scroll) {
      this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ask(text?: string): void {
    const q = (text ?? this.input).trim();
    if (!q || this.loading) return;
    this.messages.push({ role: 'user', text: q });
    this.input = '';
    this.loading = true; this.streaming = true; this.shouldScroll = true;

    const bot: ChatMessage = { role: 'assistant', text: '' };
    this.messages.push(bot);
    let received = false;

    this.api.assistant.askStream(q).subscribe({
      next: chunk => { received = true; bot.text += chunk; this.shouldScroll = true; },
      error: () => {
        if (received) { this.finish(); return; }
        // Repli : réponse complète (non-streaming) si le flux est bloqué.
        this.api.assistant.ask(q).subscribe({
          next: r => { bot.text = r.answer; this.finish(); },
          error: () => { bot.text = "⚠️ L'assistant est momentanément indisponible. Réessayez dans un instant."; this.finish(); },
        });
      },
      complete: () => this.finish(),
    });
  }

  private finish(): void { this.loading = false; this.streaming = false; this.shouldScroll = true; }

  copy(text: string): void {
    navigator.clipboard?.writeText(text).then(
      () => this.toastr.success('Réponse copiée.', 'Presse-papiers'),
      () => this.toastr.warning('Copie impossible.', 'Presse-papiers'),
    );
  }

  clear(): void { this.messages = []; }
}
