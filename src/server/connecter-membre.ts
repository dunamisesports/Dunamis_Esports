import { getDatabase } from '@netlify/database';
import { empreinteMotDePasse } from '../app/session/md5';
import type { MembreSession } from '../app/session/membre.session';

export async function connecterMembre(request: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Corps illisible.' }, { status: 400 });
    }
    const saisie = lireSaisie(body);
    if (!saisie) {
        return Response.json({ error: 'Dossier incomplet.' }, { status: 400 });
    }
    try {
        const db = getDatabase();
        const empreinte = empreinteMotDePasse(saisie.motDePasse);
        const rows = await db.sql`
            SELECT doc FROM membres
            WHERE doc->>'email' = ${saisie.email} AND doc->>'motDePasse' = ${empreinte}
            ORDER BY id DESC
            LIMIT 1
        `;
        const membre = lireDoc(rows);
        if (!membre) {
            return Response.json({ error: 'Connexion refusée.' }, { status: 401 });
        }
        return Response.json(membre);
    } catch {
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 });
    }
}

function lireSaisie(body: unknown): { email: string; motDePasse: string } | null {
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

function lireDoc(rows: unknown): MembreSession | null {
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
