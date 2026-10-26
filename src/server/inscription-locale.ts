export async function inscrireEnLocal(request: Request): Promise<Response> {
    await brancherBaseLocale()
    const { inscrireMembre } = await import('./inscrire-membre')
    return inscrireMembre(request)
}

async function brancherBaseLocale(): Promise<void> {
    if (process.env['NETLIFY_DB_URL']) {
        return
    }
    try {
        const { readFile } = await import('node:fs/promises')
        const { join } = await import('node:path')
        const raw = await readFile(join(process.cwd(), '.netlify', 'state.json'), 'utf8')
        const state = JSON.parse(raw) as { dbConnectionString?: unknown }
        if (typeof state.dbConnectionString === 'string' && state.dbConnectionString) {
            process.env['NETLIFY_DB_URL'] = state.dbConnectionString
        }
    } catch {
        return
    }
}
