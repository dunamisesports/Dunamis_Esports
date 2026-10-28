export function lireSessionEnLocal(_request: Request): Response {
    return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
}

export function deconnecterEnLocal(_request: Request): Response {
    return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
}
