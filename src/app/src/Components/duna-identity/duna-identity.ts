import { Component } from '@angular/core';
import { DunaContact } from '../duna-contact/duna-contact';

@Component({
    selector: 'app-duna-identity',
    standalone: true,
    imports: [DunaContact],
    templateUrl: './duna-identity.html',
    styleUrl: './duna-identity.css'
})
export class DunaIdentity {

}
