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

  @Output() quickLog: EventEmitter<Habit> = new EventEmitter<Habit>();

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
    const today = currentTime();
    const todayStr = today.toISOString().split('T')[0];

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
    let logsForPeriod: Log[] = [];
    const today = currentTime();
    const todayStr = today.toISOString().split('T')[0];

    if (habit.frecuencia === 'diario' || habit.frecuencia === 'ocasional') {
      logsForPeriod = this.logs.filter(log =>
        log.habitId === habit.id && this.isSameDay(log.fecha, today)
      );
    } else if (habit.frecuencia === 'semanal') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes como inicio de semana
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

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
}