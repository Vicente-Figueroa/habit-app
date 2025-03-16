export interface Log {
    id?: number; // Se asigna automáticamente en la DB
    habitId: number; // Referencia al hábito asociado
    fecha: string; // Fecha de ejecución en formato ISO string
    estado: 'completado' | 'parcial' | 'no completado'; // Estado del registro
    cantidadRealizada?: number; // Opcional: Cantidad alcanzada en la sesión
    comentario?: string; // Opcional: Nota adicional sobre la ejecución del hábito
}
