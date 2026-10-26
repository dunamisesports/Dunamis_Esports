import { connecterSurPi } from '../../db/ReelBE/membres';

export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Méthode refusée.' }, { status: 405 });
    }
    return connecterSurPi(request);
}
