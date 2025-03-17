import { Component, Input, signal, SimpleChange, SimpleChanges } from '@angular/core';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { currentTime } from '../../../core/signals/time.signal';
import { ChartOptions, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-evolution-charts',
  imports: [BaseChartDirective],
  templateUrl: './evolution-charts.component.html',
  styleUrl: './evolution-charts.component.css'
})
export class EvolutionChartsComponent {
  @Input() habitos: Habit[] = [];
  @Input() registros: Log[] = [];

  tendenciaDatos = signal<number[]>([]);
  comparacionDatos = signal<number[][]>([]);
  labels = signal<string[]>([]);

  // Configuración de los gráficos
  lineChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Tendencia de Cumplimiento' }] };

  barChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [], datasets: [
      { data: [], label: 'Última Semana' },
      { data: [], label: 'Mes Pasado' }
    ]
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registros']) {
      this.calcularEvolucion();
    }
  }

  calcularEvolucion() {
    if (this.registros.length === 0) return;

    const now = currentTime();
    let tendencia: number[] = [];
    let comparacion: number[][] = [[], []];
    let etiquetas: string[] = [];

    // Calcular la tendencia de hábitos en el tiempo (últimos 30 días)
    for (let i = 29; i >= 0; i--) {
      const fecha = new Date(now);
      fecha.setDate(now.getDate() - i);
      etiquetas.push(fecha.toLocaleDateString());

      const registrosDelDia = this.registros.filter(r => new Date(r.fecha).toDateString() === fecha.toDateString());
      const completados = registrosDelDia.filter(r => this.esRegistroCompletado(r)).length;
      tendencia.push(completados);
    }

    // Comparación entre última semana y mes pasado
    for (let i = 0; i < 7; i++) {
      const fechaSemana = new Date(now);
      fechaSemana.setDate(now.getDate() - i);
      const registrosSemana = this.registros.filter(r => new Date(r.fecha).toDateString() === fechaSemana.toDateString());
      comparacion[0].push(registrosSemana.filter(r => this.esRegistroCompletado(r)).length);

      const fechaMes = new Date(now);
      fechaMes.setDate(now.getDate() - (i + 30));
      const registrosMes = this.registros.filter(r => new Date(r.fecha).toDateString() === fechaMes.toDateString());
      comparacion[1].push(registrosMes.filter(r => this.esRegistroCompletado(r)).length);
    }

    this.tendenciaDatos.set(tendencia);
    this.comparacionDatos.set(comparacion);
    this.labels.set(etiquetas);

    // Actualizar gráficos
    this.lineChartData.labels = this.labels();
    this.lineChartData.datasets[0].data = this.tendenciaDatos();

    this.barChartData.labels = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];
    this.barChartData.datasets[0].data = this.comparacionDatos()[0];
    this.barChartData.datasets[1].data = this.comparacionDatos()[1];
  }

  esRegistroCompletado(registro: Log): boolean {
    const habit = this.habitos.find(h => h.id === registro.habitId);
    if (!habit) return false;

    return habit.tipo === 'bueno'
      ? registro.cantidadRealizada !== undefined && registro.cantidadRealizada >= habit.objetivo
      : registro.cantidadRealizada !== undefined && registro.cantidadRealizada < habit.objetivo;
  }
}
