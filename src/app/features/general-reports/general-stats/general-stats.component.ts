import { Component, Input } from '@angular/core';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-general-stats',
  imports: [CommonModule],
  templateUrl: './general-stats.component.html',
  styleUrl: './general-stats.component.css'
})
export class GeneralStatsComponent {
  @Input() habitos: Habit[] = [];
  @Input() registros: Log[] = [];

  totalHabitosActivos: number = 0;
  totalHabitosInactivos: number = 0;
  promedioPorDia: number = 0;
  promedioPorSemana: number = 0;
  promedioPorMes: number = 0;
  porcentajeCumplimiento: number = 0;

  ngOnInit() {
    this.calcularEstadisticas();
  }

  calcularEstadisticas() {
    // 1️⃣ Total de hábitos activos/inactivos
    this.totalHabitosActivos = this.habitos.filter(h => h.activo).length;
    this.totalHabitosInactivos = this.habitos.length - this.totalHabitosActivos;

    // 2️⃣ Promedio de hábitos completados por día/semana/mes
    this.promedioPorDia = this.calcularPromedioPorPeriodo('dia');
    this.promedioPorSemana = this.calcularPromedioPorPeriodo('semana');
    this.promedioPorMes = this.calcularPromedioPorPeriodo('mes');

    // 3️⃣ Porcentaje general de cumplimiento
    this.porcentajeCumplimiento = this.calcularPorcentajeCumplimiento();
  }

  calcularPromedioPorPeriodo(periodo: 'dia' | 'semana' | 'mes'): number {
    const registrosPorPeriodo = this.filtrarRegistrosPorPeriodo(periodo);

    const completados = registrosPorPeriodo.filter(r => {
      const habit = this.habitos.find(h => h.id === r.habitId);
      if (!habit) return false;

      if (habit.tipo === 'bueno') {
        return r.cantidadRealizada !== undefined && r.cantidadRealizada >= habit.objetivo;
      } else {
        return r.cantidadRealizada !== undefined && r.cantidadRealizada < habit.objetivo;
      }
    });

    return completados.length / (registrosPorPeriodo.length || 1);
  }

  calcularPorcentajeCumplimiento(): number {
    const totalRegistros = this.registros.length;
    if (totalRegistros === 0) return 0;

    const completados = this.registros.filter(r => {
      const habit = this.habitos.find(h => h.id === r.habitId);
      if (!habit) return false;

      if (habit.tipo === 'bueno') {
        return r.cantidadRealizada !== undefined && r.cantidadRealizada >= habit.objetivo;
      } else {
        return r.cantidadRealizada !== undefined && r.cantidadRealizada < habit.objetivo;
      }
    }).length;

    return (completados / totalRegistros) * 100;
  }

  filtrarRegistrosPorPeriodo(periodo: 'dia' | 'semana' | 'mes'): Log[] {
    const now = new Date();
    return this.registros.filter(r => {
      const fechaRegistro = new Date(r.fecha);
      switch (periodo) {
        case 'dia':
          return fechaRegistro.toDateString() === now.toDateString();
        case 'semana':
          const inicioSemana = new Date(now);
          inicioSemana.setDate(now.getDate() - now.getDay());
          return fechaRegistro >= inicioSemana;
        case 'mes':
          return fechaRegistro.getMonth() === now.getMonth() && fechaRegistro.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });
  }
}
