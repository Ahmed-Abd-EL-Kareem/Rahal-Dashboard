import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { TopBar } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  imports: [CommonModule, RouterOutlet, Sidebar, TopBar],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './shell.css',
})
export class Shell {
  collapsed = signal(false);
  mobileOpen = signal(false);

  onMenuClick() {
    // On mobile: open drawer. On desktop: toggle collapse.
    if (window.innerWidth < 1024) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }
}
