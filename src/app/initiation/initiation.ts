import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, inject, OnDestroy, output, signal, viewChild } from '@angular/core';
import { DunaQuestionnaire } from '../src/Components/duna-questionnaire/duna-questionnaire';
import { appel } from '../session/api';
import { MembreSession, MembreStore } from '../session/membre.session';
import { HouseChoice, HOUSES } from '../maison/maisons';
import { playedGames } from './games';

interface Brouillon {
    email: string;
    pseudo: string;
    birthdate: string;
    genre: string;
    jeux: string[];
    motDePasse: string;
    profilEnregistre: boolean;
    maison: string | null;
    maisonConfirmee: boolean;
    reponses: Array<number | null>;
    hexadVu: boolean;
    primary: string | null;
    underlying: string | null;
}

interface ProfilSaisi {
    email: string;
    pseudo: string;
    birthdate: string;
    genre: MembreSession['genre'];
    jeux: string[];
    motDePasse: string;
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

    protected readonly creedVideo = 'videos/DunaCreed.mp4';
    protected readonly games = playedGames;
    protected readonly gameQuery = signal('');
    protected readonly profilSaved = signal(false);
    protected readonly showPasswords = signal(false);
    protected readonly profilError = signal<string | null>(null);
    protected readonly closeError = signal<string | null>(null);
    protected readonly attente = signal<string | null>(null);
    protected readonly closing = signal(false);
    private readonly profil = signal<ProfilSaisi | null>(null);
    private reprise: Brouillon | null = null;
    readonly closed = output<MembreSession>();
    protected readonly house = signal<string | null>(null);
    protected readonly confirmed = signal(false);
    protected readonly hexadVu = signal(false);
    protected readonly creedRevealed = computed(() => this.profilSaved() && this.hexadVu() && this.confirmed());
    protected readonly modalOpen = signal(false);
    protected readonly houses = HOUSES;

    constructor() {
        this.restaurerLocal();
        afterNextRender(() => {
            this.document.documentElement.style.scrollSnapType = 'none';
            this.document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
            this.snapCleared = true;
            this.bindFolds();
            this.remplirFormulaire();
            const reprise = this.reprise;
            if (reprise) {
                this.questionnaire().reprendre(reprise.reponses, reprise.hexadVu, reprise.primary, reprise.underlying);
            }
            if (this.profil() && !this.questionnaire().hexadVisible()) {
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
        this.ecrireBrouillon({ maison: id, maisonConfirmee: false });
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
        const maison = this.house();
        if (!maison) {
            return;
        }
        this.confirmed.set(true);
        this.modalOpen.set(false);
        this.ecrireBrouillon({ maison, maisonConfirmee: true });
        this.revelerSermentSiPret();
    }

    protected reporterMaison(): void {
        if (this.confirmed()) {
            return;
        }
        this.house.set(null);
        this.confirmed.set(true);
        this.ecrireBrouillon({ maison: null, maisonConfirmee: true });
        this.revelerSermentSiPret();
    }

    private revelerSermentSiPret(): void {
        if (!this.creedRevealed()) {
            return;
        }
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
        const brouillon = this.lireBrouillon();
        if (!brouillon) {
            return;
        }
        this.reprise = brouillon;
        const profil = this.profilComplet(brouillon);
        if (profil) {
            this.profil.set(profil);
            this.profilSaved.set(true);
        }
        this.hexadVu.set(brouillon.hexadVu);
        if (brouillon.maison) {
            this.house.set(brouillon.maison);
        }
        if (brouillon.maisonConfirmee) {
            this.confirmed.set(true);
        }
    }

    protected suivreSaisie(event: Event): void {
        const cible = event.target;
        if (cible instanceof HTMLElement && cible.classList.contains('game-search')) {
            return;
        }
        const form = event.currentTarget;
        if (!(form instanceof HTMLFormElement)) {
            return;
        }
        const data = new FormData(form);
        this.profil.set(null);
        this.profilSaved.set(false);
        this.ecrireBrouillon({
            email: String(data.get('email') ?? ''),
            pseudo: String(data.get('pseudo') ?? ''),
            birthdate: String(data.get('birthdate') ?? ''),
            genre: String(data.get('genre') ?? ''),
            jeux: data.getAll('jeux').map(String),
            motDePasse: String(data.get('motDePasse') ?? ''),
            profilEnregistre: false
        });
    }

    protected garderQuestionnaire(): void {
        const questionnaire = this.questionnaire();
        const avant = this.hexadVu();
        const visible = questionnaire.hexadVisible();
        const noms = questionnaire.noms();
        this.hexadVu.set(visible);
        this.ecrireBrouillon({
            reponses: questionnaire.reponses(),
            hexadVu: visible,
            primary: noms.primary,
            underlying: noms.underlying
        });
        if (!avant && visible) {
            this.revelerSermentSiPret();
        }
    }

    private ecrireBrouillon(patch: Partial<Brouillon>): void {
        const suivant: Brouillon = { ...(this.lireBrouillon() ?? this.brouillonVide()), ...patch };
        this.reprise = suivant;
        this.ecrireJson('DunamisMembre', suivant);
        this.effacerAnciennesCles();
    }

    private lireBrouillon(): Brouillon | null {
        const parsed = this.lireJson('DunamisMembre');
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        const source = parsed as Record<string, unknown>;
        const email = this.texteLocal(source['email']);
        const pseudo = this.texteLocal(source['pseudo']);
        const birthdate = this.texteLocal(source['birthdate']);
        const genre = this.texteLocal(source['genre']);
        const motDePasse = typeof source['motDePasse'] === 'string' ? source['motDePasse'] : '';
        const jeuxSource = source['jeux'];
        const jeux = Array.isArray(jeuxSource) ? jeuxSource.filter((jeu): jeu is string => typeof jeu === 'string') : [];
        const maisonLu = this.texteOption(source['maison'], ['Concordia', 'Aequitas', 'Magisteria']);
        const primaryLu = this.texteOption(source['primary'], ['Sãmakh', 'Qãhal', 'Tùr', 'Bãnãh', 'Qasar', 'Nãsãh']);
        const underlyingLu = this.texteOption(source['underlying'], ['Sãmakh', 'Qãhal', 'Tùr', 'Bãnãh', 'Qasar', 'Nãsãh']);
        const maison = maisonLu ?? null;
        const primary = primaryLu ?? null;
        const underlying = underlyingLu ?? null;
        const genreValide = genre === 'Masculin' || genre === 'Féminin' || genre === 'Autre';
        const moderne = typeof source['profilEnregistre'] === 'boolean';
        const reponsesSource = source['reponses'];
        const reponses = Array.isArray(reponsesSource)
            ? reponsesSource.map((valeur) => typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : null)
            : [];
        return {
            email,
            pseudo,
            birthdate,
            genre,
            jeux,
            motDePasse,
            profilEnregistre: moderne
                ? source['profilEnregistre'] === true
                : Boolean(email && pseudo && birthdate && motDePasse && genreValide),
            maison,
            maisonConfirmee: typeof source['maisonConfirmee'] === 'boolean' ? source['maisonConfirmee'] : Boolean(maison),
            reponses,
            hexadVu: typeof source['hexadVu'] === 'boolean' ? source['hexadVu'] : Boolean(primary && underlying),
            primary,
            underlying
        };
    }

    private brouillonVide(): Brouillon {
        return {
            email: '',
            pseudo: '',
            birthdate: '',
            genre: '',
            jeux: [],
            motDePasse: '',
            profilEnregistre: false,
            maison: null,
            maisonConfirmee: false,
            reponses: [],
            hexadVu: false,
            primary: null,
            underlying: null
        };
    }

    private profilComplet(brouillon: Brouillon): ProfilSaisi | null {
        if (!brouillon.profilEnregistre || !brouillon.email || !brouillon.pseudo || !brouillon.birthdate || !brouillon.motDePasse) {
            return null;
        }
        if (brouillon.genre !== 'Masculin' && brouillon.genre !== 'Féminin' && brouillon.genre !== 'Autre') {
            return null;
        }
        return {
            email: brouillon.email,
            pseudo: brouillon.pseudo,
            birthdate: brouillon.birthdate,
            genre: brouillon.genre,
            jeux: brouillon.jeux,
            motDePasse: brouillon.motDePasse
        };
    }

    private oublierLocal(): void {
        if (typeof localStorage === 'undefined') {
            return;
        }
        localStorage.removeItem('DunamisMembre');
        this.effacerAnciennesCles();
        this.reprise = null;
    }

    private effacerAnciennesCles(): void {
        if (typeof localStorage === 'undefined') {
            return;
        }
        localStorage.removeItem('DunamisProfil');
        localStorage.removeItem('DunamisMaison');
        localStorage.removeItem('DunamisReponses');
        localStorage.removeItem('OccuBoard');
    }

    private remplirFormulaire(): void {
        const profil = this.profil();
        const reprise = this.reprise;
        const source = profil ?? (reprise ? {
            email: reprise.email,
            pseudo: reprise.pseudo,
            birthdate: reprise.birthdate,
            genre: reprise.genre,
            jeux: reprise.jeux,
            motDePasse: reprise.motDePasse
        } : null);
        const form = this.document.querySelector('form.identity-form');
        if (!source || !(form instanceof HTMLFormElement)) {
            return;
        }
        if (!source.email && !source.pseudo && !source.birthdate && !source.genre && !source.motDePasse && source.jeux.length === 0) {
            return;
        }
        this.ecrireChamp(form, 'email', source.email);
        this.ecrireChamp(form, 'pseudo', source.pseudo);
        this.ecrireChamp(form, 'birthdate', source.birthdate);
        this.ecrireChamp(form, 'genre', source.genre);
        this.ecrireChamp(form, 'motDePasse', source.motDePasse);
        this.ecrireChamp(form, 'confirmation', source.motDePasse);
        const choisis = new Set(source.jeux);
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
            this.ecrireBrouillon({ profilEnregistre: false });
            this.profilError.set('Les deux mots de passe doivent être identiques.');
            return;
        }
        if (genre !== 'Masculin' && genre !== 'Féminin' && genre !== 'Autre') {
            this.profil.set(null);
            this.profilSaved.set(false);
            this.ecrireBrouillon({ profilEnregistre: false });
            this.profilError.set('Choisis un genre.');
            return;
        }
        const genreChoisi = genre as ProfilSaisi['genre'];
        const saisi: ProfilSaisi = {
            email: String(data.get('email') ?? ''),
            pseudo: String(data.get('pseudo') ?? ''),
            birthdate: String(data.get('birthdate') ?? ''),
            genre: genreChoisi,
            jeux: data.getAll('jeux').map(String),
            motDePasse
        };
        this.profil.set(saisi);
        this.profilSaved.set(true);
        this.ecrireBrouillon({ ...saisi, profilEnregistre: true });
        this.profilError.set(null);
        this.closeError.set(null);
        const fold = (event.target as HTMLFormElement).closest('details');
        if (fold instanceof HTMLDetailsElement) {
            this.playFold(fold, false);
        }
        if (this.creedRevealed()) {
            this.revelerSermentSiPret();
            return;
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
        const brouillon = this.lireBrouillon();
        const profil = brouillon ? this.profilComplet(brouillon) : null;
        if (!profil) {
            this.closeError.set('Enregistre tes données personnelles avant de clore l\'initiation.');
            return;
        }
        if (this.closing()) {
            return;
        }
        this.closing.set(true);
        this.closeError.set(null);
        this.attente.set(null);
        const snap = this.questionnaire().snapshot();
        const maison = brouillon?.maisonConfirmee ? brouillon.maison : null;
        const payload: MembreSession = {
            email: profil.email,
            pseudo: profil.pseudo,
            birthdate: profil.birthdate,
            genre: profil.genre,
            jeux: profil.jeux,
            motDePasse: profil.motDePasse,
            primary: snap.primary?.DunaHEXADType ?? brouillon?.primary ?? null,
            underlying: snap.underlying?.DunaHEXADType ?? brouillon?.underlying ?? null,
            maison,
            rang: 'Initié(e)',
            etoiles: 0,
            chantiers: []
        };
        try {
            const response = await appel('/api/membres', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.status === 202) {
                this.attente.set(profil.email);
                return;
            }
            if (!response.ok) {
                const corps = await response.json().catch(() => null) as { error?: string } | null;
                console.error('[initiation]', response.status, corps?.error ?? 'réponse refusée');
                this.closeError.set(corps?.error ?? 'L\'envoi vers la base a échoué.');
                return;
            }
            const saved = await response.json() as MembreSession;
            this.oublierLocal();
            this.membres.ouvrir(saved);
            this.document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
            this.closed.emit(saved);
        } catch (error) {
            console.error('[initiation]', error);
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
