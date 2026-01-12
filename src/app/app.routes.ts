import { Routes } from '@angular/router';
import { DunaQuestionnaire } from './src/Components/duna-questionnaire/duna-questionnaire';
import { DunaNews } from './src/Components/duna-news/duna-news';
import { DunaIdentity } from './src/Components/duna-identity/duna-identity';
import { DunaContact } from './src/Components/duna-contact/duna-contact';

export const routes: Routes = [
    { path: '', component: DunaNews },/*a changé en Home apres avoir fait le questionnaire i guess*/
    { path: "HexadQuiz", component: DunaQuestionnaire },
    { path: 'OurIdentity', component: DunaIdentity },
    { path: 'ContactUs', component: DunaContact }
];
