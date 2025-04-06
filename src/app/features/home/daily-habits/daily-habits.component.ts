// /features/home/daily-habits/daily-habits.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { currentTime } from '../../../core/signals/time.signal';
import { getProgress } from './daily-habits.utils';
import { HabitCardComponent } from './habit-card/habit-card.component';
import { CompletedHabitCardComponent } from './completed-habit-card/completed-habit-card.component';

@Component({
  selector: 'app-daily-habits',
  standalone: true,
  imports: [CommonModule, HabitCardComponent, CompletedHabitCardComponent],
  templateUrl: './daily-habits.component.html',
  styleUrls: ['./daily-habits.component.css']
})
export class DailyHabitsComponent implements OnInit, OnChanges {
  @Input() habits: Habit[] = [];
  @Input() logs: Log[] = [];
  @Output() quickLog = new EventEmitter<any>();

  groupedHabits: Record<string, Habit[]> = {
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
      habit.tipo === 'bueno' &&
      getProgress(habit, this.logs, currentTime()) >= habit.objetivo
    );
  }

  handleQuickLog(habit: Habit) {
    this.quickLog.emit(habit);
  }

  handleRetroLog({ habit, date }: { habit: Habit; date: Date }) {
    const log: Log = {
      id: Date.now(),
      habitId: habit.id  ||  0,
      fecha: date.toISOString(),
      estado: 'completado',
      cantidadRealizada: 1,
      comentario: undefined
    };
    this.quickLog.emit({ ...habit, logOverride: log });
  }
  public getProgressValue(habit: Habit): number {
    return getProgress(habit, this.logs, currentTime());
  }
}
