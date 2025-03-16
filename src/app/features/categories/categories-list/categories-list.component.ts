import { Component } from '@angular/core';
import { CategorySignal } from '../../../core/signals/category.signal';
import { Category } from '../../../core/models/category.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.css'
})
export class CategoriesListComponent {
  constructor(public categorySignal: CategorySignal) {}

  // Variables para el modal de edición
  editingCategory: Category | null = null;
  editName: string = '';
  editDescription: string = '';
  editSatisfaction: number = 5;

  // Variables para el modal de borrado
  showDeleteConfirm: boolean = false;
  categoryToDelete: Category | null = null;

  // Abrir el modal de edición, haciendo una copia de la categoría seleccionada
  openEditModal(category: Category) {
    this.editingCategory = { ...category };
    this.editName = category.nombre;
    this.editDescription = category.descripcion;
    this.editSatisfaction = category.satisfaccion || 0;
  }

  // Cerrar el modal de edición
  closeEditModal() {
    this.editingCategory = null;
  }

  // Guardar la edición y actualizar la categoría
  async saveEdit() {
    if (!this.editingCategory) return;
    const updatedCategory: Category = {
      ...this.editingCategory,
      nombre: this.editName.trim(),
      descripcion: this.editDescription.trim(),
      satisfaccion: this.editSatisfaction
    };

    await this.categorySignal.updateCategory(updatedCategory);
    this.closeEditModal();
  }

  // Mostrar el modal de confirmación de borrado
  confirmDelete(category: Category) {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  // Ejecutar el borrado
  async deleteCategory() {
    if (!this.categoryToDelete) return;
    if (!this.categoryToDelete.id) return;
    await this.categorySignal.deleteCategory(this.categoryToDelete.id);
    this.cancelDelete();
  }

  // Cancelar la acción de borrado
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }
}
