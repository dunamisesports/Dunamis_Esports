import type { MembreSession } from '../app/session/membre.session';

export function lireSaisie(body: unknown): { email: string; motDePasse: string } | null {
    if (!body || typeof body !== 'object') {
        return null;
    }
    const source = body as Record<string, unknown>;
    const email = typeof source['email'] === 'string' ? source['email'].trim() : '';
    const motDePasse = typeof source['motDePasse'] === 'string' ? source['motDePasse'].trim() : '';
    if (!email || !motDePasse) {
        return null;
    }
    return { email, motDePasse };
}

export function lireDoc(rows: unknown): MembreSession | null {
    const liste = Array.isArray(rows) ? rows : [];
    const premier = liste[0];
    if (!premier || typeof premier !== 'object') {
        return null;
    }
    const doc = (premier as { doc?: unknown }).doc;
    if (typeof doc === 'string') {
        try {
            return JSON.parse(doc) as MembreSession;
        } catch {
            return null;
        }
    }
    if (!doc || typeof doc !== 'object') {
        return null;
    }
    return doc as MembreSession;
}
