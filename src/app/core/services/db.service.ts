import { Injectable, signal } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private db: IDBPDatabase | null = null;
  dbReady = signal(false); // Signal para indicar si la DB está lista

  constructor() {
    this.initDB();
  }

  async initDB() {
    try {
      this.db = await openDB('HabitDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('habitos')) {
            db.createObjectStore('habitos', { keyPath: 'id', autoIncrement: true });
          }
          if (!db.objectStoreNames.contains('registros')) {
            db.createObjectStore('registros', { keyPath: 'id', autoIncrement: true });
          }
          if (!db.objectStoreNames.contains('categorias')) {
            db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
          }
          if (!db.objectStoreNames.contains('estadisticas')) {
            db.createObjectStore('estadisticas', { keyPath: 'habitId' });
          }
          if (!db.objectStoreNames.contains('recordatorios')) {
            db.createObjectStore('recordatorios', { keyPath: 'id', autoIncrement: true });
          }
        }
      });
      this.dbReady.set(true);
    } catch (error) {
      console.error('Error al inicializar IndexedDB', error);
    }
  }

  private async ensureDBReady() {
    while (!this.dbReady()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async add<T>(storeName: string, data: T): Promise<void> {
    await this.ensureDBReady();
    if (!this.db) return;
    await this.db.add(storeName, data);
  }

  async get<T>(storeName: string, id: number | string): Promise<T | undefined> {
    await this.ensureDBReady();
    return this.db ? this.db.get(storeName, id) : undefined;
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    await this.ensureDBReady();
    if (!this.db) return;
    await this.db.put(storeName, data);
  }

  async delete(storeName: string, id: number | string): Promise<void> {
    await this.ensureDBReady();
    if (!this.db) return;
    await this.db.delete(storeName, id);
  }

  async listAll<T>(storeName: string): Promise<T[]> {
    await this.ensureDBReady();
    return this.db ? this.db.getAll(storeName) : [];
  }
}
