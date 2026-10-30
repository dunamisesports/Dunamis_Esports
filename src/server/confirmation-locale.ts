export async function confirmerEnLocal(request: Request): Promise<Response> {
    const { confirmerSurPi } = await import('../../db/ReelBE/membres');
    return confirmerSurPi(request);
}
