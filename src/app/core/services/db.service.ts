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

  async waitForDBReady() {
    while (!this.dbReady()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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

  async exportData(): Promise<string> {
    await this.ensureDBReady();
    if (!this.db) {
      throw new Error('Base de datos no disponible');
    }

    // Obtenemos todos los registros de cada store
    const habitos = await this.db.getAll('habitos');
    const registros = await this.db.getAll('registros');
    const categorias = await this.db.getAll('categorias');
    const estadisticas = await this.db.getAll('estadisticas');
    const recordatorios = await this.db.getAll('recordatorios');

    // Armamos un objeto con toda la información
    const dataExport = {
      habitos,
      registros,
      categorias,
      estadisticas,
      recordatorios
    };

    // Retornamos el string en formato JSON
    return JSON.stringify(dataExport, null, 2);
  }

  /**
   * Importa (carga) datos desde un string JSON a IndexedDB.
   * En este ejemplo se asume que se van a SOBRESCRIBIR (borrar)
   * los datos previos en cada store correspondiente.
   */
  async importData(jsonString: string): Promise<void> {
    await this.ensureDBReady();
    if (!this.db) {
      throw new Error('Base de datos no disponible');
    }

    let dataImport;
    try {
      dataImport = JSON.parse(jsonString);
    } catch (error) {
      throw new Error('El JSON proporcionado es inválido');
    }

    const tx = this.db.transaction(
      ['habitos', 'registros', 'categorias', 'estadisticas', 'recordatorios'],
      'readwrite'
    );

    // 1. Limpiamos cada store para sobrescribir
    await Promise.all([
      tx.objectStore('habitos').clear(),
      tx.objectStore('registros').clear(),
      tx.objectStore('categorias').clear(),
      tx.objectStore('estadisticas').clear(),
      tx.objectStore('recordatorios').clear(),
    ]);

    // 2. Insertamos los datos de cada arreglo
    if (dataImport.habitos && Array.isArray(dataImport.habitos)) {
      for (const habito of dataImport.habitos) {
        await tx.objectStore('habitos').add(habito);
      }
    }

    if (dataImport.registros && Array.isArray(dataImport.registros)) {
      for (const registro of dataImport.registros) {
        await tx.objectStore('registros').add(registro);
      }
    }

    if (dataImport.categorias && Array.isArray(dataImport.categorias)) {
      for (const categoria of dataImport.categorias) {
        await tx.objectStore('categorias').add(categoria);
      }
    }

    if (dataImport.estadisticas && Array.isArray(dataImport.estadisticas)) {
      for (const estadistica of dataImport.estadisticas) {
        await tx.objectStore('estadisticas').add(estadistica);
      }
    }

    if (dataImport.recordatorios && Array.isArray(dataImport.recordatorios)) {
      for (const recordatorio of dataImport.recordatorios) {
        await tx.objectStore('recordatorios').add(recordatorio);
      }
    }

    await tx.done;
  }
}
