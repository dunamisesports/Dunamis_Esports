import { Component, inject } from '@angular/core';
import { MembreStore } from '../session/membre.session';

@Component({
    selector: 'app-profil',
    imports: [],
    templateUrl: './profil.html',
    styleUrl: './profil.css'
})
export class Profil {
    protected readonly session = inject(MembreStore);
}
