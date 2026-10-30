import { randomBytes } from 'node:crypto'
import postgres from 'postgres'
import { lireDoc, lireSaisie } from '../../src/server/connecter-membre'
import { empreinteMotDePasse } from '../../src/app/session/md5'
import { membrePourStockage } from '../../src/server/inscrire-membre'
import type { MembreSession } from '../../src/app/session/membre.session'
import { envoyerLien, lienDuSite } from './courrier'
import { urlActive } from './liaison'

const DUREE_SESSION = 14 * 24 * 60 * 60
const NOM_COOKIE = 'dunamis_session'

type Sql = ReturnType<typeof postgres>

let client: Sql | null = null
let clientUrl = ''

export async function inscrireSurPi(request: Request): Promise<Response> {
    const db = base()
    if (!db) {
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return Response.json({ error: 'Corps illisible.' }, { status: 400 })
    }
    const membre = membrePourStockage(body)
    if (!membre) {
        return Response.json({ error: 'Dossier incomplet.' }, { status: 400 })
    }
    try {
        const doc = JSON.parse(JSON.stringify(membre)) as MembreSession
        const deja = await db`SELECT id FROM membres WHERE doc->>'email' = ${doc.email} LIMIT 1`
        if (deja.length) {
            return Response.json({ error: 'Cet email est déjà initié.' }, { status: 409 })
        }
        const jeton = randomBytes(32).toString('base64url')
        await db`DELETE FROM inscriptions_attente WHERE email = ${doc.email}`
        await db`
            INSERT INTO inscriptions_attente (jeton, email, doc, expire_le)
            VALUES (${jeton}, ${doc.email}, ${db.json(JSON.parse(JSON.stringify(doc)))}, now() + interval '2 days')
        `
        const lien = `${lienDuSite()}/confirmation?jeton=${encodeURIComponent(jeton)}`
        try {
            await envoyerLien(doc.email, lien, doc)
        } catch (error) {
            await db`DELETE FROM inscriptions_attente WHERE jeton = ${jeton}`
            console.error('[Pi]', error instanceof Error ? error.message : error)
            return Response.json({ error: 'Le courriel n\'a pas pu partir.' }, { status: 502 })
        }
        return Response.json({ enAttente: true, email: doc.email }, { status: 202 })
    } catch (error) {
        console.error('[Pi]', error instanceof Error ? error.message : error)
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
}

export async function confirmerSurPi(request: Request): Promise<Response> {
    const db = base()
    if (!db) {
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return Response.json({ error: 'Corps illisible.' }, { status: 400 })
    }
    const jeton = body && typeof body === 'object' && typeof (body as { jeton?: unknown }).jeton === 'string'
        ? (body as { jeton: string }).jeton.trim()
        : ''
    if (!jeton) {
        return Response.json({ error: 'Lien incomplet.' }, { status: 400 })
    }
    try {
        const resultat = await db.begin(async (tx) => {
            const sql = tx as unknown as Sql
            const rows = await sql`
                SELECT doc FROM inscriptions_attente
                WHERE jeton = ${jeton} AND expire_le > now()
                LIMIT 1
            `
            const doc = lireDoc(rows)
            if (!doc?.email) {
                return null
            }
            const deja = await sql`SELECT id FROM membres WHERE doc->>'email' = ${doc.email} LIMIT 1`
            if (deja.length) {
                await sql`DELETE FROM inscriptions_attente WHERE jeton = ${jeton}`
                return { conflit: true as const }
            }
            const inserted = await sql<{ id: string }[]>`
                INSERT INTO membres (doc) VALUES (${sql.json(JSON.parse(JSON.stringify(doc)))})
                RETURNING id
            `
            const id = inserted[0]?.id
            if (!id) {
                return { echec: true as const }
            }
            const sessionJeton = randomBytes(32).toString('base64url')
            await sql`
                INSERT INTO sessions (jeton, membre_id, expire_le)
                VALUES (${sessionJeton}, ${id}, now() + interval '14 days')
            `
            await sql`DELETE FROM inscriptions_attente WHERE jeton = ${jeton}`
            return { membre: doc, sessionJeton }
        })
        if (!resultat) {
            return Response.json({ error: 'Ce lien n\'est plus valable.' }, { status: 400 })
        }
        if ('conflit' in resultat) {
            return Response.json({ error: 'Cet email est déjà initié.' }, { status: 409 })
        }
        if ('echec' in resultat || !('membre' in resultat)) {
            return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
        }
        return Response.json(resultat.membre, {
            headers: { 'Set-Cookie': enteteCookie(resultat.sessionJeton, request, DUREE_SESSION) }
        })
    } catch (error) {
        console.error('[Pi]', error instanceof Error ? error.message : error)
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
}

export async function connecterSurPi(request: Request): Promise<Response> {
    const db = base()
    if (!db) {
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return Response.json({ error: 'Corps illisible.' }, { status: 400 })
    }
    const saisie = lireSaisie(body)
    if (!saisie) {
        return Response.json({ error: 'Dossier incomplet.' }, { status: 400 })
    }
    try {
        const empreinte = empreinteMotDePasse(saisie.motDePasse)
        const rows = await db<{ id: string; doc: unknown }[]>`
            SELECT id, doc FROM membres
            WHERE doc->>'email' = ${saisie.email} AND doc->>'motDePasse' = ${empreinte}
            ORDER BY id DESC
            LIMIT 1
        `
        const membre = lireDoc(rows)
        const id = rows[0]?.id
        if (!membre || !id) {
            return Response.json({ error: 'Connexion refusée.' }, { status: 401 })
        }
        return await reponseAvecJeton(db, request, membre, id)
    } catch (error) {
        console.error('[Pi]', error instanceof Error ? error.message : error)
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
}

export async function sessionSurPi(request: Request): Promise<Response> {
    const jeton = lireJeton(request)
    if (!jeton) {
        return Response.json({ error: 'Connexion refusée.' }, { status: 401 })
    }
    const db = base()
    if (!db) {
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
    try {
        const rows = await db`
            SELECT m.doc FROM sessions AS s
            JOIN membres AS m ON m.id = s.membre_id
            WHERE s.jeton = ${jeton} AND s.expire_le > now()
            LIMIT 1
        `
        const membre = lireDoc(rows)
        if (!membre) {
            return Response.json({ error: 'Connexion refusée.' }, { status: 401 })
        }
        return Response.json(membre)
    } catch (error) {
        console.error('[Pi]', error instanceof Error ? error.message : error)
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
}

export async function deconnecterSurPi(request: Request): Promise<Response> {
    const db = base()
    const jeton = lireJeton(request)
    if (db && jeton) {
        try {
            await db`DELETE FROM sessions WHERE jeton = ${jeton}`
        } catch (error) {
            console.error('[Pi]', error instanceof Error ? error.message : error)
            return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
        }
    }
    return new Response(null, { status: 204, headers: { 'Set-Cookie': enteteCookie('', request, 0) } })
}

async function reponseAvecJeton(db: Sql, request: Request, membre: MembreSession, membreId: string): Promise<Response> {
    const jeton = randomBytes(32).toString('base64url')
    await db`
        INSERT INTO sessions (jeton, membre_id, expire_le)
        VALUES (${jeton}, ${membreId}, now() + interval '14 days')
    `
    return Response.json(membre, { headers: { 'Set-Cookie': enteteCookie(jeton, request, DUREE_SESSION) } })
}

function lireJeton(request: Request): string | null {
    const brut = request.headers.get('cookie') ?? ''
    const morceau = brut.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${NOM_COOKIE}=`))
    if (!morceau) {
        return null
    }
    const valeur = decodeURIComponent(morceau.slice(NOM_COOKIE.length + 1))
    return valeur || null
}

function enteteCookie(jeton: string, request: Request, maxAge: number): string {
    const secure = new URL(request.url).protocol === 'https:'
    return [
        `${NOM_COOKIE}=${encodeURIComponent(jeton)}`,
        'HttpOnly',
        'SameSite=Lax',
        'Path=/',
        `Max-Age=${maxAge}`,
        secure ? 'Secure' : ''
    ].filter(Boolean).join('; ')
}

function base(): Sql | null {
    const url = urlActive()
    if (!url) {
        return null
    }
    if (!client || clientUrl !== url) {
        void client?.end({ timeout: 1 })
        clientUrl = url
        client = postgres(url, { ssl: false, max: 1, connect_timeout: 8 })
    }
    return client
}
