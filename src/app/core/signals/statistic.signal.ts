import { Injectable, signal } from '@angular/core';
import { HabitSignal } from './habit.signal';
import { LogSignal } from './log.signal';
import { Statistic } from '../models/statistic.model';
import { Log } from '../models/log.model';

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
        // Inicialmente, se calculan las estadísticas
        this.computeStatistics();
    }

    /**
     * Calcula las estadísticas para cada hábito usando los logs asociados.
     */
    private computeStatistics() {
        const stats: Statistic[] = [];
        const habits = this.habitSignal.habits();
        const logs = this.logSignal.logs();

        habits.forEach(habit => {
            // Filtrar logs para el hábito actual y ordenarlos de forma ascendente
            const habitLogs = logs
                .filter(log => log.habitId === habit.id)
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

            // Cálculo de racha y porcentaje de cumplimiento
            const { rachaActual, rachaMaxima } = this.calculateStreaks(habitLogs);
            const totalLogs = habitLogs.length;
            const completedLogs = habitLogs.filter(log => log.estado === 'completado').length;
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
     * Calcula la racha actual y la máxima a partir de los logs de un hábito.
     * Se asume que se considera sólo los logs con estado "completado".
     */
    private calculateStreaks(logs: Log[]): { rachaActual: number, rachaMaxima: number } {
        let rachaMaxima = 0;
        let currentStreak = 0;
        let prevDate: Date | null = null;

        // Para la racha máxima recorremos los logs en orden ascendente
        logs.forEach(log => {
            if (log.estado !== 'completado') {
                currentStreak = 0;
                prevDate = null;
                return;
            }
            const currentDate = new Date(log.fecha);
            if (prevDate) {
                const diffDays = this.diffInDays(prevDate, currentDate);
                // Si la diferencia es exactamente 1 día, se extiende la racha
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

        // Para calcular la racha actual, se recorre en orden descendente
        let actualStreak = 0;
        const descendingLogs = [...logs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const today = new Date();
        // Se toma como referencia el día actual (sin hora)
        let expectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        for (const log of descendingLogs) {
            if (log.estado !== 'completado') {
                continue;
            }
            const logDate = new Date(log.fecha);
            // Se comparan solo las fechas (ignorando la hora)
            const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            if (this.isSameDate(logDay, expectedDate)) {
                actualStreak++;
                // Se decrementa la fecha esperada un día atrás
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else if (logDay < expectedDate) {
                // Si se encuentra un día anterior a la fecha esperada, se rompe la racha
                break;
            }
        }

        return { rachaActual: actualStreak, rachaMaxima };
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

    /**
     * Método público para refrescar las estadísticas.
     * Se recomienda llamarlo desde los signals de hábitos o logs cada vez que se
     * realice una operación CRUD que pueda modificar los datos.
     */
    public refreshStatistics() {
        this.computeStatistics();
    }
}
