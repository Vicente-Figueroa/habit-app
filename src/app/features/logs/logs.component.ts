import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogSignal } from '../../core/signals/log.signal';
import { HabitSignal } from '../../core/signals/habit.signal';
import { Log } from '../../core/models/log.model';
import { LogInputComponent } from './log-input/log-input.component';
import { LogListComponent } from './log-list/log-list.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LogInputComponent, LogListComponent],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent {
  constructor(public logSignal: LogSignal,
    public habitSignal: HabitSignal) { }

  // Método para recibir el log emitido desde el LogInputComponent
  async addLog(log: Log) {
    await this.logSignal.addLog(log);
  }

  // Método auxiliar para obtener el nombre del hábito asociado al log
  getHabitName(habitId: number): string {
    const habit = this.habitSignal.habits().find(h => h.id === habitId);
    return habit ? habit.nombre : 'Hábito desconocido';
  }
}
