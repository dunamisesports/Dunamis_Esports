import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
let charge = false;

function chargerEnv(): void {
    if (charge) {
        return;
    }
    const chemins = [
        join(import.meta.dirname, 'dev.env'),
        join(process.cwd(), 'db', 'ReelBE', 'dev.env')
    ];
    let brut = '';
    for (const chemin of chemins) {
        try {
            brut = readFileSync(chemin, 'utf8');
            break;
        } catch {
            brut = '';
        }
    }
    if (!brut) {
        return;
    }
    charge = true;
    for (const entree of brut.split(/\r?\n/)) {
        if (!entree || entree.startsWith('#')) {
            continue;
        }
        const coupe = entree.indexOf('=');
        if (coupe < 1) {
            continue;
        }
        const cle = entree.slice(0, coupe).trim();
        let valeur = entree.slice(coupe + 1).trim();
        if ((valeur.startsWith('"') && valeur.endsWith('"')) || (valeur.startsWith('\'') && valeur.endsWith('\''))) {
            valeur = valeur.slice(1, -1);
        }
        if (cle && process.env[cle] === undefined) {
            process.env[cle] = valeur;
        }
    }
}

interface Transport {
    sendMail(options: { from: string; to: string; subject: string; text: string; html: string }): Promise<unknown>;
}

export function lienDuSite(): string {
    chargerEnv();
    const lien = process.env['DUNAMIS_LIEN_SITE']?.trim() || 'http://localhost:4200';
    return lien.replace(/\/+$/, '');
}

export async function envoyerLien(email: string, lien: string, choix: { maison?: string | null; primary?: string | null; underlying?: string | null }): Promise<void> {
    chargerEnv();
    const user = process.env['DUNAMIS_SMTP_USER']?.trim();
    const pass = process.env['DUNAMIS_SMTP_PASS']?.trim();
    if (!user || !pass) {
        throw new Error('SMTP absent');
    }
    const nodemailer = require('nodemailer') as {
        createTransport(options: {
            host: string;
            port: number;
            secure: boolean;
            auth: { user: string; pass: string };
        }): Transport;
    };
    const transport = nodemailer.createTransport({
        host: 'disroot.org',
        port: 587,
        secure: false,
        auth: { user, pass }
    });
    const corps = corpsDuCourriel(choix, lien);
    await transport.sendMail({
        from: `Dunamis Esports <${user}>`,
        to: email,
        subject: 'Confirme ton initiation — Dunamis Esports',
        text: corps.text,
        html: corps.html
    });
}

function corpsDuCourriel(choix: { maison?: string | null; primary?: string | null; underlying?: string | null } | undefined, lien: string): { text: string; html: string } {
    const lignes: Array<[string, string]> = [
        ['Maison', choix?.maison || 'non choisie'],
        ['Archétype principal', choix?.primary || 'non choisi']
    ];
    if (choix?.underlying) {
        lignes.push(['Archétype secondaire', choix.underlying]);
    }
    const text = [
        ...lignes.map(([label, valeur]) => `${label} : ${valeur}`),
        '',
        'Pour terminer l\'initiation, ouvre ce lien :',
        lien,
        '',
        'Il reste valable deux jours.',
        'S\'il est dans les indésirables, sors-le de là avant de cliquer.'
    ].join('\n');
    const html = [
        ...lignes.map(([label, valeur]) => `<p><strong>${echapper(label)}</strong><br>${echapper(valeur)}</p>`),
        '<p>Pour terminer l\'initiation, ouvre ce lien :</p>',
        `<p><a href="${echapper(lien)}">Confirmer l'initiation</a></p>`,
        '<p>Il reste valable deux jours.<br>S\'il est dans les indésirables, sors-le de là avant de cliquer.</p>'
    ].join('\n');
    return { text, html };
}

function echapper(valeur: string): string {
    return valeur
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
