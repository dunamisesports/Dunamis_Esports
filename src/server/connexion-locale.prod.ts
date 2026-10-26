export function connecterEnLocal(_request: Request): Response {
    return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 });
}
