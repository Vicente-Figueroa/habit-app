// src/app/core/signals/log.signal.ts
import { Injectable, signal, computed } from '@angular/core';
import { DbService } from '../services/db.service';
import { Log } from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogSignal {
  private db: DbService;
  private _logs = signal<Log[]>([]);

  public logs = computed(() => this._logs());

  constructor(db: DbService) {
    this.db = db;
    this.init();
  }

  private async init() {
    await this.db.waitForDBReady();
    const data = await this.db.listAll<Log>('registros');
    this._logs.set(data);
  }

  private updateInMemory(log: Log) {
    const current = this._logs();
    const index = current.findIndex(l => l.id === log.id);
    if (index !== -1) {
      current[index] = log;
      this._logs.set([...current]);
    }
  }

  async addLog(log: Log) {
    await this.db.add<Log>('registros', log);
    this._logs.set([...this._logs(), log]);
  }

  async updateLog(log: Log) {
    if (!log.id) return;
    await this.db.update<Log>('registros', log);
    this.updateInMemory(log);
  }

  async deleteLog(id: number) {
    await this.db.delete('registros', id);
    this._logs.set(this._logs().filter(l => l.id !== id));
  }

  getLogsByHabit(habitId: number): Log[] {
    return this._logs().filter(log => log.habitId === habitId);
  }

  getLogsByDate(date: Date): Log[] {
    return this._logs().filter(log => this.isSameDay(log.fecha, date));
  }

  getLogsInRange(start: Date, end: Date): Log[] {
    return this._logs().filter(log => {
      const d = new Date(log.fecha);
      return d >= start && d <= end;
    });
  }

  getPaginatedLogs(page: number = 1, limit: number = 10): Log[] {
    const allLogs = this._logs();
    const start = (page - 1) * limit;
    return allLogs.slice(start, start + limit);
  }

  private isSameDay(dateStr: string, ref: Date): boolean {
    const d = new Date(dateStr);
    return d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth() &&
      d.getDate() === ref.getDate();
  }
  async loadLogs() {
    const data = await this.db.listAll<Log>('registros');
    this._logs.set(data);
}
}
