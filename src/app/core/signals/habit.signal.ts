import { Injectable, signal, computed } from '@angular/core';
import { DbService } from '../services/db.service';
import { Habit } from '../models/habit.model';
import { Log } from '../models/log.model';

@Injectable({
    providedIn: 'root'
})
export class HabitSignal {
    private db = new DbService();
    habits = signal<Habit[]>([]);

    // Propiedad computed que expone los hábitos de forma reactiva
    public computedHabits = computed(() => this.habits());

    constructor() {
        this.loadHabits();
    }

    async loadHabits() {
        const data = await this.db.listAll<Habit>('habitos');
        this.habits.set(data);
    }

    async addHabit(habit: Habit) {
        const newHabit = {
            ...habit,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        await this.db.add<Habit>('habitos', newHabit);
        this.loadHabits(); // Actualiza la lista en memoria
    }

    async updateHabit(habit: Habit) {
        if (!habit.id) return;
        const updatedHabit = { ...habit, fechaActualizacion: new Date().toISOString() };
        await this.db.update<Habit>('habitos', updatedHabit);
        this.habits.set(this.habits().map(h => (h.id === habit.id ? updatedHabit : h)));
    }

    async deleteHabit(id: number) {
         // Obtener todos los logs asociados al hábito que se va a eliminar
         const logs = await this.db.listAll<Log>('registros');
         const habitLogs = logs.filter(log => log.habitId === id);
 
         // Eliminar cada log asociado al hábito
         for (const log of habitLogs) {
             if (log.id) {
                 await this.db.delete('registros', Number(log.id));
             }
         }
 
         // Eliminar el hábito de la base de datos
         await this.db.delete('habitos', id);
 
         // Actualizar la lista de hábitos en memoria
         this.habits.set(this.habits().filter(h => h.id !== id));
     }
}
