import { Component } from '@angular/core';
import { HabitSignal } from '../../../core/signals/habit.signal';
import { CategorySignal } from '../../../core/signals/category.signal';
import { Habit } from '../../../core/models/habit.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habit-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-list.component.html',
  styleUrl: './habit-list.component.css'
})
export class HabitListComponent {
  constructor(
    public habitSignal: HabitSignal,
    public categorySignal: CategorySignal
  ) { }
  editDaysOfWeek = [
    { name: 'Lunes', value: 'lunes', selected: false },
    { name: 'Martes', value: 'martes', selected: false },
    { name: 'Miércoles', value: 'miércoles', selected: false },
    { name: 'Jueves', value: 'jueves', selected: false },
    { name: 'Viernes', value: 'viernes', selected: false },
    { name: 'Sábado', value: 'sábado', selected: false },
    { name: 'Domingo', value: 'domingo', selected: false }
  ];

  // Variables para el modal de edición
  editingHabit: Habit | null = null;
  editHabitName: string = '';
  editHabitDescription: string = '';
  editHabitType: 'bueno' | 'malo' = 'bueno';
  editHabitFrequency: 'diario' | 'semanal' | 'mensual' | 'ocasional' = 'diario';
  editHabitObjective: number = 1;
  editHabitUnit: string = 'veces';
  editSelectedCategory: number | null = null;
  // Para simplificar, se usará un input de texto para días (podrías replicar checkboxes si deseas)
  editHabitDiasSemana: string = '';
  editHabitInicio: string = '';
  editHabitFin: string = '';

  // Variables para el modal de borrado
  showDeleteConfirm: boolean = false;
  habitToDelete: Habit | null = null;

  // Abrir el modal de edición, haciendo una copia del hábito seleccionado
  openEditModal(habit: Habit) {
    this.editingHabit = { ...habit };
    this.editHabitName = habit.nombre;
    this.editHabitDescription = habit.descripcion;
    this.editHabitType = habit.tipo;
    this.editHabitFrequency = habit.frecuencia;
    this.editHabitObjective = habit.objetivo;
    this.editHabitUnit = habit.unidadObjetivo;
    this.editSelectedCategory = habit.categoriaId || null;
    this.editHabitDiasSemana = habit.diasSemana ? habit.diasSemana.join(', ') : '';
    this.editHabitInicio = habit.horarioInicio || '';
    this.editHabitFin = habit.horarioFin || '';
  }

  // Cerrar el modal de edición
  closeEditModal() {
    this.editingHabit = null;
  }

  // Guardar la edición y actualizar el hábito
  async saveEdit() {
    if (!this.editingHabit) return;
    // Convertir el string de días en un array (si se ingresó algo)
    const dias = this.editHabitDiasSemana
      ? this.editHabitDiasSemana.split(',').map(d => d.trim())
      : undefined;

    const updatedHabit: Habit = {
      ...this.editingHabit,
      nombre: this.editHabitName.trim(),
      descripcion: this.editHabitDescription.trim(),
      tipo: this.editHabitType,
      frecuencia: this.editHabitFrequency,
      objetivo: this.editHabitObjective,
      unidadObjetivo: this.editHabitUnit.trim(),
      categoriaId: this.editSelectedCategory || undefined,
      diasSemana: dias,
      horarioInicio: this.editHabitInicio || undefined,
      horarioFin: this.editHabitFin || undefined,
      fechaActualizacion: new Date().toISOString()
    };

    await this.habitSignal.updateHabit(updatedHabit);
    this.closeEditModal();
  }

  // Mostrar el modal de confirmación de borrado
  confirmDelete(habit: Habit) {
    this.habitToDelete = habit;
    this.showDeleteConfirm = true;
  }

  // Ejecutar el borrado
  async deleteHabit() {
    if (!this.habitToDelete || !this.habitToDelete.id) return;
    await this.habitSignal.deleteHabit(this.habitToDelete.id);
    this.cancelDelete();
  }

  // Cancelar la acción de borrado
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.habitToDelete = null;
  }

  // Método auxiliar para obtener el nombre de la categoría
  getCategoryName(categoryId?: number): string {
    const category = this.categorySignal.categories().find(c => c.id === Number(categoryId));
    return category ? category.nombre : 'Sin categoría';
  }
}
