import { computed, Injectable, signal } from '@angular/core';
import { DbService } from '../services/db.service';
import { Category } from '../models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategorySignal {
    private db = new DbService();
    private _categories = signal<Category[]>([]);
    // Una signal computada que devuelve las categorías actualizadas
    public categories = computed(() => this._categories());

    constructor() {
        this.loadCategories();
    }

    async loadCategories() {
        const data = await this.db.listAll<Category>('categorias');
        this._categories.set(data);
    }

    async addCategory(category: Category) {
        await this.db.add<Category>('categorias', category);
        this.loadCategories(); // Recargar datos después de agregar
    }

    async updateCategory(category: Category) {
        if (!category.id) return;
        await this.db.update<Category>('categorias', category);
        this._categories.set(this.categories().map(c => (c.id === category.id ? category : c)));
    }

    async deleteCategory(id: number) {
        await this.db.delete('categorias', id);
        this.loadCategories();
    }
}
