import { getDatabase } from '@netlify/database';
import { empreinteMotDePasse } from '../app/session/md5';
import type { MembreSession } from '../app/session/membre.session';

const GENRES = ['Masculin', 'Féminin', 'Autre'] as const;
const ARCHETYPES = ['Sãmakh', 'Qãhal', 'Tùr', 'Bãnãh', 'Qasar', 'Nãsãh'] as const;
const MAISONS = ['Concordia', 'Aequitas', 'Magisteria'] as const;

export async function inscrireMembre(request: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Corps illisible.' }, { status: 400 });
    }
    const membre = lireMembre(body);
    if (!membre) {
        return Response.json({ error: 'Dossier incomplet.' }, { status: 400 });
    }
    membre.motDePasse = empreinteMotDePasse(membre.motDePasse);
    membre.rang = 'Initié(e)';
    membre.etoiles = 0;
    membre.chantiers = [];
    try {
        const db = getDatabase();
        await db.sql`INSERT INTO membres (doc) VALUES (${JSON.stringify(membre)}::jsonb)`;
    } catch {
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 });
    }
    return Response.json(membre);
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
