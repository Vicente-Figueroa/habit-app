import { Component } from '@angular/core';
import { HabitSignal } from '../../../core/signals/habit.signal';
import { CategorySignal } from '../../../core/signals/category.signal';
import { Habit } from '../../../core/models/habit.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { currentTime } from '../../../core/signals/time.signal';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule
  ],
  templateUrl: './habit-list.component.html',
  styleUrl: './habit-list.component.css'
})
export class HabitListComponent {
  constructor(
    public habitSignal: HabitSignal,
    public categorySignal: CategorySignal
  ) {}

  editingHabit: Habit | null = null;
  editHabitName = '';
  editHabitDescription = '';
  editHabitType: 'bueno' | 'malo' = 'bueno';
  editHabitFrequency: 'diario' | 'semanal' | 'mensual' | 'ocasional' = 'diario';
  editHabitObjective = 1;
  editHabitUnit = 'veces';
  editSelectedCategory: number | null = null;
  editHabitInicio = '';
  editHabitFin = '';

  showDeleteConfirm = false;
  habitToDelete: Habit | null = null;

  get isEditing(): boolean {
    return this.editingHabit !== null;
  }

  get categoryOptions() {
    return this.categorySignal.categories().map(c => ({
      label: c.nombre,
      value: c.id
    }));
  }

  openEditModal(habit: Habit) {
    this.editingHabit = { ...habit };
    this.editHabitName = habit.nombre;
    this.editHabitDescription = habit.descripcion;
    this.editHabitType = habit.tipo;
    this.editHabitFrequency = habit.frecuencia;
    this.editHabitObjective = habit.objetivo;
    this.editHabitUnit = habit.unidadObjetivo;
    this.editSelectedCategory = habit.categoriaId ?? null;
    this.editHabitInicio = habit.horarioInicio ?? '';
    this.editHabitFin = habit.horarioFin ?? '';
  }

  closeEditModal() {
    this.editingHabit = null;
  }

  async saveEdit() {
    if (!this.editingHabit) return;

    const updatedHabit: Habit = {
      ...this.editingHabit,
      nombre: this.editHabitName.trim(),
      descripcion: this.editHabitDescription.trim(),
      tipo: this.editHabitType,
      frecuencia: this.editHabitFrequency,
      objetivo: this.editHabitObjective,
      unidadObjetivo: this.editHabitUnit.trim(),
      categoriaId: this.editSelectedCategory ?? undefined,
      horarioInicio: this.editHabitInicio || undefined,
      horarioFin: this.editHabitFin || undefined,
      fechaActualizacion: currentTime().toISOString()
    };

    await this.habitSignal.updateHabit(updatedHabit);
    this.closeEditModal();
  }

  confirmDelete(habit: Habit) {
    this.habitToDelete = habit;
    this.showDeleteConfirm = true;
  }

  async deleteHabit() {
    if (!this.habitToDelete?.id) return;
    await this.habitSignal.deleteHabit(this.habitToDelete.id);
    this.cancelDelete();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.habitToDelete = null;
  }

  getCategoryName(categoryId?: number): string {
    return this.categorySignal.categories().find(c => c.id === categoryId)?.nombre || 'Sin categoría';
  }
}
