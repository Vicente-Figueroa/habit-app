import { Component, OnInit } from '@angular/core';
import { Habit } from '../../core/models/habit.model';
import { Log } from '../../core/models/log.model';
import { HabitSignal } from '../../core/signals/habit.signal';
import { LogSignal } from '../../core/signals/log.signal';
import { GeneralStatsComponent } from './general-stats/general-stats.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-general-reports',
  imports: [GeneralStatsComponent, CommonModule],
  templateUrl: './general-reports.component.html',
  styleUrl: './general-reports.component.css'
})
export class GeneralReportsComponent implements OnInit {
  constructor(
    public habitSignal: HabitSignal,
    public logSignal: LogSignal
  ) { }
  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.habitSignal.loadHabits();
    this.logSignal.loadLogs();
  }
}
