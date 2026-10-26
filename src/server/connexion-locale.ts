export async function connecterEnLocal(request: Request): Promise<Response> {
    const { connecterSurPi } = await import('../../db/ReelBE/membres');
    return connecterSurPi(request);
}
