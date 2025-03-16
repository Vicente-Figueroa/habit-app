import { Component, Input } from '@angular/core';
import { Statistic } from '../../../core/models/statistic.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-habit-streak-list',
  imports: [CommonModule],
  templateUrl: './habit-streak-list.component.html',
  styleUrl: './habit-streak-list.component.css'
})
export class HabitStreakListComponent {
  @Input() statistics: Statistic[] = [];

}
