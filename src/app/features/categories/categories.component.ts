import { Component } from '@angular/core';
import { CategorySignal } from '../../core/signals/category.signal';
import { Category } from '../../core/models/category.model';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { CategoryFormComponent } from './category-form/category-form.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CategoryFormComponent, CategoriesListComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  constructor(public categorySignal: CategorySignal) { }

  async addCategory(formData: { nombre: string; descripcion: string; satisfaccion: number }) {
    const category: Category = {
      id: Date.now(),
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      satisfaccion: formData.satisfaccion
    };

    await this.categorySignal.addCategory(category);
  }
}
