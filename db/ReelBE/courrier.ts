import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

interface Transport {
    sendMail(options: { from: string; to: string; subject: string; text: string }): Promise<unknown>;
}

export function lienDuSite(): string {
    return process.env['DUNAMIS_LIEN_SITE']?.trim() || 'http://localhost:4200';
}

export async function envoyerLien(email: string, lien: string, choix: { maison?: string | null; primary?: string | null; underlying?: string | null }): Promise<void> {
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
        host: 'smtp.disroot.org',
        port: 587,
        secure: false,
        auth: { user, pass }
    });
    await transport.sendMail({
        from: `Dunamis Esports <${user}>`,
        to: email,
        subject: 'Confirme ton initiation — Dunamis Esports',
        text: [
            `Maison : ${choix?.maison || 'non choisie'}`,
            `Archétype principal : ${choix?.primary || 'non choisi'}`,
            `Archétype secondaire : ${choix?.underlying || 'non choisi'}`,
            '',
            'Pour terminer l\'initiation, ouvre ce lien :',
            lien,
            '',
            'Il reste valable deux jours.',
            'S\'il est dans les indésirables, sors-le de là avant de cliquer.'
        ].join('\n')
    });
}
