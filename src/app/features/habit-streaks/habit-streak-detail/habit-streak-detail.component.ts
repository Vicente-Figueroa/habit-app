import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { Statistic } from '../../../core/models/statistic.model';
import { LogSignal } from '../../../core/signals/log.signal';
import { HabitSignal } from '../../../core/signals/habit.signal';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';

@Component({
  selector: 'app-habit-streak-detail',
  imports: [CommonModule],
  templateUrl: './habit-streak-detail.component.html',
  styleUrl: './habit-streak-detail.component.css'
})
export class HabitStreakDetailComponent {
  // Recibimos la lista de estadísticas desde el padre
  @Input() stat!: Statistic;

  // Signal para trackear qué hábito se expande
  expandedHabitId = signal<number | null>(null);

  constructor(
    private logSignal: LogSignal,
    private habitSignal: HabitSignal
  ) { }

  toggleDetails(habitId: number) {
    this.expandedHabitId.set(
      this.expandedHabitId() === habitId ? null : habitId
    );
  }

  getLogsForHabit(habitId: number): Log[] {
    // Filtramos la señal de logs
    return this.logSignal
      .logs()
      .filter(log => Number(log.habitId) === habitId)
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
  }

  getHabitName(habitId: number): string {
    const habit = this.habitSignal
      .habits()
      .find((h: Habit) => h.id === habitId);
    return habit ? habit.nombre : `Hábito ID: ${habitId}`;
  }

  getHabitUnit(habitId: number): string {
    const habit = this.habitSignal
      .habits()
      .find((h: Habit) => h.id === habitId);
    return habit?.unidadObjetivo || '';
  }
}
