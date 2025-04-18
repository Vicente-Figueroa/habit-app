// /features/home/daily-habits/completed-habit-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../../core/models/habit.model';
import { Log } from '../../../../core/models/log.model';
import { WeeklyStatusBarComponent } from '../weekly-status-bar/weekly-status-bar.component';
import { getProgress } from '../daily-habits.utils';
// ✅ PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag'; // opcional, por si usás tags
import { BadgeModule } from 'primeng/badge'; // opcional
import { RippleModule } from 'primeng/ripple';
@Component({
    selector: 'app-completed-habit-card',
    standalone: true,
    imports: [
        CommonModule,
        WeeklyStatusBarComponent,
        CardModule,
        ButtonModule,
        TagModule,
        BadgeModule,
        RippleModule
      ],
    templateUrl: './completed-habit-card.component.html',
    styleUrls: ['./completed-habit-card.component.css']
})
export class CompletedHabitCardComponent {
    @Input() habit!: Habit;
    @Input() logs: Log[] = [];

    @Output() quickLog = new EventEmitter<Habit>();
    @Output() retroLog = new EventEmitter<{ habit: Habit; date: Date }>();

    get progress(): number {
        return getProgress(this.habit, this.logs);
    }

    handleRetroLog(date: Date) {
        this.retroLog.emit({ habit: this.habit, date });
    }
}
