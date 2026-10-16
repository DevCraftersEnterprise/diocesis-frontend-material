import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionCheckService } from './core/services/version-check.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly versionCheck = inject(VersionCheckService);
  protected readonly title = signal('diocesis-frontend-tailwind');

  ngOnInit(): void {
    this.versionCheck.init();
  }
}
