// /features/home/daily-habits/daily-habits.utils.ts
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';

export function isSameDay(dateA: Date | string, dateB: Date): boolean {
    const a = new Date(dateA);
    return (
        a.getFullYear() === dateB.getFullYear() &&
        a.getMonth() === dateB.getMonth() &&
        a.getDate() === dateB.getDate()
    );
}

export function getProgress(habit: Habit, logs: Log[], today = new Date()): number {
    let logsForPeriod: Log[] = [];

    if (habit.frecuencia === 'diario' || habit.frecuencia === 'ocasional') {
        logsForPeriod = logs.filter(log =>
            log.habitId === habit.id && isSameDay(log.fecha, today)
        );
    } else if (habit.frecuencia === 'semanal') {
        const startOfWeek = new Date(today);
        const day = today.getDay(); // 0 = domingo
        startOfWeek.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        logsForPeriod = logs.filter(log => {
            const logDate = new Date(log.fecha);
            return (
                log.habitId === habit.id &&
                logDate >= startOfWeek &&
                logDate <= endOfWeek
            );
        });
    } else if (habit.frecuencia === 'mensual') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        logsForPeriod = logs.filter(log => {
            const logDate = new Date(log.fecha);
            return (
                log.habitId === habit.id &&
                logDate.getMonth() === currentMonth &&
                logDate.getFullYear() === currentYear
            );
        });
    }

    return logsForPeriod.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);
}

export function getProgressColor(habit: Habit, logs: Log[]): string {
    const progress = getProgress(habit, logs);
    if (habit.tipo === 'bueno') {
        return progress >= habit.objetivo ? '#4caf50' : '#f44336';
    } else {
        return progress === 0 ? '#4caf50' : '#f44336';
    }
}

export function getWeeklyStatus(habit: Habit, logs: Log[], today = new Date()): {
    day: string;
    date: Date;
    estado: 'pendiente' | 'parcial' | 'completado';
}[] {
    const startOfWeek = new Date(today);
    const day = today.getDay(); // 0 = domingo
    startOfWeek.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayName = date.toLocaleDateString('es-CL', { weekday: 'short' }).toLowerCase();
        return { date, day: dayName };
    });

    if (habit.frecuencia === 'diario') {
        return days.map(({ date, day }) => {
            const logsForDay = logs.filter(l =>
                l.habitId === habit.id && isSameDay(l.fecha, date)
            );
            const cantidad = logsForDay.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);
            const diaPaso = date < today;

            if (habit.tipo === 'bueno') {
                if (cantidad === 0 && diaPaso) return { day, date, estado: 'parcial' };
                if (cantidad === 0) return { day, date, estado: 'pendiente' };
                return {
                    day,
                    date,
                    estado: cantidad >= habit.objetivo ? 'completado' : 'parcial'
                };
            } else {
                if (cantidad > habit.objetivo) return { day, date, estado: 'parcial' };
                if (cantidad === 0 && diaPaso) return { day, date, estado: 'completado' };
                if (cantidad === 0 && !diaPaso) return { day, date, estado: 'pendiente' };
                return {
                    day,
                    date,
                    estado: cantidad <= habit.objetivo ? 'completado' : 'parcial'
                };
            }
        });
    }

    if (habit.frecuencia === 'semanal') {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const logsSemana = logs.filter(log =>
            log.habitId === habit.id &&
            new Date(log.fecha) >= startOfWeek &&
            new Date(log.fecha) <= endOfWeek
        );

        const acumulado = logsSemana.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);
        const objetivoCumplido = acumulado >= habit.objetivo;

        return days.map(({ date, day }) => {
            const hayLog = logsSemana.some(log => isSameDay(log.fecha, date));
            return {
                day,
                date,
                estado: hayLog
                    ? (objetivoCumplido ? 'completado' : 'parcial')
                    : 'pendiente'
            };
        });
    }

    return days.map(({ day, date }) => ({
        day,
        date,
        estado: 'pendiente'
    }));
}
