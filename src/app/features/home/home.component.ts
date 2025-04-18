import { Component, computed } from '@angular/core';
import { HabitSignal } from '../../core/signals/habit.signal';
import { LogSignal } from '../../core/signals/log.signal';
import { Habit } from '../../core/models/habit.model';
import { DailyHabitsComponent } from './daily-habits/daily-habits.component';
import { CommonModule } from '@angular/common';
import { CategorySignal } from '../../core/signals/category.signal';
import { Subscription } from 'rxjs';
import { MotivationalTextService } from '../../core/services/motivational-text.service';
import { currentTime } from '../../core/signals/time.signal';
import { Log } from '../../core/models/log.model';
import { CardModule } from 'primeng/card';
import { Button, ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';


@Component({
  selector: 'app-home',
  imports: [DailyHabitsComponent, CommonModule, CardModule, ButtonModule, DialogModule, TagModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  motivationalText: string = '';
  private motivationalTextSubscription!: Subscription;
  today = computed(() => currentTime()); // Computed para reactividad

  constructor(
    public habitSignal: HabitSignal,
    public categorySignal: CategorySignal,
    public logSignal: LogSignal,
    private motivationalTextService: MotivationalTextService
  ) { }

  ngOnInit(): void {
    this.motivationalTextService.getMotivationalTextFromModel(
      "Genera un mensaje motivacional muy corto para inspirar a cumplir objetivos. Se creativo y no se repita."
    ).then(text => {
      this.motivationalText = text;
    }).catch(error => {
      console.error("Error al obtener el mensaje motivacional:", error);
    });
  }

  ngOnDestroy(): void {
    if (this.motivationalTextSubscription) {
      this.motivationalTextSubscription.unsubscribe();
    }
  }

  get todayDay(): string {
    return this.today().toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
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

  async onQuickLog(habit: Habit & { logOverride?: Log }): Promise<void> {
    if (!habit.id) return;

    const log = habit.logOverride ?? {
      id: Date.now(),
      habitId: habit.id,
      fecha: currentTime().toISOString(),
      estado: 'completado',
      cantidadRealizada: 1,
      comentario: undefined
    };

    await this.logSignal.addLog(log);

    const dateStr = new Date(log.fecha).toISOString().split('T')[0];
    const total = this.logSignal.logs()
      .filter(l => l.habitId === habit.id && l.fecha.startsWith(dateStr))
      .reduce((sum, l) => sum + (l.cantidadRealizada || 0), 0);

    this.confirmationMessage = `Se agregó +1 a "${habit.nombre}". Total ese día: ${total}.`;
    this.showConfirmation = true;
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
  }

  getFailedHabitsYesterday(): Habit[] {
    const yesterday = new Date(this.today());
    yesterday.setDate(yesterday.getDate() - 1);

    const dayName = yesterday.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
    const logsAyer = this.logSignal.getLogsByDate(yesterday);

    return this.habitSignal.habits().filter(habit => {
      if (habit.tipo !== 'bueno' || habit.frecuencia !== 'diario') return false;

      const aplica = !habit.diasSemana || habit.diasSemana.includes(dayName);
      if (!aplica) return false;

      const logs = logsAyer.filter(log => log.habitId === habit.id);
      const cantidad = logs.reduce((sum, log) => sum + (log.cantidadRealizada || 0), 0);

      return cantidad < habit.objetivo;
    });
  }
}
