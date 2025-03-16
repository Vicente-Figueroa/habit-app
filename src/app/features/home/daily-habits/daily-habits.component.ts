import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';

@Component({
  selector: 'app-daily-habits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-habits.component.html',
  styleUrls: ['./daily-habits.component.css']
})
export class DailyHabitsComponent {
  // Recibimos los hábitos filtrados para hoy
  @Input() habits: Habit[] = [];
  // Recibimos los logs de hoy para calcular progreso
  @Input() logs: Log[] = [];

  // Emitimos el hábito cuando se registra un quick log
  @Output() quickLog: EventEmitter<Habit> = new EventEmitter<Habit>();

  /**
   * Calcula el progreso del hábito (suma de cantidadRealizada) según su frecuencia.
   */
  getProgress(habit: Habit): number {
    let logsForPeriod: Log[] = [];

    if (habit.frecuencia === 'diario' || habit.frecuencia === 'ocasional') {
      // Filtrar los logs del día actual
      const todayStr = new Date().toISOString().split('T')[0];
      logsForPeriod = this.logs.filter(log =>
        log.habitId === habit.id && log.fecha.startsWith(todayStr)
      );
    } else if (habit.frecuencia === 'semanal') {
      // Determinar el inicio y fin de la semana actual (asumiendo que la semana comienza el lunes)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0: domingo, 1: lunes, etc.
      // Calcular diferencia: si hoy es domingo (0), consideramos 6 días atrás; si no, (día - 1)
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - diff);
      // Establecer a medianoche para evitar problemas con las horas
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
      const today = new Date();
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

  /**
   * Devuelve un color según el progreso del hábito y su tipo:
   * - Para hábitos "bueno": verde si se ha alcanzado (o no se ha superado) la meta, rojo si no.
   * - Para hábitos "malo": verde si no se ha registrado nada, rojo si hay incidencias.
   */
  getProgressColor(habit: Habit): string {
    const progress = this.getProgress(habit);
    if (habit.tipo === 'bueno') {
      return progress >= habit.objetivo ? '#4caf50' : '#f44336';
    } else {
      return progress === 0 ? '#4caf50' : '#f44336';
    }
  }


  /**
   * Maneja el registro rápido, emitiendo el evento con el hábito.
   */
  public registerQuickLog(habit: Habit): void {
    if (habit && habit.id) {
      this.quickLog.emit(habit);
    } else {
      console.error('Hábito inválido para quick log:', habit);
    }
  }
}
