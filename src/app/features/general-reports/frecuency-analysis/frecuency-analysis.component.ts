import { Component, effect, Input, signal, SimpleChanges } from '@angular/core';
import { Habit } from '../../../core/models/habit.model';
import { Log } from '../../../core/models/log.model';
import { currentTime } from '../../../core/signals/time.signal';
import { ChartOptions, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-frequency-analysis',
  imports: [BaseChartDirective],
  templateUrl: './frecuency-analysis.component.html',
  styleUrl: './frecuency-analysis.component.css'
})
export class FrecuencyAnalysisComponent {
  @Input() habitos: Habit[] = [];
  @Input() registros: Log[] = [];

  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  diaMayorCumplimiento = signal<string>('');
  diaMenorCumplimiento = signal<string>('');
  distribucionDias = signal<number[]>([]);
  horariosFrecuencia = signal<number[]>([]);

  // Configuración de los gráficos
  barChartOptions: ChartOptions = { responsive: true };
  barChartLabels: string[] = this.diasSemana;
  barChartData: ChartData<'bar'> = { labels: this.barChartLabels, datasets: [{ data: [], label: 'Hábitos cumplidos' }] };
  barChartType: ChartType = 'bar';

  lineChartOptions: ChartOptions = { responsive: true };
  lineChartLabels: string[] = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  lineChartData: ChartData<'line'> = { labels: this.lineChartLabels, datasets: [{ data: [], label: 'Cumplimiento por hora' }] };
  lineChartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registros']) {
      this.calcularAnalisisFrecuencia();
    }
  }

  calcularAnalisisFrecuencia() {
    if (this.registros.length === 0) return;

    const now = currentTime();

    let frecuenciaPorDia: { [key: string]: number } = {};
    let frecuenciaPorHora: number[] = new Array(24).fill(0);

    this.diasSemana.forEach(dia => frecuenciaPorDia[dia] = 0);

    this.registros.forEach(registro => {
      const fechaRegistro = new Date(registro.fecha);
      const diaSemana = this.diasSemana[fechaRegistro.getDay()];
      frecuenciaPorDia[diaSemana]++;

      const hora = fechaRegistro.getHours();
      frecuenciaPorHora[hora]++;
    });

    const diasOrdenados = Object.entries(frecuenciaPorDia).sort((a, b) => b[1] - a[1]);

    this.diaMayorCumplimiento.set(diasOrdenados[0][0]);
    this.diaMenorCumplimiento.set(diasOrdenados[diasOrdenados.length - 1][0]);

    this.distribucionDias.set(Object.values(frecuenciaPorDia));
    this.horariosFrecuencia.set(frecuenciaPorHora);

    // Actualizar los gráficos
    this.barChartData.datasets[0].data = this.distribucionDias();
    this.lineChartData.datasets[0].data = this.horariosFrecuencia();
  }
}
