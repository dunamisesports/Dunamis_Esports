import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/app-engine.js'

const angularAppEngine = new AngularAppEngine()

type NetlifyEdgeContext = {
    rewrite?: (destination: string) => Promise<Response> | Response
}

export async function netlifyAppEngineHandler(request: Request, edge?: NetlifyEdgeContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/membres' && request.method === 'POST') {
        if (edge?.rewrite) {
            return edge.rewrite('/.netlify/functions/membres')
        }
        return Response.json({ error: 'La base n\'est pas joignable.' }, { status: 503 })
    }

    const context = getContext()
    const result = await angularAppEngine.handle(request, context)
    return result || new Response('La Page inexistante', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
