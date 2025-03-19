import { Component } from '@angular/core';
import { DbService } from '../../core/services/db.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sync',
  imports: [CommonModule],
  templateUrl: './sync.component.html',
  styleUrl: './sync.component.css'
})
export class SyncComponent {
  // Para mostrar mensajes de estado al usuario
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Indicador de carga (spinner o mensaje "Por favor espere")
  isLoading = false;

  constructor(private dbService: DbService) {}

  // EXPORTAR (Descargar)
  async onExportData(): Promise<void> {
    this.limpiarMensajes();
    this.isLoading = true;

    try {
      const jsonData = await this.dbService.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'miBackupHabitos.json'; // Nombre del archivo
      link.click();
      URL.revokeObjectURL(url);

      this.successMessage = 'Datos exportados correctamente.';
    } catch (error) {
      console.error('Error al exportar datos:', error);
      this.errorMessage = 'Error al exportar datos.';
    } finally {
      this.isLoading = false;
    }
  }

  // IMPORTAR (Cargar)
  async onFileSelected(event: Event): Promise<void> {
    this.limpiarMensajes();
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.isLoading = true;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const contenidoJSON = e.target?.result;
        if (typeof contenidoJSON === 'string') {
          await this.dbService.importData(contenidoJSON);
          this.successMessage = 'Datos importados correctamente.';
        }
      } catch (error) {
        console.error('Error al importar datos:', error);
        this.errorMessage = 'Error al importar datos. Verifique el archivo JSON.';
      } finally {
        this.isLoading = false;
      }
    };

    reader.readAsText(file);
  }

  private limpiarMensajes(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}
