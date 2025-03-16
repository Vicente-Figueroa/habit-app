import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {
  categoryName: string = '';
  categoryDescription: string = '';
  categorySatisfaction: number = 5;

  @Output() addCategory = new EventEmitter<{ nombre: string; descripcion: string; satisfaccion: number }>();

  onSubmit(event: Event) {
    event.preventDefault();
    const name = this.categoryName.trim();
    const description = this.categoryDescription.trim();

    if (!name || !description) return;

    this.addCategory.emit({
      nombre: name,
      descripcion: description,
      satisfaccion: this.categorySatisfaction
    });

    // Reiniciar el formulario
    this.categoryName = '';
    this.categoryDescription = '';
    this.categorySatisfaction = 5;
  }
}
