import { Component } from '@angular/core';
import { StatisticSignal } from '../../core/signals/statistic.signal';
import { HabitStreakListComponent } from './habit-streak-list/habit-streak-list.component';

@Component({
  selector: 'app-habit-streaks',
  imports: [HabitStreakListComponent],
  templateUrl: './habit-streaks.component.html',
  styleUrl: './habit-streaks.component.css'
})
export class HabitStreaksComponent {
  statistics: any;

  constructor(private statisticSignal: StatisticSignal) {
    // Usamos la signal directamente para que se actualice automáticamente
    this.statistics = this.statisticSignal.statistics;
  }
}
