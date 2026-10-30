import { afterNextRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { appel } from '../session/api';
import { MembreSession, MembreStore } from '../session/membre.session';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.html',
    styleUrl: './confirmation.css'
})
export class Confirmation {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly session = inject(MembreStore);
    protected readonly message = signal('Confirmation en cours.');

    constructor() {
        afterNextRender(() => {
            void this.confirmer();
        });
    }

    private async confirmer(): Promise<void> {
        const jeton = this.route.snapshot.queryParamMap.get('jeton')?.trim() ?? '';
        if (!jeton) {
            this.message.set('Lien incomplet.');
            return;
        }
        try {
            const response = await appel('/api/confirmation', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ jeton })
            });
            if (!response.ok) {
                const corps = await response.json().catch(() => null) as { error?: string } | null;
                this.message.set(corps?.error ?? 'Ce lien n\'est plus valable.');
                return;
            }
            const membre = await response.json() as MembreSession;
            this.session.ouvrir(membre);
            void this.router.navigate(['/profil']);
        } catch {
            this.message.set('La confirmation n\'a pas abouti.');
        }
    }
}
