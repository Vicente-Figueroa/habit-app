import { Routes } from '@angular/router';
import { BaseComponent } from './layout/base/base.component';
import { HomeComponent } from './features/home/home.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { HabitsComponent } from './features/habits/habits.component';
import { LogsComponent } from './features/logs/logs.component';

export const routes: Routes = [
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'habits', component: HabitsComponent },
            { path: 'logs', component: LogsComponent }, 
            { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirección a Home
        ]
    }
];
