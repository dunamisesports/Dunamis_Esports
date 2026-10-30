import { isDevMode } from '@angular/core';

const PI = 'https://raspberrypi.taild55581.ts.net';

export function appel(chemin: string, init: RequestInit = {}): Promise<Response> {
    const url = isDevMode() ? chemin : `${PI}${chemin}`;
    return fetch(url, { ...init, credentials: 'include' });
}
