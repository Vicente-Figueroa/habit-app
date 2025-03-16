import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { currentTime } from '../../../core/signals/time.signal';

@Component({
  selector: 'app-habit-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-input.component.html',
  styleUrls: ['./habit-input.component.css']
})
export class HabitInputComponent {
  @Output() addHabit = new EventEmitter<any>();
  @Input() categories: Category[] = [];

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

  daysOfWeek = [
    { name: 'Lunes', value: 'lunes', selected: false },
    { name: 'Martes', value: 'martes', selected: false },
    { name: 'Miércoles', value: 'miércoles', selected: false },
    { name: 'Jueves', value: 'jueves', selected: false },
    { name: 'Viernes', value: 'viernes', selected: false },
    { name: 'Sábado', value: 'sábado', selected: false },
    { name: 'Domingo', value: 'domingo', selected: false }
  ];

  constructor() {}

  toggleForm() {
    this.isOpen = !this.isOpen;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    const diasSeleccionados = this.daysOfWeek
      .filter(day => day.selected)
      .map(day => day.value);

    const now = currentTime(); // Usamos la signal para la fecha normalizada

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
      fechaCreacion: now.toISOString(),
      fechaActualizacion: now.toISOString(),
      activo: true
    };

    this.addHabit.emit(newHabit);
    this.resetForm();
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
    this.daysOfWeek.forEach(day => day.selected = false);
  }
}
