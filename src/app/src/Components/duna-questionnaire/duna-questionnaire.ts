import { Component } from '@angular/core';
import { eventNames } from 'node:process';


type Answers = {
    value: number,
    label: string

}
type DunaQR = {
    id: number,
    question: string,
    answers: Answers[]
}
type HEXADClass = {
    HEXADType: string,
    DunaHEXADType: string,
    Occurences: number
}

@Component({
    selector: 'app-duna-questionnaire',
    imports: [],
    templateUrl: './duna-questionnaire.html',
    styleUrl: './duna-questionnaire.css'
})

export class DunaQuestionnaire {
    HEXADType: string[] = ["Philanthropist", "Socializer", "Free Spirit", "Achiever", "Player", "Disruptor"];
    DunaHEXADType: string[] = ["Sãmakh", "Qãhal", "Tùr", "Bãnãh", "Qasar", "Nãsãh"];
    OccurencesHEXADType: number[] = [];
    finishedHEXADPersonnalClassification: HEXADClass[] = [];
    showHexad = false;
    hexadPath: string = '';

    questionReponses: DunaQR[] =
        [
            {
                id: 1,
                question: "Quand tu lances un nouveau jeu, ton premier réflexe est :",
                answers: [
                    { "value": 1, "label": "Voir comment je peux aider ou guider" },
                    { "value": 2, "label": "Chercher des gens avec qui jouer" },
                    { "value": 3, "label": "Explorer librement sans objectif précis" },
                    { "value": 4, "label": "Comprendre comment progresser efficacement" },
                    { "value": 5, "label": "Repérer les meilleures récompenses" },
                    { "value": 6, "label": "Tester les limites du système ou du PvP" }
                ]
            },
            {
                "id": 2,
                "question": "Ta plus grande satisfaction en jeu :",
                "answers": [
                    { "value": 1, "label": "Avoir aidé quelqu’un à réussir" },
                    { "value": 2, "label": "Partager un bon moment avec d’autres" },
                    { "value": 3, "label": "Découvrir quelque chose d’unique" },
                    { "value": 4, "label": "Atteindre un objectif difficile" },
                    { "value": 5, "label": "Obtenir un objet rare" },
                    { "value": 6, "label": "Prendre l’avantage sur les autres" }
                ]
            },
            {
                "id": 3,
                "question": "En équipe, ton rôle naturel :",
                "answers": [
                    { "value": 1, "label": "Support / mentor" },
                    { "value": 2, "label": "Médiateur / communicant" },
                    { "value": 3, "label": "Éclaireur / créatif" },
                    { "value": 4, "label": "Carry / optimisateur" },
                    { "value": 5, "label": "Farmer / looter" },
                    { "value": 6, "label": "Leader dominant / shotcaller" }
                ]
            },
            {
                "id": 4,
                "question": "Ce qui te motive à revenir sur un jeu :",
                "answers": [
                    { "value": 1, "label": "Pouvoir aider davantage" },
                    { "value": 2, "label": "Retrouver la communauté" },
                    { "value": 3, "label": "Explorer de nouveaux contenus" },
                    { "value": 4, "label": "Continuer à progresser" },
                    { "value": 5, "label": "Gagner plus de récompenses" },
                    { "value": 6, "label": "Garder ton avantage sur les autres" }
                ]
            },
            {
                "id": 5,
                "question": "Si tu perds une partie, ce qui te frustre le plus :",
                "answers": [
                    { "value": 1, "label": "Ne pas avoir pu aider" },
                    { "value": 2, "label": "Avoir déçu les autres" },
                    { "value": 3, "label": "Ne pas avoir compris ce qui s’est passé" },
                    { "value": 4, "label": "Avoir mal joué" },
                    { "value": 5, "label": "Avoir raté une récompense" },
                    { "value": 6, "label": "T’être fait dominer" }
                ]
            },
            {
                "id": 6,
                "question": "Un objet rare apparaît :",
                "answers": [
                    { "value": 1, "label": "Tu penses à qui pourrait en profiter" },
                    { "value": 2, "label": "Tu veux le montrer / partager" },
                    { "value": 3, "label": "Tu veux comprendre son origine" },
                    { "value": 4, "label": "Tu veux l’optimiser" },
                    { "value": 5, "label": "Tu le veux absolument" },
                    { "value": 6, "label": "Tu veux empêcher les autres de l’avoir" }
                ]
            },
            {
                "id": 7,
                "question": "Dans un jeu long (MMO / sandbox), tu préfères :",
                "answers": [
                    { "value": 1, "label": "Aider les nouveaux joueurs" },
                    { "value": 2, "label": "Construire une guilde" },
                    { "value": 3, "label": "Tester plein de façons de jouer" },
                    { "value": 4, "label": "Optimiser ta progression" },
                    { "value": 5, "label": "Accumuler ressources et loot" },
                    { "value": 6, "label": "Contrôler une zone ou un rang" }
                ]
            },
            {
                "id": 8,
                "question": "Une nouvelle mécanique est ajoutée :",
                "answers": [
                    { "value": 1, "label": "Tu penses à comment elle peut aider" },
                    { "value": 2, "label": "Tu vois son impact social" },
                    { "value": 3, "label": "Tu veux l’expérimenter" },
                    { "value": 4, "label": "Tu veux la maîtriser" },
                    { "value": 5, "label": "Tu veux voir ce qu’elle rapporte" },
                    { "value": 6, "label": "Tu veux l’exploiter avant les autres" }
                ]
            },
            {
                "id": 9,
                "question": "Ton plus grand plaisir à long terme :",
                "answers": [
                    { "value": 1, "label": "Être reconnu comme utile" },
                    { "value": 2, "label": "Être reconnu socialement" },
                    { "value": 3, "label": "Tout comprendre du jeu" },
                    { "value": 4, "label": "Être excellent" },
                    { "value": 5, "label": "Être riche en jeu" },
                    { "value": 6, "label": "Être craint ou respecté" }
                ]
            },
            {
                "id": 10,
                "question": "Quand tu maîtrises un jeu :",
                "answers": [
                    { "value": 1, "label": "Tu aides les autres à progresser" },
                    { "value": 2, "label": "Tu renforces la communauté" },
                    { "value": 3, "label": "Tu explores les détails cachés" },
                    { "value": 4, "label": "Tu affines ton gameplay" },
                    { "value": 5, "label": "Tu optimises ton farming" },
                    { "value": 6, "label": "Tu imposes ton niveau" }
                ]
            },
            {
                "id": 11,
                "question": "Ce qui te ferait arrêter un jeu :",
                "answers": [
                    { "value": 1, "label": "Ne plus pouvoir aider" },
                    { "value": 2, "label": "Une communauté morte" },
                    { "value": 3, "label": "Plus rien à découvrir" },
                    { "value": 4, "label": "Plus de challenge" },
                    { "value": 5, "label": "Plus de récompenses" },
                    { "value": 6, "label": "Ne plus pouvoir dominer" }
                ]
            },
            {
                "id": 12,
                "question": "Tu préfères :",
                "answers": [
                    { "value": 1, "label": "Être utile" },
                    { "value": 2, "label": "Être entouré" },
                    { "value": 3, "label": "Être libre" },
                    { "value": 4, "label": "Être performant" },
                    { "value": 5, "label": "Être récompensé" },
                    { "value": 6, "label": "Être au-dessus" }
                ]
            },
            {
                "id": 13,
                "question": "En PvP (ou compétition) :",
                "answers": [
                    { "value": 1, "label": "Tu protèges ton équipe" },
                    { "value": 2, "label": "Tu coordonnes" },
                    { "value": 3, "label": "Tu t’adaptes" },
                    { "value": 4, "label": "Tu cherches à gagner proprement" },
                    { "value": 5, "label": "Tu veux les gains" },
                    { "value": 6, "label": "Tu veux écraser l’adversaire" }
                ]
            },
            {
                "id": 14,
                "question": "Les succès / achievements :",
                "answers": [
                    { "value": 1, "label": "S’ils ont du sens collectif" },
                    { "value": 2, "label": "S’ils sont visibles socialement" },
                    { "value": 3, "label": "S’ils débloquent du contenu" },
                    { "value": 4, "label": "S’ils prouvent la maîtrise" },
                    { "value": 5, "label": "S’ils donnent des récompenses" },
                    { "value": 6, "label": "S’ils imposent un statut" }
                ]
            },
            {
                "id": 15,
                "question": "Ce qui te décrit le mieux :",
                "answers": [
                    { "value": 1, "label": "Bienveillant" },
                    { "value": 2, "label": "Sociable" },
                    { "value": 3, "label": "Curieux" },
                    { "value": 4, "label": "Déterminé" },
                    { "value": 5, "label": "Opportuniste" },
                    { "value": 6, "label": "Dominant" }
                ]
            },
            {
                "id": 16,
                "question": "Si tu gagnes beaucoup :",
                "answers": [
                    { "value": 1, "label": "Tu partages" },
                    { "value": 2, "label": "Tu célèbres avec les autres" },
                    { "value": 3, "label": "Tu explores plus" },
                    { "value": 4, "label": "Tu montes encore le niveau" },
                    { "value": 5, "label": "Tu accumules" },
                    { "value": 6, "label": "Tu renforces ton pouvoir" }
                ]
            },
            {
                "id": 17,
                "question": "Ton rapport au risque :",
                "answers": [
                    { "value": 1, "label": "Tu prends des risques pour aider" },
                    { "value": 2, "label": "Tu évites de nuire au groupe" },
                    { "value": 3, "label": "Tu prends des risques pour tester" },
                    { "value": 4, "label": "Tu calcules les risques" },
                    { "value": 5, "label": "Tu prends les risques rentables" },
                    { "value": 6, "label": "Tu prends des risques pour dominer" }
                ]
            },
            {
                "id": 18,
                "question": "Ta phrase la plus vraie :",
                "answers": [
                    { "value": 1, "label": "« Si je peux aider, je le fais »" },
                    { "value": 2, "label": "« Ensemble, c’est mieux »" },
                    { "value": 3, "label": "« J’aime explorer sans limites »" },
                    { "value": 4, "label": "« Je veux devenir meilleur »" },
                    { "value": 5, "label": "« Le loot, c’est la vie »" },
                    { "value": 6, "label": "« Je veux être au sommet »" }
                ]
            }
        ]
    UIAnswers: number[] = [];

    fillFormMock(): void {

        // nombre de questions réelles
        const totalQuestions = 18;

        // reset au cas où
        this.UIAnswers = [];

        for (let i = 1; i < totalQuestions + 1; i++) {
            // valeur random entre 1 et 6
            const value = Math.floor(Math.random() * 6) + 1;
            this.UIAnswers[i] = value;
        }

    }
    setUiAnswers(indexQuestion: number, answer: Event) {
        let answerChoix = parseInt((answer.target as HTMLSelectElement).value);
        this.UIAnswers[indexQuestion] = answerChoix;
        //console.log("Question :" + indexQuestion + " ; Choix " + answerChoix);
        console.table(this.UIAnswers);
    }

    isQuizFullyAnwsered(): Boolean {
        let isQuizFullyAnwsered = true;
        console.log("isQuizFullyAnwsered LENGTH UIAnswers:" + this.UIAnswers.length);
        for (let i = 1; i < this.UIAnswers.length; i++) {
            if (this.UIAnswers[i] == undefined || isNaN(this.UIAnswers[i])) {
                isQuizFullyAnwsered = false;
                this.showHexad = false;
            }
        }
        return isQuizFullyAnwsered && this.UIAnswers.length !== 0;
    }

    buildHexadPathFromOccurences(): void {

        const MAX_RADIUS = 150;

        const AXES_ORDER = [
            'Sãmakh',
            'Qãhal',
            'Tùr',
            'Bãnãh',
            'Qasar',
            'Nãsãh'
        ];

        const angles = [-90, -30, 30, 90, 150, 210];

        let path = '';

        AXES_ORDER.forEach((axis, index) => {

            const angleRad = angles[index] * Math.PI / 180;

            const item = this.finishedHEXADPersonnalClassification
                .find(i => i.DunaHEXADType === axis);

            // 🔑 ICI la règle importante
            const occurences = item ? item.Occurences : 0;
            const MAX_PER_AXIS = 9;
            const t = Math.min(occurences, MAX_PER_AXIS) / MAX_PER_AXIS;

            // ⚠️ avant : t * MAX_RADIUS
            const radius = (0.7 * t) * MAX_RADIUS;

            const x = +(radius * Math.cos(angleRad)).toFixed(2);
            const y = +(radius * Math.sin(angleRad)).toFixed(2);

            if (index === 0) {
                path += `M${x},${y}`;
            } else {
                path += `L${x},${y}`;
            }
        });

        path += 'Z';

        this.hexadPath = path;
    }





    YourHEXADType(): any {
        let isQuizNotFullyAnwsered = !this.isQuizFullyAnwsered();
        if (isQuizNotFullyAnwsered) {
            console.log("in YourHEXADType ===> isQuizNotFullyAnwsered : " + isQuizNotFullyAnwsered)
            return null;
        }

        this.OccurencesHEXADType = [];
        console.log("LENGTH UIAnswers:" + this.UIAnswers.length);

        this.UIAnswers.map((i) => {
            console.log("IN MAP" + i);
            if (i !== undefined) {
                if (this.OccurencesHEXADType[i - 1] !== undefined)
                    this.OccurencesHEXADType[i - 1] = this.OccurencesHEXADType[i - 1] + 1;
                else
                    this.OccurencesHEXADType[i - 1] = 0 + 1;
            }

        })
        console.log(this.OccurencesHEXADType);
        console.log("LENGTH OccurencesHEXADType:" + this.OccurencesHEXADType.length);
        if (this.UIAnswers.length === 19) {
            for (let i = 0; i < this.OccurencesHEXADType.length; i++) {
                if (this.OccurencesHEXADType[i] !== undefined) {
                    this.finishedHEXADPersonnalClassification[i] = {
                        HEXADType: this.HEXADType[i],
                        DunaHEXADType: this.DunaHEXADType[i],
                        Occurences: this.OccurencesHEXADType[i]
                    }
                }
            }
            console.log(this.finishedHEXADPersonnalClassification);
            this.finishedHEXADPersonnalClassification.sort((a: HEXADClass, b: HEXADClass) => {
                return a.Occurences - b.Occurences;
            })
            console.log(this.finishedHEXADPersonnalClassification);

            this.buildHexadPathFromOccurences();
            this.showHexad = true;
        }
    }
}
