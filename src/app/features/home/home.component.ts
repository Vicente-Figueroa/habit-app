import { Component } from '@angular/core';
import { HabitSignal } from '../../core/signals/habit.signal';
import { LogSignal } from '../../core/signals/log.signal';
import { Habit } from '../../core/models/habit.model';
import { DailyHabitsComponent } from './daily-habits/daily-habits.component';
import { CommonModule } from '@angular/common';
import { CategorySignal } from '../../core/signals/category.signal';
import { Subscription } from 'rxjs';
import { MotivationalTextService } from '../../core/services/motivational-text.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DailyHabitsComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentDate: Date = new Date();
  motivationalText: string = '';
  private motivationalTextSubscription!: Subscription;

  constructor(
    public habitSignal: HabitSignal,
    public categorySignal: CategorySignal,
    public logSignal: LogSignal,
    private motivationalTextService: MotivationalTextService
  ) { }

  ngOnInit(): void {
    // Llamamos una vez para obtener el mensaje motivacional al iniciar
    this.motivationalTextService.getMotivationalTextFromModel(
      "Genera un mensaje motivacional muy corto para inspirar a cumplir objetivos."
    ).then(text => {
      this.motivationalText = text;
    }).catch(error => {
      console.error("Error al obtener el mensaje motivacional:", error);
    });

    // Si en algún futuro decidimos que el texto se actualice automáticamente,
    // podríamos crear un observable o timer que invoque nuevamente el método.
  }

  ngOnDestroy(): void {
    if (this.motivationalTextSubscription) {
      this.motivationalTextSubscription.unsubscribe();
    }
  }

  get todayDay(): string {
    return this.currentDate.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
  }

  get todaysHabits(): Habit[] {
    return this.habitSignal.habits().filter(habit => {
      if (habit.diasSemana && habit.diasSemana.length > 0) {
        const days = habit.diasSemana.map(day => day.toLowerCase());
        return days.includes(this.todayDay);
      }
      return true;
    });
  }

  showConfirmation: boolean = false;
  confirmationMessage: string = '';

  async onQuickLog(habit: Habit): Promise<void> {
    if (!habit.id) return;
    const log = {
      id: Date.now(),
      habitId: habit.id,
      fecha: new Date().toISOString(),
      estado: 'completado' as const,
      cantidadRealizada: 1,
      comentario: undefined
    };
    await this.logSignal.addLog(log);

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const total = this.logSignal.logs()
      .filter(l => l.habitId === habit.id && l.fecha.startsWith(todayStr))
      .reduce((sum, l) => sum + (l.cantidadRealizada || 0), 0);

    this.confirmationMessage = `Se agregó +1 a "${habit.nombre}". Total hoy: ${total}.`;
    this.showConfirmation = true;
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
  }
}
