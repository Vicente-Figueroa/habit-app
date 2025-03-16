import { Component, signal } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrl: './base.component.css',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet],
})
export class BaseComponent {
  isSidebarOpen = signal(false); // Estado para manejar la apertura del sidebar

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
}
