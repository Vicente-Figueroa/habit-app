import { Component } from '@angular/core';
import { CategorySignal } from '../../../core/signals/category.signal';
import { Category } from '../../../core/models/category.model';

// Angular core
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.css',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SliderModule,
    TagModule
  ]
})
export class CategoriesListComponent {
  constructor(public categorySignal: CategorySignal) { }

  // Modal de edición
  editingCategory: Category | null = null;
  editName: string = '';
  editDescription: string = '';
  editSatisfaction: number = 5;

  // Modal de confirmación
  showDeleteConfirm: boolean = false;
  categoryToDelete: Category | null = null;

  openEditModal(category: Category) {
    this.editingCategory = { ...category };
    this.editName = category.nombre;
    this.editDescription = category.descripcion;
    this.editSatisfaction = category.satisfaccion || 0;
  }

  closeEditModal() {
    this.editingCategory = null;
  }

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

  confirmDelete(category: Category) {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  async deleteCategory() {
    if (!this.categoryToDelete?.id) return;

    await this.categorySignal.deleteCategory(this.categoryToDelete.id);
    this.cancelDelete();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }
}
