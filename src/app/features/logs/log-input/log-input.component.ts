import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { currentTime } from '../../../core/signals/time.signal';

@Component({
  selector: 'app-log-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './log-input.component.html',
  styleUrl: './log-input.component.css'
})
export class LogInputComponent {
  @Output() addLog = new EventEmitter<Log>();
  @Input() habits: Habit[] = [];

  selectedHabit = signal<number | null>(null);
  logDate = signal<string>(currentTime().toISOString().split('T')[0]); // Usa la signal de tiempo
  logState = signal<'completado' | 'parcial' | 'no completado'>('completado');
  logAmount = signal<number | null>(null);
  logComment = signal<string>('');

  onSubmit(event: Event) {
    event.preventDefault();
    const habitId = this.selectedHabit();
    if (!habitId) return;

    // Convertir la fecha seleccionada al formato correcto en la zona horaria de Chile
    const fecha = new Date(`${this.logDate()}T00:00:00-03:00`).toISOString();

    const log: Log = {
      id: Date.now(),
      habitId,
      fecha, // Fecha correctamente ajustada
      estado: this.logState(),
      cantidadRealizada: this.logAmount() ?? undefined,
      comentario: this.logComment().trim() || undefined
    };

    this.addLog.emit(log);
    this.resetForm();
  }

  resetForm() {
    this.selectedHabit.set(null);
    this.logDate.set(currentTime().toISOString().split('T')[0]); // Usa la signal
    this.logState.set('completado');
    this.logAmount.set(null);
    this.logComment.set('');
  }
}
