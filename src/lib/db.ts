import { openDB, IDBPDatabase } from 'idb';
import { Link, Category, Workspace, AppSettings } from '../types';

const DB_NAME = 'dna6_db';
const VERSION = 1;

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('links')) {
        const linkStore = db.createObjectStore('links', { keyPath: 'id' });
        linkStore.createIndex('categoryId', 'categoryId');
        linkStore.createIndex('lastUsed', 'lastUsed');
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('workspaces')) {
        db.createObjectStore('workspaces', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });
}

export class DBStore {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = initDB();
  }

  // Links
  async getAllLinks(): Promise<Link[]> {
    return (await this.dbPromise).getAll('links');
  }

  async putLink(link: Link): Promise<string> {
    await (await this.dbPromise).put('links', link);
    return link.id;
  }

  async deleteLink(id: string): Promise<void> {
    await (await this.dbPromise).delete('links', id);
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    const categories = await (await this.dbPromise).getAll('categories');
    return categories.length > 0 ? categories : this.seedCategories();
  }

  private async seedCategories(): Promise<Category[]> {
    const defaults: Category[] = [
      { id: 'default', name: 'Personal', order: 0 },
      { id: 'work', name: 'Work', order: 1 },
      { id: 'dev', name: 'Development', order: 2 },
    ];
    for (const cat of defaults) {
      await (await this.dbPromise).put('categories', cat);
    }
    return defaults;
  }

  async putCategory(cat: Category): Promise<string> {
    await (await this.dbPromise).put('categories', cat);
    return cat.id;
  }

  // Workspaces
  async getAllWorkspaces(): Promise<Workspace[]> {
    return (await this.dbPromise).getAll('workspaces');
  }

  async putWorkspace(ws: Workspace): Promise<string> {
    await (await this.dbPromise).put('workspaces', ws);
    return ws.id;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await (await this.dbPromise).delete('workspaces', id);
  }

  async deleteCategory(id: string): Promise<void> {
    await (await this.dbPromise).delete('categories', id);
  }
}

export const dbStore = new DBStore();
