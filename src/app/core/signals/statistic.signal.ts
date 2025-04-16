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
        // Crear un efecto para recalcular estadísticas cada vez que los logs o hábitos cambien
        effect(() => {
            this.logSignal.logs(); // Depend on logs signal
            this.habitSignal.habits(); // Depend on habits signal as well
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
            // Basic check to ensure habit and its ID are valid
            if (!habit || habit.id === undefined) {
                console.warn('Skipping statistic calculation for invalid habit:', habit);
                return;
            }

            // Filtrar logs para el hábito actual y ordenarlos ascendentemente
            const habitLogs = logs
                .filter(log => Number(log.habitId) === habit.id)
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

            // Calcular racha y % de cumplimiento según la frecuencia
            const { rachaActual, rachaMaxima } = this.calculateStreaks(habitLogs, habit);
            let porcentajeCumplimiento = 0;

            // Calculate Percentage Completion based on Frequency and Type
            if (habit.frecuencia === 'diario') {
                const daysMap = new Map<string, number>();
                habitLogs.forEach(log => {
                    if (log.estado !== 'completado') return;
                    const dayKey = this.formatDayKey(new Date(log.fecha));
                    const cantidad = (typeof log.cantidadRealizada === 'number') ? log.cantidadRealizada : 1;
                    daysMap.set(dayKey, (daysMap.get(dayKey) ?? 0) + cantidad);
                });

                const totalDaysTracked = daysMap.size;
                let successfulDays = 0;
                 daysMap.forEach((total) => {
                    if (habit.tipo === 'bueno' && total >= habit.objetivo) {
                        successfulDays++;
                    } else if (habit.tipo === 'malo' && total <= habit.objetivo) {
                        successfulDays++;
                    }
                 });

                porcentajeCumplimiento = totalDaysTracked > 0 ? (successfulDays / totalDaysTracked) * 100 : 0;

            } else { // Semanal, Mensual, Ocasional
                const totalCompletedAmount = habitLogs.reduce((acc, log) => {
                    if (log.estado === 'completado') {
                        return acc + (typeof log.cantidadRealizada === 'number' ? log.cantidadRealizada : 1);
                    }
                    return acc;
                }, 0);

                if (habit.objetivo > 0) {
                    if (habit.tipo === 'bueno') {
                        porcentajeCumplimiento = Math.min((totalCompletedAmount / habit.objetivo) * 100, 100);
                    } else { // habit.tipo === 'malo'
                         // If total amount is less than or equal to target, 100% success
                        porcentajeCumplimiento = totalCompletedAmount <= habit.objetivo ? 100 : 0;
                        // Consider a more nuanced calculation if needed, e.g., how far over the target?
                        // Example: (2 * target - actual) / target * 100 clamped between 0 and 100?
                        // For target 10: actual 5 -> 150 -> 100%; actual 10 -> 100 -> 100%; actual 15 -> 50 -> 50%; actual 20 -> 0 -> 0%
                         // let complianceRatio = (2 * habit.objetivo - totalCompletedAmount) / habit.objetivo;
                         // porcentajeCumplimiento = Math.max(0, Math.min(100, complianceRatio * 100));
                    }
                } else { // habit.objetivo is 0 or less
                     if (habit.tipo === 'bueno') {
                         porcentajeCumplimiento = totalCompletedAmount > 0 ? 100 : 0;
                     } else { // habit.tipo === 'malo'
                         porcentajeCumplimiento = totalCompletedAmount <= habit.objetivo ? 100 : 0;
                     }
                }
                // For 'ocasional', percentage might not be meaningful, defaults to 0 or based on total amount.
                if(habit.frecuencia === 'ocasional') {
                    // Maybe just show total count or similar instead of percentage?
                    // For now, it uses the same logic as weekly/monthly based on total amount.
                }
            }

            stats.push({
                habitId: habit.id,
                rachaActual,
                rachaMaxima,
                porcentajeCumplimiento: Math.round(porcentajeCumplimiento) // Round percentage
            });
        });

        this.statistics.set(stats);
    }

    /**
     * Calcula la racha actual y la racha máxima a partir de los logs de un hábito,
     * diferenciando la lógica según la frecuencia.
     */
    private calculateStreaks(logs: Log[], habit: Habit): { rachaActual: number; rachaMaxima: number } {
        // Ensure habit and habit.id are valid before proceeding
        if (!habit || habit.id === undefined) {
            return { rachaActual: 0, rachaMaxima: 0 };
        }
        switch (habit.frecuencia) {
            case 'diario':
                return this.calculateDailyStreaks(logs, habit);
            case 'semanal':
                return this.calculatePeriodStreaks(logs, habit, 'semanal');
            case 'mensual':
                return this.calculatePeriodStreaks(logs, habit, 'mensual');
            case 'ocasional': // Streaks don't typically apply to 'ocasional'
            default:
                return { rachaActual: 0, rachaMaxima: 0 }; // No streaks for occasional or invalid frequency
        }
    }

    /**
     * Cálculo de rachas para hábitos diarios.
     */
    private calculateDailyStreaks(logs: Log[], habit: Habit): { rachaActual: number, rachaMaxima: number } {
        if (!logs || logs.length === 0) {
            return { rachaActual: 0, rachaMaxima: 0 };
        }

        // 1) Agrupar logs por día y sumar las cantidades
        const daysMap = new Map<string, number>();
        logs.forEach(log => {
            if (log.estado !== 'completado') return;
            const date = new Date(log.fecha);
            // Optionally filter by diasSemana here if they DON'T count towards sum
            const dayKey = this.formatDayKey(date); // 'YYYY-MM-DD'
            const cantidad = (typeof log.cantidadRealizada === 'number') ? log.cantidadRealizada : 1;
            daysMap.set(dayKey, (daysMap.get(dayKey) ?? 0) + cantidad);
        });

        // 2) Determinar qué días cumplen el objetivo based on habit type
        const daysArray = Array.from(daysMap.entries()).map(([dayKey, total]) => {
            let completed = false;
            if (habit.tipo === 'bueno') {
                completed = total >= habit.objetivo;
            } else { // habit.tipo === 'malo'
                completed = total <= habit.objetivo;
            }
            return {
                date: this.getStartOfDay(new Date(dayKey + 'T00:00:00Z')), // Use UTC
                completed: completed
            };
        }).sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort chronologically

        if (daysArray.length === 0) {
            return { rachaActual: 0, rachaMaxima: 0 };
        }

        // 3) Calcular la racha máxima (ascendente)
        let rachaMaxima = 0;
        let currentStreak = 0;
        let prevDate: Date | null = null;

        daysArray.forEach(entry => {
            // Optionally, filter here based on habit.diasSemana if streaks should only count on specific days
            // const dayName = entry.date.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
            // const isRequiredDay = !habit.diasSemana || habit.diasSemana.length === 0 || habit.diasSemana.map(d => d.toLowerCase()).includes(dayName);
            // if (!isRequiredDay) return; // Skip check if not a required day

            if (!entry.completed) {
                currentStreak = 0; // Reset streak if the day wasn't completed
                prevDate = null;
                return;
            }

            const currentDate = entry.date;
            if (prevDate) {
                const diffDays = this.diffInDays(prevDate, currentDate);
                // Check if it's the next consecutive day (diff === 1)
                // OR if days are skipped due to diasSemana (needs more complex check)
                if (diffDays === 1) {
                    currentStreak++;
                } else if (diffDays > 1) {
                     // Check for gaps considering diasSemana if applicable
                     // For now, assume any gap breaks the streak
                    currentStreak = 1; // Gap in completion, reset streak to 1
                } // if diffDays === 0, it's the same day, streak count remains
            } else {
                currentStreak = 1; // First completed day in a sequence
            }
            prevDate = currentDate;
            rachaMaxima = Math.max(rachaMaxima, currentStreak);
        });

        // 4) Calcular la racha actual (descendente from today)
        // *** REFINED LOGIC BELOW ***
        let rachaActual = 0;
        let expectedDate = this.getStartOfDay(currentTime()); // Start checking from today (UTC)

        // Create a map for quick lookup of completion status by date string (YYYY-MM-DD UTC)
        const completedDaysMap = new Map<string, boolean>();
        daysArray.forEach(d => completedDaysMap.set(this.formatDayKey(d.date), d.completed));

        // Loop backwards indefinitely until a break condition is met
        while (true) {
            const expectedDateKey = this.formatDayKey(expectedDate);

            // Optional: Check if this specific date was required based on habit.diasSemana
            // const dayName = expectedDate.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
            // const isRequiredDay = !habit.diasSemana || habit.diasSemana.length === 0 || habit.diasSemana.map(d => d.toLowerCase()).includes(dayName);
            // if (!isRequiredDay) {
            //      expectedDate = this.addDays(expectedDate, -1); // Skip checking this day, look for the one before
            //      continue;
            // }

            if (completedDaysMap.has(expectedDateKey) && completedDaysMap.get(expectedDateKey) === true) {
                // Found a completed entry for the expected date
                rachaActual++;
                // Decrement expected date to check for the previous day
                expectedDate = this.addDays(expectedDate, -1);
            } else {
                // Day not found in logs OR it was found but not completed.
                // The streak counting backwards stops here.
                break; // Exit the loop
            }
        }
        // *** END OF REFINED LOGIC ***

         // Final check: rachaMaxima should be at least rachaActual
         rachaMaxima = Math.max(rachaMaxima, rachaActual);

        return { rachaActual, rachaMaxima };
    }


    /**
     * Cálculo de rachas para hábitos semanales o mensuales.
     */
    private calculatePeriodStreaks(
        logs: Log[],
        habit: Habit,
        period: 'semanal' | 'mensual'
    ): { rachaActual: number; rachaMaxima: number } {
        if (!logs || logs.length === 0) return { rachaActual: 0, rachaMaxima: 0 };

        // Agrupar logs por período y sumar cantidades
        const groups = new Map<string, { total: number, logsInPeriod: number }>();
        logs.forEach(log => {
            if (log.estado !== 'completado') return;
            const date = new Date(log.fecha);
            const key = (period === 'semanal') ? this.getWeekKey(date) : this.getMonthKey(date);
            const cantidad = (typeof log.cantidadRealizada === 'number') ? log.cantidadRealizada : 1;
            const existing = groups.get(key);
            if (existing) {
                existing.total += cantidad;
                existing.logsInPeriod++;
            } else {
                groups.set(key, { total: cantidad, logsInPeriod: 1 });
            }
        });

        // Convert map to array and sort periods chronologically
         const periodEntries = Array.from(groups.entries()).map(([key, data]) => ({
            key,
            total: data.total,
            startDate: this.getPeriodStartDate(key, period)
         })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        if (periodEntries.length === 0) return { rachaActual: 0, rachaMaxima: 0 };

        // Determinar qué períodos son exitosos based on habit type
        const successPeriods = periodEntries.map(entry => {
            let success = false;
            if (habit.tipo === 'bueno') {
                success = entry.total >= habit.objetivo;
            } else { // habit.tipo === 'malo'
                success = entry.total <= habit.objetivo;
            }
            return { key: entry.key, success: success, startDate: entry.startDate };
        });

        // Calcular la racha máxima de períodos consecutivos exitosos
        let rachaMaxima = 0;
        let currentStreak = 0;
        let prevPeriodKey: string | null = null;

        for (let i = 0; i < successPeriods.length; i++) {
            const currentPeriod = successPeriods[i];
            if (currentPeriod.success) {
                if (prevPeriodKey) {
                    if (this.arePeriodsConsecutive(prevPeriodKey, currentPeriod.key, period)) {
                        currentStreak++;
                    } else {
                        currentStreak = 1; // Gap, reset streak
                    }
                } else {
                    currentStreak = 1; // Start of a potential streak
                }
                prevPeriodKey = currentPeriod.key;
                rachaMaxima = Math.max(rachaMaxima, currentStreak);
            } else {
                currentStreak = 0; // Period not successful, reset streak
                prevPeriodKey = null;
            }
        }

        // Calcular la racha actual (periodos consecutivos desde el más reciente)
        let rachaActual = 0;
        const now = currentTime();
        let expectedPeriodKey = (period === 'semanal') ? this.getWeekKey(now) : this.getMonthKey(now);

        // Create a map for quick lookup of success status by period key
        const successMap = new Map<string, boolean>();
        successPeriods.forEach(p => successMap.set(p.key, p.success));

        // Loop backwards indefinitely from the current period
        while(true) {
            if (successMap.has(expectedPeriodKey) && successMap.get(expectedPeriodKey) === true) {
                // Expected period was completed successfully
                rachaActual++;
                // Update expected key to the previous period
                expectedPeriodKey = this.getPreviousPeriodKey(expectedPeriodKey, period);
            } else {
                 // Period not found in logs OR it was found but not successful
                 // Streak counting backwards stops here.
                break; // Exit loop
            }
        }

        // Ensure rachaMaxima is at least the actualStreak
        rachaMaxima = Math.max(rachaMaxima, rachaActual);

        return { rachaActual, rachaMaxima };
    }

    // --- Helper Functions ---

    private getStartOfDay(date: Date): Date {
        // Ensures calculations are based on UTC date, avoiding timezone offsets
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    private addDays(date: Date, days: number): Date {
        // Operates on UTC date
        const result = new Date(date.getTime()); // Clone the date
        result.setUTCDate(result.getUTCDate() + days);
        return result;
    }

    private formatDayKey(date: Date): string {
        // Uses UTC components for consistency
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // ISO 8601 week date calculation
    private getWeekKey(date: Date): string {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7; // Make Sunday 7
        d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Set to Thursday of the week
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate the week number
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }

    private getMonthKey(date: Date): string {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // Month is 0-indexed
        return `${year}-${String(month).padStart(2, '0')}`;
    }

    // Gets the UTC start date (Monday for week, 1st for month) of a given period key
    private getPeriodStartDate(key: string, period: 'semanal' | 'mensual'): Date {
        const parts = key.split(period === 'semanal' ? '-W' : '-');
        const year = parseInt(parts[0]);
        if (period === 'mensual') {
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
            return new Date(Date.UTC(year, month, 1));
        } else { // semanal
            const week = parseInt(parts[1]);
            // Calculate the date of the first day of that ISO week (Monday)
            const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
            // Find the date of the Thursday of week 1
            let thursdayWk1 = new Date(firstDayOfYear.getTime());
            thursdayWk1.setUTCDate(firstDayOfYear.getUTCDate() + 4 - (firstDayOfYear.getUTCDay() || 7));
            // Calculate the Monday of the target week
            let mondayOfWeek = new Date(thursdayWk1.getTime());
            mondayOfWeek.setUTCDate(thursdayWk1.getUTCDate() + (week - 1) * 7 - 3);
            return this.getStartOfDay(mondayOfWeek); // Return start of the day UTC
        }
    }

    // Checks if period B (keyB) is the period immediately following period A (keyA)
    private arePeriodsConsecutive(keyA: string, keyB: string, period: 'semanal' | 'mensual'): boolean {
        const expectedNextKey = this.getNextPeriodKey(keyA, period);
        return keyB === expectedNextKey;
    }

    // Gets the key for the period immediately following the given key
    private getNextPeriodKey(key: string, period: 'semanal' | 'mensual'): string {
        const startDate = this.getPeriodStartDate(key, period);
        if (period === 'mensual') {
            startDate.setUTCMonth(startDate.getUTCMonth() + 1);
            return this.getMonthKey(startDate);
        } else { // semanal
            startDate.setUTCDate(startDate.getUTCDate() + 7);
            return this.getWeekKey(startDate);
        }
    }

    // Gets the key for the period immediately preceding the given key
    private getPreviousPeriodKey(key: string, period: 'semanal' | 'mensual'): string {
         const startDate = this.getPeriodStartDate(key, period);
         if (period === 'mensual') {
             startDate.setUTCMonth(startDate.getUTCMonth() - 1);
             return this.getMonthKey(startDate);
         } else { // semanal
            // Go back 1 day from the start date to ensure we land in the previous week
            startDate.setUTCDate(startDate.getUTCDate() - 1);
            return this.getWeekKey(startDate);
         }
    }

    // Checks if period A chronologically comes before period B
    private isPeriodBefore(keyA: string, keyB: string, period: 'semanal' | 'mensual'): boolean {
        const dateA = this.getPeriodStartDate(keyA, period);
        const dateB = this.getPeriodStartDate(keyB, period);
        return dateA.getTime() < dateB.getTime();
    }

    // Calculates difference in days (ignoring time), using UTC dates
    private diffInDays(date1: Date, date2: Date): number {
        const d1 = date1.getTime(); // Already start of day UTC
        const d2 = date2.getTime(); // Already start of day UTC
        return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    }

    // Checks if two dates are the same calendar day (using UTC)
    private isSameDate(date1: Date, date2: Date): boolean {
        return date1.toISOString().slice(0, 10) === date2.toISOString().slice(0, 10);
    }
}
