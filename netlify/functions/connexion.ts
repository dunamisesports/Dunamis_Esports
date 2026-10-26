import { connecterMembre } from '../../src/server/connecter-membre';

export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Méthode refusée.' }, { status: 405 });
    }
    return connecterMembre(request);
}
