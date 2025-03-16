import { Component, computed, signal } from '@angular/core';
import { HabitSignal } from '../../core/signals/habit.signal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorySignal } from '../../core/signals/category.signal';
import { HabitInputComponent } from './habit-input/habit-input.component';
import { HabitListComponent } from './habit-list/habit-list.component';

@Component({
  selector: 'app-habits',
  imports: [HabitInputComponent, HabitListComponent],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.css'
})
export class HabitsComponent {
  constructor(
    public habitSignal: HabitSignal,
    public categorySignal: CategorySignal
  ) { }
  // Método para recibir el hábito emitido por el HabitInputComponent
  async addHabit(habit: any) {
    await this.habitSignal.addHabit(habit);
  }

  // Getter para pasar las categorías al formulario
  get categories() {
    return this.categorySignal.categories();
  }
}
