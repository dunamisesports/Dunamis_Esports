import postgres from 'postgres'
import { lireDoc, lireSaisie } from '../../src/server/connecter-membre'
import { empreinteMotDePasse } from '../../src/app/session/md5'
import { membrePourStockage } from '../../src/server/inscrire-membre'
import { urlActive } from './liaison'

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
        await db.unsafe('INSERT INTO membres (doc) VALUES ($1::jsonb)', [JSON.stringify(membre)])
    } catch (error) {
        console.error('[Pi]', error instanceof Error ? error.message : error)
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }
    return Response.json(membre)
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
        const rows = await db`
            SELECT doc FROM membres
            WHERE doc->>'email' = ${saisie.email} AND doc->>'motDePasse' = ${empreinte}
            ORDER BY id DESC
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
