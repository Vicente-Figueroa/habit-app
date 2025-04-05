import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { currentTime } from '../../../core/signals/time.signal';

interface HabitsGrouped {
  [key: string]: Habit[];
}

@Component({
  selector: 'app-daily-habits',
  imports: [CommonModule],
  templateUrl: './daily-habits.component.html',
  styleUrls: ['./daily-habits.component.css']
})
export class DailyHabitsComponent implements OnInit {
  @Input() habits: Habit[] = [];
  @Input() logs: Log[] = [];

  @Output() quickLog: EventEmitter<any> = new EventEmitter<any>();

  groupedHabits: HabitsGrouped = {
    diario: [],
    semanal: [],
    mensual: [],
    ocasional: []
  };

  completedGoodHabits: Habit[] = [];

  ngOnInit() {
    this.groupHabits();
  }

  ngOnChanges() {
    this.groupHabits();
  }

  private groupHabits() {
    this.groupedHabits = {
      diario: this.habits.filter(h => h.frecuencia === 'diario'),
      semanal: this.habits.filter(h => h.frecuencia === 'semanal'),
      mensual: this.habits.filter(h => h.frecuencia === 'mensual'),
      ocasional: this.habits.filter(h => h.frecuencia === 'ocasional')
    };

    this.completedGoodHabits = this.habits.filter(habit =>
      habit.tipo === 'bueno' && this.getProgress(habit) >= habit.objetivo
    );
  }

  getProgress(habit: Habit): number {
    const today = currentTime();
    let logsForPeriod: Log[] = [];

    if (habit.frecuencia === 'diario' || habit.frecuencia === 'ocasional') {
      logsForPeriod = this.logs.filter(log =>
        log.habitId === habit.id && this.isSameDay(log.fecha, today)
      );
    } else if (habit.frecuencia === 'semanal') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      logsForPeriod = this.logs.filter(log => {
        if (log.habitId !== habit.id) return false;
        const logDate = new Date(log.fecha);
        return logDate >= startOfWeek && logDate <= endOfWeek;
      });
    } else if (habit.frecuencia === 'mensual') {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      logsForPeriod = this.logs.filter(log => {
        if (log.habitId !== habit.id) return false;
        const logDate = new Date(log.fecha);
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
      });
    }

    return logsForPeriod.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);
  }

  private isSameDay(logDateStr: string, today: Date): boolean {
    const logDate = new Date(logDateStr);
    return logDate.getFullYear() === today.getFullYear() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getDate() === today.getDate();
  }

  getProgressColor(habit: Habit): string {
    const progress = this.getProgress(habit);
    if (habit.tipo === 'bueno') {
      return progress >= habit.objetivo ? '#4caf50' : '#f44336';
    } else {
      return progress === 0 ? '#4caf50' : '#f44336';
    }
  }

  public registerQuickLog(habit: Habit): void {
    if (habit && habit.id) {
      this.quickLog.emit(habit);
    } else {
      console.error('Hábito inválido para quick log:', habit);
    }
  }

  registerRetroLog(habit: Habit, date: Date): void {
    if (!habit || !habit.id) return;

    const log: Log = {
      id: Date.now(),
      habitId: habit.id,
      fecha: date.toISOString(),
      estado: 'completado',
      cantidadRealizada: 1,
      comentario: undefined
    };

    this.quickLog.emit({ ...habit, logOverride: log });
  }

  getWeeklyStatus(habit: Habit): {
    day: string;
    date: Date;
    estado: 'pendiente' | 'parcial' | 'completado';
  }[] {
    const today = currentTime();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // lunes
    startOfWeek.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayName = date.toLocaleDateString('es-CL', { weekday: 'short' }).toLowerCase();
      return { date, day: dayName };
    });

    if (habit.frecuencia === 'diario') {
      return days.map(({ date, day }) => {
        const logs = this.logs.filter(l =>
          l.habitId === habit.id && this.isSameDay(l.fecha, date)
        );
        const cantidad = logs.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);
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
          // hábito malo
          if (cantidad > habit.objetivo) {
            return { day, date, estado: 'parcial' }; // fallido
          }
          if (cantidad === 0 && diaPaso) {
            return { day, date, estado: 'completado' }; // evitado con éxito
          }
          if (cantidad === 0 && !diaPaso) {
            return { day, date, estado: 'pendiente' }; // aún puede fallarse
          }
          return {
            day,
            date,
            estado: cantidad <= habit.objetivo ? 'completado' : 'parcial'
          };
        }
      });
    }

    if (habit.frecuencia === 'semanal') {
      const logsSemana = this.logs.filter(log =>
        log.habitId === habit.id &&
        new Date(log.fecha) >= startOfWeek &&
        new Date(log.fecha) <= new Date(startOfWeek.getTime() + 6 * 86400000)
      );

      const acumulado = logsSemana.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);
      const objetivoCumplido = acumulado >= habit.objetivo;

      return days.map(({ date, day }) => {
        const hayLog = logsSemana.some(log => this.isSameDay(log.fecha, date));
        return {
          day,
          date,
          estado: hayLog
            ? (objetivoCumplido ? 'completado' : 'parcial')
            : 'pendiente'
        };
      });
    }

    // Para mensual/ocasional — neutro
    return days.map(({ day, date }) => ({
      day,
      date,
      estado: 'pendiente'
    }));
  }
}
