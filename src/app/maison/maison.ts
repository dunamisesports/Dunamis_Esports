import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { appel } from '../session/api';
import { MembreSession, MembreStore } from '../session/membre.session';
import { HouseChoice, HOUSES } from './maisons';

@Component({
    selector: 'app-maison',
    imports: [RouterLink],
    templateUrl: './maison.html',
    styleUrls: ['../initiation/initiation.css', './maison.css']
})
export class Maison {
    private readonly router = inject(Router);
    private readonly session = inject(MembreStore);

    protected readonly houses = HOUSES;
    protected readonly house = signal<string | null>(null);
    protected readonly modalOpen = signal(false);
    protected readonly pret = signal(false);
    protected readonly envoi = signal(false);
    protected readonly erreur = signal<string | null>(null);

    constructor() {
        afterNextRender(() => {
            void this.preparer();
        });
    }

    protected choose(id: string): void {
        this.house.set(id);
        this.erreur.set(null);
    }

    protected selected(): HouseChoice | undefined {
        return this.houses.find((item) => item.id === this.house());
    }

    protected openModal(): void {
        if (!this.house()) {
            return;
        }
        this.modalOpen.set(true);
    }

    protected closeModal(): void {
        this.modalOpen.set(false);
    }

    protected reporter(): void {
        void this.router.navigate(['/profil']);
    }

    protected async confirmer(): Promise<void> {
        const maison = this.house();
        if (!maison || this.envoi()) {
            return;
        }
        this.envoi.set(true);
        this.erreur.set(null);
        this.modalOpen.set(false);
        try {
            const response = await appel('/api/maison', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ maison })
            });
            if (!response.ok) {
                const corps = await response.json().catch(() => null) as { error?: string } | null;
                this.erreur.set(corps?.error ?? 'La Maison n\'a pas pu être enregistrée.');
                this.envoi.set(false);
                return;
            }
            const membre = await response.json() as MembreSession;
            this.session.ouvrir(membre);
            void this.router.navigate(['/profil']);
        } catch {
            this.erreur.set('La Maison n\'a pas pu être enregistrée.');
            this.envoi.set(false);
        }
    }

    private async preparer(): Promise<void> {
        const connu = this.session.membre();
        if (connu) {
            this.garder(connu);
            return;
        }
        try {
            const response = await appel('/api/session');
            if (!response.ok) {
                void this.router.navigate(['/profil']);
                return;
            }
            const membre = await response.json() as MembreSession;
            this.session.ouvrir(membre);
            this.garder(membre);
        } catch {
            void this.router.navigate(['/profil']);
        }
    }

    private garder(membre: MembreSession): void {
        if (membre.maison) {
            void this.router.navigate(['/profil']);
            return;
        }
        this.pret.set(true);
    }
}
