import { Component, Input } from '@angular/core';
import { Statistic } from '../../../core/models/statistic.model';
import { CommonModule } from '@angular/common';
import { HabitSignal } from '../../../core/signals/habit.signal';
import { Habit } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-streak-list',
  imports: [CommonModule],
  templateUrl: './habit-streak-list.component.html',
  styleUrls: ['./habit-streak-list.component.css']
})
export class HabitStreakListComponent {
  @Input() statistics: Statistic[] = [];

  constructor(private habitSignal: HabitSignal) {}

  /**
   * Retorna el nombre del hábito dado su ID.
   */
  getHabitName(habitId: number): string {
    const habit = this.getHabit(habitId);
    return habit ? habit.nombre : 'Sin nombre';
  }

  /**
   * Retorna el objeto hábito a partir de su ID.
   */
  getHabit(habitId: number): Habit | undefined {
    return this.habitSignal.habits().find(h => h.id === Number(habitId));
  }

  /**
   * Asigna las clases del badge según el porcentaje de cumplimiento y el tipo de hábito.
   * Para hábitos negativos, se invierte: un porcentaje alto es "malo" (badge-low) y viceversa.
   */
  getBadgeClass(stat: Statistic): string {
    const habit = this.getHabit(stat.habitId);
    if (habit && habit.tipo === 'malo') {
      if (stat.porcentajeCumplimiento >= 80) return 'badge-low';
      if (stat.porcentajeCumplimiento >= 50) return 'badge-medium';
      return 'badge-high';
    } else {
      if (stat.porcentajeCumplimiento < 50) return 'badge-low';
      if (stat.porcentajeCumplimiento < 80) return 'badge-medium';
      return 'badge-high';
    }
  }

  /**
   * Retorna la etiqueta del badge según el porcentaje de cumplimiento y el tipo de hábito.
   */
  getBadgeLabel(stat: Statistic): string {
    const habit = this.getHabit(stat.habitId);
    if (habit && habit.tipo === 'malo') {
      if (stat.porcentajeCumplimiento >= 80) return 'Alto';
      if (stat.porcentajeCumplimiento >= 50) return 'Medio';
      return 'Bajo';
    } else {
      if (stat.porcentajeCumplimiento < 50) return 'Bajo';
      if (stat.porcentajeCumplimiento < 80) return 'Medio';
      return 'Alto';
    }
  }
}
