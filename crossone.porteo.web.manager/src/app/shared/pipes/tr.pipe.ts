import { Pipe, PipeTransform } from '@angular/core';
import { LangService } from 'src/app/core/services/lang.service';

/** Pipe de traduction : `{{ 'Missions' | tr }}`. Impur → réagit au changement de langue. */
@Pipe({ name: 'tr', standalone: false, pure: false })
export class TrPipe implements PipeTransform {
  constructor(private lang: LangService) {}
  transform(key: string): string { return this.lang.t(key); }
}
