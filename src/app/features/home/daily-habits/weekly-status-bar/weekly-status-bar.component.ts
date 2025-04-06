// /features/home/daily-habits/weekly-status-bar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../../core/models/habit.model';
import { Log } from '../../../../core/models/log.model';
import { getWeeklyStatus } from '../daily-habits.utils';

@Component({
  selector: 'app-weekly-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="week-status">
      <ng-container *ngFor="let status of statusList">
        <div
          class="day-circle"
          [title]="status.day"
          (click)="selectDate.emit(status.date)"
          style="cursor: pointer;">
          {{
            status.estado === 'completado' ? '✔️' :
            status.estado === 'parcial' ? '➕' :
            '⏳'
          }}
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./weekly-status-bar.component.css']
})
export class WeeklyStatusBarComponent {
  @Input() habit!: Habit;
  @Input() logs: Log[] = [];

  @Output() selectDate = new EventEmitter<Date>();

  get statusList() {
    return getWeeklyStatus(this.habit, this.logs);
  }
}
