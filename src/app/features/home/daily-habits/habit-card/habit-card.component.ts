// /features/home/daily-habits/habit-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../../core/models/habit.model';
import { Log } from '../../../../core/models/log.model';
import { WeeklyStatusBarComponent } from '../weekly-status-bar/weekly-status-bar.component';
import { getProgress, getProgressColor } from '../daily-habits.utils';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, WeeklyStatusBarComponent],
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.css']
})
export class HabitCardComponent {
  @Input() habit!: Habit;
  @Input() logs: Log[] = [];

  @Output() quickLog = new EventEmitter<Habit>();
  @Output() retroLog = new EventEmitter<{ habit: Habit; date: Date }>();

  get progress(): number {
    return getProgress(this.habit, this.logs);
  }

  get progressColor(): string {
    return getProgressColor(this.habit, this.logs);
  }

  handleRetroLog(date: Date) {
    this.retroLog.emit({ habit: this.habit, date });
  }
}
