import { sessionSurPi } from '../../db/ReelBE/membres';

export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
        return Response.json({ error: 'Méthode refusée.' }, { status: 405 });
    }
    return sessionSurPi(request);
}
