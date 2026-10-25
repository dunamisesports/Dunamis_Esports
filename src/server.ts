import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/app-engine.js'
import { inscrireMembre } from './server/inscrire-membre'

const angularAppEngine = new AngularAppEngine()

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
    const context = getContext()
    const url = new URL(request.url)
    if (url.pathname === '/api/membres' && request.method === 'POST') {
        return inscrireMembre(request)
    }

    const result = await angularAppEngine.handle(request, context)
    return result || new Response('La Page inexistante', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
