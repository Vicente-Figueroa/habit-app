export interface Habit {
    id?: number; // Se asigna automáticamente en la DB
    nombre: string;
    descripcion: string;
    tipo: 'bueno' | 'malo';
    categoriaId?: number; // Puede ser undefined si no tiene categoría asociada
    frecuencia: 'diario' | 'semanal' | 'mensual' | 'ocasional';
    diasSemana?: string[]; // Opcional: Lista de días de la semana
    objetivo: number; // Valor numérico de la meta
    unidadObjetivo: string; // Unidad de la meta (ej. "minutos", "veces")
    horarioInicio?: string; // Hora de inicio sugerida (formato HH:mm)
    horarioFin?: string; // Hora límite sugerida (formato HH:mm)
    fechaCreacion: string; // Formato ISO string
    fechaActualizacion: string; // Última modificación en formato ISO string
    activo: boolean; // Estado del hábito
}
