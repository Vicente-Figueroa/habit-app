import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogSignal } from '../../../core/signals/log.signal';
import { HabitSignal } from '../../../core/signals/habit.signal';
import { Log } from '../../../core/models/log.model';
import { currentTime } from '../../../core/signals/time.signal';

@Component({
  selector: 'app-log-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './log-list.component.html',
  styleUrl: './log-list.component.css'
})
export class LogListComponent {
  constructor(
    public logSignal: LogSignal,
    public habitSignal: HabitSignal
  ) {}

  editingLog: Log | null = null;
  editHabitId: number | null = null;
  editDate: string = '';
  editState: 'completado' | 'parcial' | 'no completado' = 'completado';
  editAmount: number | null = null;
  editComment: string = '';

  showDeleteConfirm: boolean = false;
  logToDelete: Log | null = null;

  openEditModal(log: Log) {
    this.editingLog = { ...log };
    this.editHabitId = log.habitId;
    this.editDate = log.fecha.split('T')[0]; // Extrae la fecha sin la hora
    this.editState = log.estado;
    this.editAmount = log.cantidadRealizada ?? null;
    this.editComment = log.comentario || '';
  }

  closeEditModal() {
    this.editingLog = null;
  }

  async saveEdit() {
    if (!this.editingLog || !this.editHabitId) return;

    // Convertir la fecha a un formato correcto en la zona horaria de Chile
    const updatedLog: Log = {
      ...this.editingLog,
      habitId: this.editHabitId,
      fecha: new Date(`${this.editDate}T00:00:00-03:00`).toISOString(), // 🔥 Usa la zona horaria de Chile
      estado: this.editState,
      cantidadRealizada: this.editAmount ?? undefined,
      comentario: this.editComment.trim() || undefined
    };

    await this.logSignal.updateLog(updatedLog);
    this.closeEditModal();
  }

  confirmDelete(log: Log) {
    this.logToDelete = log;
    this.showDeleteConfirm = true;
  }

  async deleteLog() {
    if (!this.logToDelete || !this.logToDelete.id) return;
    await this.logSignal.deleteLog(this.logToDelete.id);
    this.cancelDelete();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.logToDelete = null;
  }

  getHabitName(habitId: number): string {
    const habit = this.habitSignal.habits().find(h => h.id === Number(habitId));
    return habit ? habit.nombre : 'Hábito desconocido';
  }
}
