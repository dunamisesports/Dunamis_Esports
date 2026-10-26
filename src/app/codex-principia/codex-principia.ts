import { Component, inject, signal } from '@angular/core';
import { Initiation } from '../initiation/initiation';
import { MembreSession, MembreStore } from '../session/membre.session';

interface HexadArchetype {
    name: string;
    type: string;
    line: string;
    image: string;
}

@Component({
    selector: 'app-codex-principia',
    imports: [Initiation],
    templateUrl: './codex-principia.html',
    styleUrl: './codex-principia.css'
})
export class CodexPrincipia {
    protected readonly session = inject(MembreStore);
    protected readonly showInitiation = signal(false);
    readonly inscription = signal<MembreSession | null>(null);

    protected openInitiation(): void {
        this.showInitiation.set(true);
    }

    protected tuneCreed(event: Event): void {
        (event.target as HTMLVideoElement).volume = 0.1;
    }

    protected closeInitiation(dossier: MembreSession): void {
        this.inscription.set(dossier);
        this.showInitiation.set(false);
    }

    protected readonly hexads: HexadArchetype[] = [
        {
            name: 'Sãmakh',
            type: 'Philanthropist',
            line: 'Aider sans rien attendre en retour, motivé par le sens et la contribution à une cause.',
            image: '/img/HEXAD/0b.svg'
        },
        {
            name: 'Qãhal',
            type: 'Socializer',
            line: 'Relier, collaborer et tenir la communauté.',
            image: '/img/HEXAD/1b.svg'
        },
        {
            name: 'Tùr',
            type: 'Free Spirit',
            line: 'Explorer, créer et rester libre.',
            image: '/img/HEXAD/2b.svg'
        },
        {
            name: 'Bãnãh',
            type: 'Achiever',
            line: 'Progresser, maîtriser et relever le défi.',
            image: '/img/HEXAD/3b.svg'
        },
        {
            name: 'Qasar',
            type: 'Player',
            line: 'Chercher les récompenses et les règles du système.',
            image: '/img/HEXAD/4b.svg'
        },
        {
            name: 'Nãsãh',
            type: 'Disruptor',
            line: 'Tester les limites et changer la donne.',
            image: '/img/HEXAD/5b.svg'
        }
    ];

    protected readonly index = signal(0);

    protected current(): HexadArchetype {
        return this.hexads[this.index()];
    }

    protected next(): void {
        this.index.update((i) => (i + 1) % this.hexads.length);
    }

    protected prev(): void {
        this.index.update((i) => (i - 1 + this.hexads.length) % this.hexads.length);
    }

    protected go(i: number): void {
        this.index.set(i);
    }
}
