export interface JeuVisuel {
    nom: string;
    image: string | null;
    lien: string | null;
}

interface PageWikipedia {
    image: string | null;
    lien: string | null;
    ambigu: boolean;
}

export async function visuelDuJeu(nom: string): Promise<JeuVisuel> {
    const titres = await chercher(nom);
    let lien: string | null = null;
    let pageProche: JeuVisuel | null = null;
    for (const titre of titres.slice(0, 3)) {
        const page = await lire(titre);
        if (!page || page.ambigu) {
            continue;
        }
        const proche = rang(nom, titre) <= 2;
        if (page.image && proche) {
            return { nom, image: page.image, lien: page.lien };
        }
        if (proche && page.lien && !pageProche) {
            pageProche = { nom, image: null, lien: page.lien };
        }
        if (page.image && !proche && !pageProche) {
            return { nom, image: page.image, lien: page.lien };
        }
        lien ??= page.lien;
    }
    return pageProche ?? { nom, image: null, lien };
}

async function chercher(nom: string): Promise<string[]> {
    const url = 'https://en.wikipedia.org/w/api.php?action=opensearch&limit=5&namespace=0&format=json&origin=*'
        + '&search=' + encodeURIComponent(nom);
    const data = await lireJson(url);
    const titres = Array.isArray(data) ? data[1] : null;
    if (!Array.isArray(titres)) {
        return [];
    }
    return titres.filter((titre): titre is string => typeof titre === 'string').sort((a, b) => rang(nom, a) - rang(nom, b));
}

function rang(nom: string, titre: string): number {
    const voulu = nom.toLowerCase();
    const trouve = titre.toLowerCase();
    if (trouve === `${voulu} (video game)`) {
        return 0;
    }
    if (trouve.startsWith(`${voulu} (`) && trouve.includes('video game')) {
        return 1;
    }
    if (trouve === voulu) {
        return 2;
    }
    if (trouve.includes(voulu) && trouve.includes('video game')) {
        return 3;
    }
    if (trouve.includes(voulu)) {
        return 4;
    }
    return 5;
}

async function lire(titre: string): Promise<PageWikipedia | null> {
    const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(titre);
    const data = await lireJson(url);
    if (!data || typeof data !== 'object') {
        return null;
    }
    const page = data as {
        type?: string;
        title?: string;
        thumbnail?: { source?: string };
        content_urls?: { desktop?: { page?: string } };
    };
    if (page.title === 'Not found.') {
        return null;
    }
    const source = page.thumbnail?.source;
    const lien = page.content_urls?.desktop?.page;
    return {
        image: typeof source === 'string' ? source : null,
        lien: typeof lien === 'string' ? lien : null,
        ambigu: page.type === 'disambiguation'
    };
}

async function lireJson(url: string): Promise<unknown> {
    const response = await fetch(url);
    if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const retry = await fetch(url);
        if (!retry.ok) {
            return null;
        }
        return retry.json();
    }
    if (!response.ok) {
        return null;
    }
    return response.json();
}
