export interface Activity {
  id: number;
  type: string;
  titre: string;
  description: string;
  userName?: string;
  createdAt: string;
}

export interface SearchResult {
  type: 'mission' | 'client' | 'consultant' | 'facture';
  id: number;
  titre: string;
  sousTitre?: string;
  route: string;
}
