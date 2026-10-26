import { empreinteMotDePasse } from '../app/session/md5';
import type { MembreSession } from '../app/session/membre.session';

const GENRES = ['Masculin', 'Féminin', 'Autre'] as const;
const ARCHETYPES = ['Sãmakh', 'Qãhal', 'Tùr', 'Bãnãh', 'Qasar', 'Nãsãh'] as const;
const MAISONS = ['Concordia', 'Aequitas', 'Magisteria'] as const;

export function membrePourStockage(body: unknown): MembreSession | null {
    const membre = lireMembre(body);
    if (!membre) {
        return null;
    }
    membre.motDePasse = empreinteMotDePasse(membre.motDePasse);
    membre.rang = 'Initié(e)';
    membre.etoiles = 0;
    membre.chantiers = [];
    return membre;
}

function lireMembre(body: unknown): MembreSession | null {
    if (!body || typeof body !== 'object') {
        return null;
    }
    const source = body as Record<string, unknown>;
    const email = texte(source['email']);
    const pseudo = texte(source['pseudo']);
    const birthdate = texte(source['birthdate']);
    const genre = texte(source['genre']);
    const motDePasse = texte(source['motDePasse']);
    const jeux = chaines(source['jeux']);
    const primary = option(source['primary'], ARCHETYPES);
    const underlying = option(source['underlying'], ARCHETYPES);
    const maison = option(source['maison'], MAISONS);
    if (!email || !pseudo || !birthdate || !motDePasse || !jeux) {
        return null;
    }
    if (!GENRES.includes(genre as typeof GENRES[number])) {
        return null;
    }
    if (primary === undefined || underlying === undefined || maison === undefined) {
        return null;
    }
    return {
        email,
        pseudo,
        birthdate,
        genre: genre as MembreSession['genre'],
        jeux,
        motDePasse,
        primary,
        underlying,
        maison,
        rang: 'Initié(e)',
        etoiles: 0,
        chantiers: []
    };
}

function texte(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function chaines(value: unknown): string[] | null {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        return null;
    }
    return value;
}

function option<T extends string>(value: unknown, allowed: readonly T[]): T | null | undefined {
    if (value === null) {
        return null;
    }
    if (typeof value !== 'string') {
        return undefined;
    }
    return allowed.includes(value as T) ? value as T : undefined;
}
