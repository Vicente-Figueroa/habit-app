import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-log-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './log-input.component.html',
  styleUrl: './log-input.component.css'
})
export class LogInputComponent {
  @Output() addLog = new EventEmitter<Log>();
  @Input() habits: Habit[] = [];

  // Signals para capturar datos del nuevo registro
  selectedHabit = signal<number | null>(null);
  logDate = signal<string>(new Date().toISOString().split('T')[0]);
  logState = signal<'completado' | 'parcial' | 'no completado'>('completado');
  logAmount = signal<number | null>(null);
  logComment = signal<string>('');

  onSubmit(event: Event) {
    event.preventDefault();
    const habitId = this.selectedHabit();
    if (!habitId) return; // Asegurar que se seleccione un hábito

    // Formatear la fecha sin cambios de zona horaria
    const fecha = new Date(this.logDate() + 'T00:00:00').toISOString();
    const log: Log = {
      id: Date.now(),
      habitId,
      fecha,
      estado: this.logState(),
      cantidadRealizada: this.logAmount() ?? undefined,
      comentario: this.logComment().trim() || undefined
    };

    this.addLog.emit(log);
    this.resetForm();
  }

  resetForm() {
    this.selectedHabit.set(null);
    this.logDate.set(new Date().toISOString().split('T')[0]);
    this.logState.set('completado');
    this.logAmount.set(null);
    this.logComment.set('');
  }
}
