import { Injectable, signal, computed } from '@angular/core';
import { DbService } from '../services/db.service';
import { Log } from '../models/log.model';

@Injectable({
    providedIn: 'root'
})
export class LogSignal {
    private db = new DbService();
    private _logs = signal<Log[]>([]);

    // Signal computed para exponer los logs de forma reactiva
    public logs = computed(() => this._logs());

    constructor(db: DbService) {
        this.db = db;
        this.init();
    }

    async init() {
        await this.db.waitForDBReady();
        await this.loadLogs();
    }

    async loadLogs() {
        const data = await this.db.listAll<Log>('registros');
        this._logs.set(data);
    }

    async addLog(log: Log) {
        await this.db.add<Log>('registros', log);
        await this.loadLogs(); // Actualiza la lista en memoria
    }

    async updateLog(log: Log) {
        if (!log.id) return;
        await this.db.update<Log>('registros', log);
        this._logs.set(this._logs().map(l => (l.id === log.id ? log : l)));
    }

    async deleteLog(id: number) {
        await this.db.delete('registros', id);
        this._logs.set(this._logs().filter(l => l.id !== id));
    }

    async getLogsByHabit(habitId: number): Promise<Log[]> {
        await this.loadLogs();
        return this._logs().filter(log => log.habitId === habitId);
    }

    async getPaginatedLogs(page: number = 1, limit: number = 10): Promise<Log[]> {
        await this.loadLogs();
        const start = (page - 1) * limit;
        return this._logs().slice(start, start + limit);
    }
}
