import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MembreStore } from './session/membre.session';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    private readonly router = inject(Router);
    protected readonly session = inject(MembreStore);
    protected readonly title = signal('Dunamis_Esports');
    protected readonly loginOpen = signal(false);

    protected onSessionClick(): void {
        if (this.session.membre()) {
            void this.router.navigate(['/profil']);
            return;
        }
        this.loginOpen.set(true);
    }

    protected closeLogin(): void {
        this.loginOpen.set(false);
    }

    protected submitLogin(event: Event): void {
        event.preventDefault();
    }

    @HostListener('document:keydown.escape')
    protected onEscape(): void {
        this.closeLogin();
    }
}
