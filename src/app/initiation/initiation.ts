import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, inject, OnDestroy, output, signal, viewChild } from '@angular/core';
import { DunaQuestionnaire } from '../src/Components/duna-questionnaire/duna-questionnaire';
import { MembreSession, MembreStore } from '../session/membre.session';
import { empreinteMotDePasse } from '../session/md5';
import { playedGames } from './games';

interface ProfilSaisi {
    email: string;
    pseudo: string;
    birthdate: string;
    genre: MembreSession['genre'];
    jeux: string[];
    motDePasse: string;
}

interface HouseChoice {
    id: string;
    cssClass: string;
    title: string;
    affiliation: string;
    value: string;
    image: string;
    mark: string;
    mottoEn: string;
    mottoFr: string;
    body: string;
    philosophy: string;
    virtues: string;
    ideal: string;
}

@Component({
    selector: 'app-initiation',
    imports: [DunaQuestionnaire],
    templateUrl: './initiation.html',
    styleUrl: './initiation.css'
})
export class Initiation implements OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly membres = inject(MembreStore);
    private readonly questionnaire = viewChild.required(DunaQuestionnaire);
    private snapCleared = false;

    protected readonly creedVideo = '/videos/DunaCreed.mp4';
    protected readonly games = playedGames;
    protected readonly gameQuery = signal('');
    protected readonly profilSaved = signal(false);
    protected readonly showPasswords = signal(false);
    protected readonly profilError = signal<string | null>(null);
    protected readonly closeError = signal<string | null>(null);
    protected readonly closing = signal(false);
    private readonly profil = signal<ProfilSaisi | null>(null);
    private readonly reserve = signal<MembreSession | null>(null);
    readonly closed = output<MembreSession>();
    protected readonly house = signal<string | null>(null);
    protected readonly confirmed = signal(false);
    protected readonly creedRevealed = signal(false);
    protected readonly modalOpen = signal(false);
    protected readonly houses: HouseChoice[] = [
        {
            id: 'Concordia',
            cssClass: 'OfTheConcordia',
            title: 'De la Concordia',
            affiliation: 'Of the Concordia',
            value: 'Unité',
            image: '/img/codexprincipia/OfTheConcordiaT.png',
            mark: '🏛️',
            mottoEn: 'Strength Through Unity.',
            mottoFr: "La force par l'unité.",
            body: "Concordia repose sur la conviction que la force d'un collectif dépasse celle de ses individualités lorsqu'elles apprennent à avancer ensemble. Elle cultive la fraternité, la solidarité et la cohésion, en faisant de l'entraide une force plutôt qu'une faiblesse. Elle invite chacun à dépasser ses intérêts personnels lorsque le bien commun l'exige, à soutenir ses compagnons dans l'épreuve et à contribuer à la réussite de tous. Choisir Concordia, c'est aspirer à devenir un pilier du collectif, capable de rassembler les différences et de transformer des individualités en une force unie.",
            philosophy: "la grandeur individuelle prend tout son sens lorsqu'elle contribue à la force collective.",
            virtues: 'fraternité, solidarité, loyauté et coopération.',
            ideal: 'être plus fort ensemble que seul.'
        },
        {
            id: 'Aequitas',
            cssClass: 'OfTheAequitas',
            title: "De l'Aequitas",
            affiliation: 'Of the Aequitas',
            value: 'Équité',
            image: '/img/codexprincipia/OfTheAequitasT.png',
            mark: '⚖️',
            mottoEn: 'Justice Beyond Judgment.',
            mottoFr: 'La justice au-delà du jugement.',
            body: "Aequitas repose sur la conviction que la justice exige davantage que l'application aveugle de règles : elle demande discernement, intégrité et considération pour autrui. Elle défend l'équité dans le traitement de chacun, la responsabilité face à ses actes et le refus des jugements précipités. Elle reconnaît que l'erreur ne doit pas systématiquement condamner, mais peut devenir un point de départ vers la compréhension, la réparation et le progrès. Choisir Aequitas, c'est aspirer à devenir une personne juste et intègre, capable de tenir ses principes sans renoncer à son discernement, et de faire preuve de fermeté sans perdre son humanité.",
            philosophy: "rendre justice, c'est rechercher ce qui est juste avec discernement, sans confondre équité et traitement aveuglement identique.",
            virtues: 'intégrité, impartialité, discernement et responsabilité.',
            ideal: "agir avec justice sans renoncer à l'humanité."
        },
        {
            id: 'Magisteria',
            cssClass: 'OfTheMagisteria',
            title: 'De La Magisteria',
            affiliation: 'Of the Magisteria',
            value: 'Maîtrise',
            image: '/img/codexprincipia/OfTheMagisteriaT.png',
            mark: '🐉',
            mottoEn: 'We Must Learn. We Will Learn.',
            mottoFr: 'Nous devons apprendre. Nous apprendrons.',
            body: "Magisteria repose sur la conviction que la maîtrise ne s'acquiert ni par le hasard ni par le talent seul, mais par l'étude, l'effort et la persévérance. Elle valorise la connaissance, la discipline et la recherche constante du progrès, considérant chaque erreur comme une occasion d'apprendre et chaque limite comme un défi à dépasser. Elle invite chacun à ne jamais se satisfaire de ses acquis, à comprendre avant d'agir et à perfectionner continuellement son savoir-faire. Choisir Magisteria, c'est aspirer à devenir un artisan de sa propre excellence, conscient que la véritable maîtrise est moins un état à atteindre qu'une quête à poursuivre.",
            philosophy: "le potentiel ne devient maîtrise que lorsqu'il est cultivé par l'effort et la connaissance.",
            virtues: 'discipline, curiosité, persévérance et rigueur.',
            ideal: 'apprendre sans cesse pour repousser les limites de sa maîtrise.'
        }
    ];

    constructor() {
        this.restaurerLocal();
        afterNextRender(() => {
            this.document.documentElement.style.scrollSnapType = 'none';
            this.document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
            this.snapCleared = true;
            this.bindFolds();
            this.remplirFormulaire();
            if (this.profil()) {
                const present = this.document.querySelector('details.present-fold');
                if (present instanceof HTMLDetailsElement) {
                    this.playFold(present, true);
                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this.snapCleared) {
            this.document.documentElement.style.scrollSnapType = '';
        }
    }

    protected choose(id: string): void {
        if (this.confirmed()) {
            return;
        }
        this.house.set(id);
    }

    protected selected(): HouseChoice | undefined {
        return this.houses.find((item) => item.id === this.house());
    }

    protected visibleHouses(): HouseChoice[] {
        if (!this.confirmed()) {
            return this.houses;
        }
        const chosen = this.house();
        return this.houses.filter((item) => item.id === chosen);
    }

    protected openModal(): void {
        this.modalOpen.set(true);
    }

    protected closeModal(): void {
        this.modalOpen.set(false);
    }

    protected confirmHouse(): void {
        this.confirmed.set(true);
        this.modalOpen.set(false);
        this.creedRevealed.set(true);
        this.playGrave();
        setTimeout(() => {
            const video = this.document.querySelector('.creed-video') as HTMLVideoElement | null;
            if (!video) {
                return;
            }
            this.tuneCreed(video);
            video.scrollIntoView({ behavior: 'smooth', block: 'center' });
            void video.play();
        }, 50);
    }

    protected onGameQuery(event: Event): void {
        this.gameQuery.set((event.target as HTMLInputElement).value);
    }

    protected gameListed(game: string): boolean {
        const query = this.foldGame(this.gameQuery());
        return !query || this.foldGame(game).includes(query);
    }

    protected listedGameCount(): number {
        return this.games.filter((game) => this.gameListed(game)).length;
    }

    private foldGame(value: string): string {
        return value.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    }

    private restaurerLocal(): void {
        const membre = this.lireMembreLocal();
        if (!membre) {
            return;
        }
        this.reserve.set(membre);
        this.profil.set({
            email: membre.email,
            pseudo: membre.pseudo,
            birthdate: membre.birthdate,
            genre: membre.genre,
            jeux: membre.jeux,
            motDePasse: membre.motDePasse
        });
        this.profilSaved.set(true);
        if (membre.maison) {
            this.house.set(membre.maison);
            this.confirmed.set(true);
            this.creedRevealed.set(true);
        }
    }

    private lireMembreLocal(): MembreSession | null {
        const parsed = this.lireJson('DunamisMembre');
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        const source = parsed as Record<string, unknown>;
        const email = this.texteLocal(source['email']);
        const pseudo = this.texteLocal(source['pseudo']);
        const birthdate = this.texteLocal(source['birthdate']);
        const genre = this.texteLocal(source['genre']);
        const motDePasse = this.texteLocal(source['motDePasse']);
        const jeux = source['jeux'];
        if (!email || !pseudo || !birthdate || !motDePasse || !Array.isArray(jeux)) {
            return null;
        }
        if (genre !== 'Masculin' && genre !== 'Féminin' && genre !== 'Autre') {
            return null;
        }
        if (jeux.some((jeu) => typeof jeu !== 'string')) {
            return null;
        }
        const maison = this.texteOption(source['maison'], ['Concordia', 'Aequitas', 'Magisteria']);
        const primary = this.texteOption(source['primary'], ['Sãmakh', 'Qãhal', 'Tùr', 'Bãnãh', 'Qasar', 'Nãsãh']);
        const underlying = this.texteOption(source['underlying'], ['Sãmakh', 'Qãhal', 'Tùr', 'Bãnãh', 'Qasar', 'Nãsãh']);
        if (maison === undefined || primary === undefined || underlying === undefined) {
            return null;
        }
        return {
            email,
            pseudo,
            birthdate,
            genre,
            jeux,
            motDePasse,
            primary,
            underlying,
            maison,
            rang: 'Initié(e)',
            etoiles: 0,
            chantiers: []
        };
    }

    private garderLocal(membre: MembreSession): void {
        const copie: MembreSession = {
            ...membre,
            motDePasse: empreinteMotDePasse(membre.motDePasse),
            rang: 'Initié(e)',
            etoiles: 0,
            chantiers: []
        };
        this.ecrireJson('DunamisMembre', copie);
        this.effacerAnciennesCles();
    }

    private oublierLocal(): void {
        if (typeof localStorage === 'undefined') {
            return;
        }
        localStorage.removeItem('DunamisMembre');
        this.effacerAnciennesCles();
    }

    private effacerAnciennesCles(): void {
        if (typeof localStorage === 'undefined') {
            return;
        }
        localStorage.removeItem('DunamisProfil');
        localStorage.removeItem('DunamisMaison');
        localStorage.removeItem('DunamisReponses');
    }

    private remplirFormulaire(): void {
        const profil = this.profil();
        const form = this.document.querySelector('form.identity-form');
        if (!profil || !(form instanceof HTMLFormElement)) {
            return;
        }
        this.ecrireChamp(form, 'email', profil.email);
        this.ecrireChamp(form, 'pseudo', profil.pseudo);
        this.ecrireChamp(form, 'birthdate', profil.birthdate);
        this.ecrireChamp(form, 'genre', profil.genre);
        const choisis = new Set(profil.jeux);
        form.querySelectorAll('input[name="jeux"]').forEach((node) => {
            if (node instanceof HTMLInputElement) {
                node.checked = choisis.has(node.value);
            }
        });
    }

    private ecrireChamp(form: HTMLFormElement, name: string, value: string): void {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
            field.value = value;
        }
    }

    private lireJson(key: string): unknown {
        if (typeof localStorage === 'undefined') {
            return null;
        }
        const raw = localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw) as unknown;
        } catch {
            return null;
        }
    }

    private ecrireJson(key: string, value: unknown): void {
        if (typeof localStorage === 'undefined') {
            return;
        }
        localStorage.setItem(key, JSON.stringify(value));
    }

    private texteLocal(value: unknown): string {
        return typeof value === 'string' ? value.trim() : '';
    }

    private texteOption(value: unknown, allowed: readonly string[]): string | null | undefined {
        if (value === null) {
            return null;
        }
        if (typeof value !== 'string') {
            return undefined;
        }
        return allowed.includes(value) ? value : undefined;
    }

    protected saveProfil(event: Event): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        const motDePasse = String(data.get('motDePasse') ?? '');
        const confirmation = String(data.get('confirmation') ?? '');
        const genre = String(data.get('genre') ?? '');
        if (!motDePasse || motDePasse !== confirmation) {
            this.profil.set(null);
            this.profilSaved.set(false);
            this.profilError.set('Les deux mots de passe doivent être identiques.');
            return;
        }
        if (genre !== 'Masculin' && genre !== 'Féminin' && genre !== 'Autre') {
            this.profil.set(null);
            this.profilSaved.set(false);
            this.profilError.set('Choisis un genre.');
            return;
        }
        const genreChoisi = genre as ProfilSaisi['genre'];
        this.profil.set({
            email: String(data.get('email') ?? ''),
            pseudo: String(data.get('pseudo') ?? ''),
            birthdate: String(data.get('birthdate') ?? ''),
            genre: genreChoisi,
            jeux: data.getAll('jeux').map(String),
            motDePasse
        });
        this.profilSaved.set(true);
        this.profilError.set(null);
        this.closeError.set(null);
        const fold = (event.target as HTMLFormElement).closest('details');
        if (fold instanceof HTMLDetailsElement) {
            this.playFold(fold, false);
        }
        const present = this.document.querySelector('details.present-fold');
        if (present instanceof HTMLDetailsElement) {
            this.playFold(present, true);
            const reveal = () => {
                const top = present.getBoundingClientRect().top + this.document.documentElement.scrollTop - 200;
                this.document.defaultView?.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            };
            this.document.defaultView?.setTimeout(reveal, 460);
        }
    }

    private bindFolds(): void {
        const folds = this.document.querySelectorAll('details.initiation-fold, details.present-fold');
        folds.forEach((node) => {
            if (!(node instanceof HTMLDetailsElement)) {
                return;
            }
            const body = node.querySelector(':scope > .fold-body');
            const summary = node.querySelector(':scope > summary');
            if (!(body instanceof HTMLElement) || !(summary instanceof HTMLElement)) {
                return;
            }
            body.style.overflow = 'clip';
            body.style.transition = 'height 0.4s ease, opacity 0.4s ease';
            summary.addEventListener('click', (event) => {
                event.preventDefault();
                this.toggleFold(node, body);
            });
        });
    }

    private playFold(fold: HTMLDetailsElement, open: boolean): void {
        const body = fold.querySelector(':scope > .fold-body');
        if (!(body instanceof HTMLElement) || fold.open === open) {
            fold.open = open;
            return;
        }
        this.toggleFold(fold, body);
    }

    private toggleFold(fold: HTMLDetailsElement, body: HTMLElement): void {
        const view = this.document.defaultView;
        if (view?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            fold.open = !fold.open;
            body.style.height = '';
            body.style.opacity = '';
            return;
        }
        const finish = (open: boolean) => {
            fold.open = open;
            body.style.height = open ? 'auto' : '';
            body.style.opacity = '';
        };
        if (fold.open) {
            body.style.height = `${body.scrollHeight}px`;
            body.style.opacity = '1';
            void body.offsetHeight;
            body.style.height = '0px';
            body.style.opacity = '0';
            this.afterFoldMotion(body, () => finish(false));
            return;
        }
        fold.open = true;
        body.style.height = '0px';
        body.style.opacity = '0';
        void body.offsetHeight;
        body.style.height = `${body.scrollHeight}px`;
        body.style.opacity = '1';
        this.afterFoldMotion(body, () => finish(true));
    }

    private afterFoldMotion(body: HTMLElement, done: () => void): void {
        let settled = false;
        const finish = () => {
            if (settled) {
                return;
            }
            settled = true;
            body.removeEventListener('transitionend', onEnd);
            done();
        };
        const onEnd = (event: Event) => {
            if (event instanceof TransitionEvent && event.propertyName !== 'height') {
                return;
            }
            finish();
        };
        body.addEventListener('transitionend', onEnd);
        this.document.defaultView?.setTimeout(finish, 460);
    }

    protected async closeInitiation(): Promise<void> {
        const profil = this.profil();
        if (!profil) {
            this.closeError.set('Enregistre tes données personnelles avant de clore l\'initiation.');
            return;
        }
        if (this.closing()) {
            return;
        }
        this.closing.set(true);
        this.closeError.set(null);
        const snap = this.questionnaire().snapshot();
        const maison = this.selected();
        const garde = this.reserve();
        const payload: MembreSession = {
            email: profil.email,
            pseudo: profil.pseudo,
            birthdate: profil.birthdate,
            genre: profil.genre,
            jeux: profil.jeux,
            motDePasse: profil.motDePasse,
            primary: snap.primary?.DunaHEXADType ?? garde?.primary ?? null,
            underlying: snap.underlying?.DunaHEXADType ?? garde?.underlying ?? null,
            maison: maison?.id ?? garde?.maison ?? null,
            rang: 'Initié(e)',
            etoiles: 0,
            chantiers: []
        };
        try {
            const response = await fetch('/api/membres', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                this.garderLocal(payload);
                this.closeError.set('L\'envoi vers la base a échoué.');
                return;
            }
            const saved = await response.json() as MembreSession;
            this.oublierLocal();
            this.membres.ouvrir(saved);
            this.document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
            this.closed.emit(saved);
        } catch {
            this.garderLocal(payload);
            this.closeError.set('L\'envoi vers la base a échoué.');
        } finally {
            this.closing.set(false);
        }
    }

    protected tuneCreed(event: Event | HTMLVideoElement): void {
        const video = event instanceof HTMLVideoElement ? event : event.target as HTMLVideoElement;
        video.volume = 0.1;
    }

    private playGrave(): void {
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
        gain.connect(ctx.destination);
        for (const frequency of [46, 62]) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = frequency;
            osc.connect(gain);
            osc.start();
            osc.stop(ctx.currentTime + 1.9);
        }
        setTimeout(() => void ctx.close(), 2100);
    }
}
