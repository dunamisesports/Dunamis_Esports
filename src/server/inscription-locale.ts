export async function inscrireEnLocal(request: Request): Promise<Response> {
    const { inscrireSurPi } = await import('../../db/ReelBE/membres')
    return inscrireSurPi(request)
}
