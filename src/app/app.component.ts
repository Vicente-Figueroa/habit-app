import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseComponent } from './layout/base/base.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
