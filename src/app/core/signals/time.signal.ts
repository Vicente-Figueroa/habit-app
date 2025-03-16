import { signal } from '@angular/core';

export const currentTime = signal(new Date());
export const timeZone = 'America/Santiago';

// Función para actualizar la fecha en la signal
export function updateTime() {
    currentTime.set(new Date(new Date().toLocaleString('en-US', { timeZone })));
}
