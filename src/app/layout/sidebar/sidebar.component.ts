import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  items: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/home',
      command: () => this.closeSidebar.emit()
    },
    {
      label: 'Categorías',
      icon: 'pi pi-folder-open',
      routerLink: '/categories',
      command: () => this.closeSidebar.emit()
    },
    {
      label: 'Hábitos',
      icon: 'pi pi-check-square',
      routerLink: '/habits',
      command: () => this.closeSidebar.emit()
    },
    {
      label: 'Registros',
      icon: 'pi pi-book',
      routerLink: '/logs',
      command: () => this.closeSidebar.emit()
    },
    {
      label: 'Rachas',
      icon: 'pi pi-chart-bar',
      routerLink: '/habits-streaks',
      command: () => this.closeSidebar.emit()
    },
    {
      label: 'Reportes Generales',
      icon: 'pi pi-chart-line',
      routerLink: '/general-reports',
      command: () => this.closeSidebar.emit()
    }
  ];
}
