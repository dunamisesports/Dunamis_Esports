import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Cible = 'dev' | 'prod'

export function urlActive(): string | null {
    const imposee = process.env['DUNAMIS_DB_URL']?.trim()
    if (imposee) {
        return imposee
    }
    try {
        return urlDeLaBase('dev')
    } catch {
        return null
    }
}

export function urlDeLaBase(cible: Cible): string {
    const brut = readFileSync(join(import.meta.dirname, `${cible}.env`), 'utf8')
    const ligne = brut.split(/\r?\n/).find((entree) => entree.startsWith('DUNAMIS_DB_URL='))
    const url = ligne?.slice('DUNAMIS_DB_URL='.length).trim()
    if (!url) {
        throw new Error(`DUNAMIS_DB_URL absente de ${cible}.env`)
    }
    return url
}
