import { Injectable, signal, effect } from '@angular/core';
import { HabitSignal } from './habit.signal';
import { LogSignal } from './log.signal';
import { Statistic } from '../models/statistic.model';
import { Log } from '../models/log.model';
import { Habit } from '../models/habit.model';
import { currentTime } from './time.signal';

@Injectable({
    providedIn: 'root'
})
export class StatisticSignal {
    // Signal que mantiene las estadísticas calculadas para cada hábito
    statistics = signal<Statistic[]>([]);

    constructor(
        private habitSignal: HabitSignal,
        private logSignal: LogSignal
    ) {
        // Crear un efecto para recalcular estadísticas cada vez que los logs cambien
        effect(() => {
            // Se accede a los logs para que el efecto se reactive
            this.logSignal.logs();
            this.computeStatistics();
        });
    }

    /**
     * Calcula las estadísticas para cada hábito usando los logs asociados.
     */
    private computeStatistics() {
        const stats: Statistic[] = [];
        const habits = this.habitSignal.habits();
        const logs = this.logSignal.logs();

        habits.forEach((habit: Habit) => {
            // Filtrar logs para el hábito actual y ordenarlos de forma ascendente
            const habitLogs = logs
                .filter(log => log.habitId === habit.id)
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

            // Cálculo de racha y porcentaje de cumplimiento
            const { rachaActual, rachaMaxima } = this.calculateStreaks(habitLogs, habit);
            const totalLogs = habitLogs.length;
            const completedLogs = habitLogs.filter(log => this.isCompleted(log, habit)).length;
            const porcentajeCumplimiento = totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0;

            stats.push({
                habitId: habit.id!,
                rachaActual,
                rachaMaxima,
                porcentajeCumplimiento
            });
        });

        this.statistics.set(stats);
    }

    /**
     * Función helper para determinar si un log cumple el objetivo del hábito.
     * Para hábitos "bueno": se requiere que cantidadRealizada >= objetivo.
     * Para hábitos "malo": se requiere que cantidadRealizada <= objetivo.
     * Si no se registra cantidad, se puede basar en el estado "completado".
     */
    private isCompleted(log: Log, habit: Habit): boolean {
        if (log.estado !== 'completado') return false;
        if (log.cantidadRealizada !== undefined) {
            if (habit.tipo === 'bueno') {
                return log.cantidadRealizada >= habit.objetivo;
            } else if (habit.tipo === 'malo') {
                return log.cantidadRealizada <= habit.objetivo;
            }
        }
        return true;
    }

    /**
     * Calcula la racha actual y la máxima a partir de los logs de un hábito, 
     * diferenciando la lógica según la frecuencia del hábito.
     */
    private calculateStreaks(logs: Log[], habit: Habit): { rachaActual: number, rachaMaxima: number } {
        switch (habit.frecuencia) {
            case 'diario':
                return this.calculateDailyStreaks(logs, habit);
            case 'semanal':
                return this.calculatePeriodStreaks(logs, habit, 'semanal');
            case 'mensual':
                return this.calculatePeriodStreaks(logs, habit, 'mensual');
            case 'ocasional':
            default:
                return { rachaActual: 0, rachaMaxima: 0 };
        }
    }

    /**
     * Cálculo de rachas para hábitos diarios.
     * Se filtran los logs según los días de la semana (si habit.diasSemana está definido)
     * y se evalúa la continuidad de días donde el log cumple el objetivo.
     */
    private calculateDailyStreaks(logs: Log[], habit: Habit): { rachaActual: number, rachaMaxima: number } {
        let filteredLogs = logs;
        if (habit.diasSemana && habit.diasSemana.length > 0) {
            filteredLogs = logs.filter(log => {
                const dayName = new Date(log.fecha).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
                return habit.diasSemana!.map(d => d.toLowerCase()).includes(dayName);
            });
        }

        let rachaMaxima = 0;
        let currentStreak = 0;
        let prevDate: Date | null = null;
        filteredLogs.forEach(log => {
            if (!this.isCompleted(log, habit)) {
                currentStreak = 0;
                prevDate = null;
                return;
            }
            const currentDate = new Date(log.fecha);
            if (prevDate) {
                const diffDays = this.diffInDays(prevDate, currentDate);
                if (diffDays === 1) {
                    currentStreak++;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            prevDate = currentDate;
            if (currentStreak > rachaMaxima) {
                rachaMaxima = currentStreak;
            }
        });

        let actualStreak = 0;
        const descendingLogs = [...filteredLogs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const today = currentTime();
        let expectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        for (const log of descendingLogs) {
            if (!this.isCompleted(log, habit)) {
                continue;
            }
            const logDate = new Date(log.fecha);
            const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            if (this.isSameDate(logDay, expectedDate)) {
                actualStreak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else if (logDay < expectedDate) {
                break;
            }
        }
        return { rachaActual: actualStreak, rachaMaxima };
    }

    /**
     * Cálculo de rachas para períodos semanales o mensuales.
     */
    private calculatePeriodStreaks(logs: Log[], habit: Habit, period: 'semanal' | 'mensual'): { rachaActual: number, rachaMaxima: number } {
        const groups = new Map<string, Log[]>();
        logs.forEach(log => {
            const date = new Date(log.fecha);
            let key: string;
            if (period === 'semanal') {
                key = this.getWeekKey(date);
            } else {
                key = this.getMonthKey(date);
            }
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(log);
        });

        const periodKeys = Array.from(groups.keys()).sort();
        const successPeriods = periodKeys.map(key => {
            const logsInPeriod = groups.get(key)!;
            const total = logsInPeriod.reduce((acc, log) => {
                return acc + (this.isCompleted(log, habit) ? (log.cantidadRealizada || 1) : 0);
            }, 0);
            return { key, success: total >= habit.objetivo };
        });

        let rachaMaxima = 0;
        let currentStreak = 0;
        let rachaActual = 0;
        successPeriods.forEach(item => {
            if (item.success) {
                currentStreak++;
                if (currentStreak > rachaMaxima) {
                    rachaMaxima = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        });
        for (let i = successPeriods.length - 1; i >= 0; i--) {
            if (successPeriods[i].success) {
                rachaActual++;
            } else {
                break;
            }
        }
        return { rachaActual, rachaMaxima };
    }

    private getWeekKey(date: Date): string {
        const year = date.getFullYear();
        const firstJan = new Date(year, 0, 1);
        const diff = this.diffInDays(firstJan, date);
        const week = Math.ceil((diff + firstJan.getDay() + 1) / 7);
        return `${year}-W${week}`;
    }

    private getMonthKey(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${year}-${month < 10 ? '0' + month : month}`;
    }

    private diffInDays(date1: Date, date2: Date): number {
        const diffTime = date2.getTime() - date1.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    private isSameDate(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}
