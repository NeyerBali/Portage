export interface AlertItem {
  titre: string;
  sousTitre?: string;
  meta?: string;
  route?: string;
}

export interface AlertCategory {
  cle: string;
  titre: string;
  hint?: string;
  tone: 'danger' | 'warn' | 'info' | 'neutral';
  icon: string;
  count: number;
  items: AlertItem[];
}
