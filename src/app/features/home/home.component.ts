import { Component } from '@angular/core';
import { HabitSignal } from '../../core/signals/habit.signal';
import { LogSignal } from '../../core/signals/log.signal';
import { Habit } from '../../core/models/habit.model';
import { DailyHabitsComponent } from './daily-habits/daily-habits.component';
import { CommonModule } from '@angular/common';
import { CategorySignal } from '../../core/signals/category.signal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DailyHabitsComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    public habitSignal: HabitSignal,
    public categorySignal: CategorySignal,
    public logSignal: LogSignal
  ) { }
  currentDate: Date = new Date();

  // Retorna el día actual en minúsculas (ej: "lunes")
  get todayDay(): string {
    return this.currentDate.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
  }

  // Filtra los hábitos que aplican para hoy:
  // Si el hábito tiene días definidos, se muestra si el día actual está incluido;
  // si no, se asume que se aplica diariamente.
  get todaysHabits(): Habit[] {
    return this.habitSignal.habits().filter(habit => {
      if (habit.diasSemana && habit.diasSemana.length > 0) {
        const days = habit.diasSemana.map(day => day.toLowerCase());
        return days.includes(this.todayDay);
      }
      return true;
    });
  }

  // Estado para mostrar el modal de confirmación
  showConfirmation: boolean = false;
  confirmationMessage: string = '';

  // Registra un log rápido para el hábito y luego muestra el modal con el total acumulado hoy
  async onQuickLog(habit: Habit): Promise<void> {
    if (!habit.id) return;
    // Crear el log rápido con cantidad 1
    const log = {
      id: Date.now(),
      habitId: habit.id,
      fecha: new Date().toISOString(),
      estado: 'completado' as const,
      cantidadRealizada: 1,
      comentario: undefined
    };
    await this.logSignal.addLog(log);

    // Calcular el total acumulado para el hábito hoy
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const total = this.logSignal.logs()
      .filter(l => l.habitId === habit.id && l.fecha.startsWith(todayStr))
      .reduce((sum, l) => sum + (l.cantidadRealizada || 0), 0);

    // Configurar y mostrar el modal de confirmación
    this.confirmationMessage = `Se agregó +1 a "${habit.nombre}". Total hoy: ${total}.`;
    this.showConfirmation = true;
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
  }
}
