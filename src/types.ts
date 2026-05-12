export interface Link {
  id: string;
  url: string;
  title: string;
  categoryId: string;
  icon?: string;
  lastUsed?: number;
  metadata?: {
    description?: string;
    image?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export interface Workspace {
  id: string;
  name: string;
  linkIds: string[];
}

export interface AppSettings {
  id: string;
  theme: 'dark' | 'light';
  hotkey: string; // e.g. "alt+l"
  prefetchEnabled: boolean;
}
