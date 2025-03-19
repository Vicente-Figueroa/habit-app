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
            // Filtrar logs para el hábito actual y ordenarlos ascendentemente
            const habitLogs = logs
                // Forzar la conversión a número del habitId
                .filter(log => Number(log.habitId) === habit.id)
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());


            // Calcular racha y % de cumplimiento según la frecuencia
            const { rachaActual, rachaMaxima } = this.calculateStreaks(habitLogs, habit);
            let porcentajeCumplimiento = 0;
            if (habit.frecuencia === 'diario') {
                const totalLogs = habitLogs.length;
                const completedLogs = habitLogs.filter(log => this.isCompleted(log, habit)).length;
                porcentajeCumplimiento = totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0;
            } else {
                // Para hábitos semanales o mensuales, sumamos las cantidades de logs completados sin exigir que cada log cumpla individualmente
                const total = habitLogs.reduce((acc, log) => {
                    if (log.estado === 'completado') {
                        return acc + (typeof log.cantidadRealizada === 'number' ? log.cantidadRealizada : 1);
                    }
                    return acc;
                }, 0);
                porcentajeCumplimiento = habit.objetivo > 0 ? Math.min((total / habit.objetivo) * 100, 100) : 0;
            }

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
     * Determina si un log "cumple" el objetivo del hábito individualmente.
     * Esto se usa para hábitos diarios y para el cálculo del porcentaje de cumplimiento en estos.
     */
    private isCompleted(log: Log, habit: Habit): boolean {
        if (log.estado !== 'completado') return false;
        if (typeof log.cantidadRealizada === 'number') {
            if (habit.tipo === 'bueno') {
                return log.cantidadRealizada >= habit.objetivo;
            } else if (habit.tipo === 'malo') {
                return log.cantidadRealizada <= habit.objetivo;
            }
        }
        return true;
    }

    /**
     * Calcula la racha actual y la racha máxima a partir de los logs de un hábito,
     * diferenciando la lógica según la frecuencia.
     */
    private calculateStreaks(logs: Log[], habit: Habit): { rachaActual: number; rachaMaxima: number } {
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
     */
    private calculateDailyStreaks(logs: Log[], habit: Habit): { rachaActual: number, rachaMaxima: number } {
        let filteredLogs = logs;
        // Filtrado por días de la semana (si aplica)
        if (habit.diasSemana && habit.diasSemana.length > 0) {
            filteredLogs = logs.filter(log => {
                const dayName = new Date(log.fecha).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
                return habit.diasSemana!.map(d => d.toLowerCase()).includes(dayName);
            });
        }

        // 1) Cálculo de racha máxima (ascendente)
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

        // 2) Cálculo de la racha actual (descendente)
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
     * Cálculo de rachas para hábitos semanales o mensuales.
     * En estos casos se suma la cantidad de logs completados (sin exigir que cada uno cumpla individualmente)
     * y se marca el período como exitoso si la suma total >= habit.objetivo.
     */
    private calculatePeriodStreaks(
        logs: Log[],
        habit: Habit,
        period: 'semanal' | 'mensual'
    ): { rachaActual: number; rachaMaxima: number } {
        // Agrupar logs por semana o mes
        const groups = new Map<string, Log[]>();
        logs.forEach(log => {
            const date = new Date(log.fecha);
            const key = (period === 'semanal') ? this.getWeekKey(date) : this.getMonthKey(date);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(log);
        });

        // Determinar qué períodos son exitosos
        const periodKeys = Array.from(groups.keys()).sort();
        const successPeriods = periodKeys.map(key => {
            const logsInPeriod = groups.get(key)!;
            // Sumar la cantidad de logs completados (si no se especifica cantidad, contar 1)
            const total = logsInPeriod.reduce((acc, log) => {
                if (log.estado === 'completado') {
                    return acc + (typeof log.cantidadRealizada === 'number' ? log.cantidadRealizada : 1);
                }
                return acc;
            }, 0);
            const success = total >= habit.objetivo;
            return { key, success };
        });

        // Calcular la racha máxima de períodos consecutivos exitosos
        let rachaMaxima = 0;
        let currentStreak = 0;
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

        // Calcular la racha actual (periodos consecutivos desde el más reciente)
        let rachaActual = 0;
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
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }
}
