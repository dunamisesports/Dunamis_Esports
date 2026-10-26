import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MembreSession, MembreStore } from './session/membre.session';

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
    protected readonly loginError = signal('');

    protected onSessionClick(): void {
        if (this.session.membre()) {
            void this.router.navigate(['/profil']);
            return;
        }
        this.loginOpen.set(true);
    }

    protected closeLogin(): void {
        this.loginOpen.set(false);
        this.loginError.set('');
    }

    protected async submitLogin(event: Event): Promise<void> {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const data = new FormData(form);
        const email = String(data.get('email') ?? '').trim();
        const motDePasse = String(data.get('motDePasse') ?? '');
        this.loginError.set('');
        try {
            const response = await fetch('/api/connexion', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, motDePasse })
            });
            if (!response.ok) {
                this.loginError.set('Connexion refusée.');
                return;
            }
            const membre = await response.json() as MembreSession;
            this.session.ouvrir(membre);
            form.reset();
            this.closeLogin();
            void this.router.navigate(['/profil']);
        } catch {
            this.loginError.set('Connexion refusée.');
        }
    }

    @HostListener('document:keydown.escape')
    protected onEscape(): void {
        this.closeLogin();
    }
}
