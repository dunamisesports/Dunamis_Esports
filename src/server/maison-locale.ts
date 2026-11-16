export async function choisirMaisonEnLocal(request: Request): Promise<Response> {
    const { choisirMaisonSurPi } = await import('../../db/ReelBE/membres');
    return choisirMaisonSurPi(request);
}
