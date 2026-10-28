export async function lireSessionEnLocal(request: Request): Promise<Response> {
    const { sessionSurPi } = await import('../../db/ReelBE/membres')
    return sessionSurPi(request)
}

export async function deconnecterEnLocal(request: Request): Promise<Response> {
    const { deconnecterSurPi } = await import('../../db/ReelBE/membres')
    return deconnecterSurPi(request)
}
