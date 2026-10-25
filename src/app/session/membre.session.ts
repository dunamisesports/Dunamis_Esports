import { Injectable, computed, signal } from '@angular/core';

export interface MembreSession {
    email: string;
    pseudo: string;
    birthdate: string;
    genre: 'Masculin' | 'Féminin' | 'Autre';
    jeux: string[];
    motDePasse: string;
    primary: string | null;
    underlying: string | null;
    maison: string | null;
    rang: 'Initié(e)' | 'DAEVA' | 'Lieutenant / ArchDaeva' | 'Commandant / Guildmaster' | 'Archon du Konclave';
    etoiles: number;
    chantiers: string[];
}

@Injectable({ providedIn: 'root' })
export class MembreStore {
    private readonly session = signal<MembreSession | null>(null);
    readonly membre = this.session.asReadonly();
    readonly admin = computed(() => {
        const rang = this.session()?.rang;
        return rang === 'Commandant / Guildmaster' || rang === 'Archon du Konclave';
    });

    ouvrir(membre: MembreSession): void {
        this.session.set(membre);
    }

    fermer(): void {
        this.session.set(null);
    }
}
