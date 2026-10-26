import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal, untracked } from '@angular/core';
import { MembreStore } from '../session/membre.session';
import { JeuVisuel, visuelDuJeu } from './jeu-visuel';

interface Archetype {
    name: string;
    type: string;
    line: string;
    image: string;
}

const ARCHETYPES: Archetype[] = [
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

interface Maison {
    image: string;
    titre: string;
    valeur: string;
}

const MAISONS: Record<string, Maison> = {
    Concordia: {
        image: '/img/codexprincipia/OfTheConcordiaT.png',
        titre: 'De la Concordia',
        valeur: 'Unité'
    },
    Aequitas: {
        image: '/img/codexprincipia/OfTheAequitasT.png',
        titre: "De l'Aequitas",
        valeur: 'Équité'
    },
    Magisteria: {
        image: '/img/codexprincipia/OfTheMagisteriaT.png',
        titre: 'De La Magisteria',
        valeur: 'Maîtrise'
    }
};

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

@Component({
    selector: 'app-profil',
    imports: [],
    templateUrl: './profil.html',
    styleUrl: './profil.css'
})
export class Profil {
    protected readonly session = inject(MembreStore);
    private readonly platform = inject(PLATFORM_ID);
    protected readonly jeux = signal<JeuVisuel[]>([]);
    private demande = '';
    private jeton = 0;

    constructor() {
        effect(() => {
            const noms = this.session.membre()?.jeux ?? [];
            const cle = noms.join('\n');
            if (!isPlatformBrowser(this.platform)) {
                return;
            }
            untracked(() => {
                if (cle === this.demande) {
                    return;
                }
                this.demande = cle;
                this.jeux.set(noms.map((nom) => ({ nom, image: null, lien: null })));
                void this.remplir(noms);
            });
        });
    }

    protected arche(nom: string | null): Archetype | null {
        return ARCHETYPES.find((archetype) => archetype.name === nom) ?? null;
    }

    protected maisonDe(nom: string | null): Maison | null {
        return nom ? MAISONS[nom] ?? null : null;
    }

    protected etoiles(nombre: number): number[] {
        return Array.from({ length: Math.max(0, nombre) }, (_, index) => index);
    }

    protected dateDe(valeur: string): string {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur);
        if (!match) {
            return valeur;
        }
        const mois = Number(match[2]) - 1;
        if (mois < 0 || mois > 11) {
            return valeur;
        }
        return `${Number(match[3])} ${MOIS[mois]} ${match[1]}`;
    }

    protected retirerImage(nom: string): void {
        this.jeux.update((liste) => liste.map((jeu) => jeu.nom === nom ? { ...jeu, image: null } : jeu));
    }

    private async remplir(noms: string[]): Promise<void> {
        const jeton = ++this.jeton;
        const visuels: JeuVisuel[] = noms.map((nom) => ({ nom, image: null, lien: null }));
        for (let index = 0; index < noms.length; index++) {
            if (jeton !== this.jeton) {
                return;
            }
            visuels[index] = await visuelDuJeu(noms[index]);
            if (jeton !== this.jeton) {
                return;
            }
            this.jeux.set([...visuels]);
        }
    }
}
