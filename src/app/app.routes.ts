import { Routes } from '@angular/router';
import { BaseComponent } from './layout/base/base.component';
import { HomeComponent } from './features/home/home.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { HabitsComponent } from './features/habits/habits.component';
import { LogsComponent } from './features/logs/logs.component';
import { HabitStreaksComponent } from './features/habit-streaks/habit-streaks.component';
import { GeneralReportsComponent } from './features/general-reports/general-reports.component';

export const routes: Routes = [
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'habits', component: HabitsComponent },
            { path: 'logs', component: LogsComponent },
            { path: 'habits-streaks', component: HabitStreaksComponent },
            { path: 'general-reports', component: GeneralReportsComponent },
            { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirección a Home
        ]
    }
];
