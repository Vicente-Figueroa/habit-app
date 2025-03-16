import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-habit-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-input.component.html',
  styleUrls: ['./habit-input.component.css']
})
export class HabitInputComponent {
  @Output() addHabit = new EventEmitter<any>();
  @Input() categories: Category[] = [];

  // Propiedad para controlar si el formulario está abierto o cerrado
  isOpen: boolean = false;

  habitName: string = '';
  habitDescription: string = '';
  habitType: 'bueno' | 'malo' = 'bueno';
  habitFrequency: 'diario' | 'semanal' | 'mensual' | 'ocasional' = 'diario';
  habitObjective: number = 1;
  habitUnit: string = 'veces';
  selectedCategory: number | null = null;
  habitInicio: string = '';
  habitFin: string = '';

  // Lista de días de la semana con checkboxes
  daysOfWeek = [
    { name: 'Lunes', value: 'lunes', selected: false },
    { name: 'Martes', value: 'martes', selected: false },
    { name: 'Miércoles', value: 'miércoles', selected: false },
    { name: 'Jueves', value: 'jueves', selected: false },
    { name: 'Viernes', value: 'viernes', selected: false },
    { name: 'Sábado', value: 'sábado', selected: false },
    { name: 'Domingo', value: 'domingo', selected: false }
  ];

  toggleForm() {
    this.isOpen = !this.isOpen;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    // Obtener los días seleccionados
    const diasSeleccionados = this.daysOfWeek
      .filter(day => day.selected)
      .map(day => day.value);

    const newHabit = {
      id: Date.now(),
      nombre: this.habitName.trim(),
      descripcion: this.habitDescription.trim(),
      tipo: this.habitType,
      frecuencia: this.habitFrequency,
      objetivo: this.habitObjective,
      unidadObjetivo: this.habitUnit.trim(),
      categoriaId: this.selectedCategory || undefined,
      diasSemana: diasSeleccionados.length ? diasSeleccionados : undefined,
      horarioInicio: this.habitInicio || undefined,
      horarioFin: this.habitFin || undefined,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      activo: true
    };

    this.addHabit.emit(newHabit);
    this.resetForm();
    // Opcionalmente, puedes cerrar el formulario después de enviar
    this.isOpen = false;
  }

  resetForm() {
    this.habitName = '';
    this.habitDescription = '';
    this.habitType = 'bueno';
    this.habitFrequency = 'diario';
    this.habitObjective = 1;
    this.habitUnit = 'veces';
    this.selectedCategory = null;
    this.habitInicio = '';
    this.habitFin = '';
    // Reiniciar selección de días
    this.daysOfWeek.forEach(day => day.selected = false);
  }
}
