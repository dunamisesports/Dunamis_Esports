import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/app-engine.js'

const angularAppEngine = new AngularAppEngine()

type NetlifyEdgeContext = {
    rewrite?: (destination: string) => Promise<Response> | Response
}

export async function netlifyAppEngineHandler(request: Request, edge?: NetlifyEdgeContext): Promise<Response> {
    const url = new URL(request.url)
    console.log('[SSR ENTRY]', request.method, url.pathname)
    console.log('[SSR EDGE REWRITE]', typeof edge?.rewrite)
    if (url.pathname === '/api/membres' && request.method === 'POST') {
        console.log('[API INTERCEPTED]')
        if (edge?.rewrite) {
            return edge.rewrite('/.netlify/functions/membres')
        }
        const { inscrireEnLocal } = await import('./server/inscription-locale')
        return inscrireEnLocal(request)
    }
    if (url.pathname === '/api/connexion' && request.method === 'POST') {
        if (edge?.rewrite) {
            return edge.rewrite('/.netlify/functions/connexion')
        }
        const { connecterEnLocal } = await import('./server/connexion-locale')
        return connecterEnLocal(request)
    }
    if (url.pathname === '/api/session' && request.method === 'GET') {
        if (edge?.rewrite) {
            return edge.rewrite('/.netlify/functions/session')
        }
        const { lireSessionEnLocal } = await import('./server/session-locale')
        return lireSessionEnLocal(request)
    }
    if (url.pathname === '/api/deconnexion' && request.method === 'POST') {
        if (edge?.rewrite) {
            return edge.rewrite('/.netlify/functions/deconnexion')
        }
        const { deconnecterEnLocal } = await import('./server/session-locale')
        return deconnecterEnLocal(request)
    }

    const context = getContext()
    const result = await angularAppEngine.handle(request, context)
    return result || new Response('La Page inexistante', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
