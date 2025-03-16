export interface Category {
    id?: number; // Puede ser undefined al crearse y se asigna en la DB
    nombre: string;
    descripcion: string;
    satisfaccion?: number; // Escala del 1 al 10
}
