export interface HouseChoice {
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

export const HOUSES: HouseChoice[] = [
    {
        id: 'Concordia',
        cssClass: 'OfTheConcordia',
        title: 'De la Concordia',
        affiliation: 'Of the Concordia',
        value: 'Unité',
        image: 'img/codexprincipia/OfTheConcordiaT.png',
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
        image: 'img/codexprincipia/OfTheAequitasT.png',
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
        image: 'img/codexprincipia/OfTheMagisteriaT.png',
        mark: '🐉',
        mottoEn: 'We Must Learn. We Will Learn.',
        mottoFr: 'Nous devons apprendre. Nous apprendrons.',
        body: "Magisteria repose sur la conviction que la maîtrise ne s'acquiert ni par le hasard ni par le talent seul, mais par l'étude, l'effort et la persévérance. Elle valorise la connaissance, la discipline et la recherche constante du progrès, considérant chaque erreur comme une occasion d'apprendre et chaque limite comme un défi à dépasser. Elle invite chacun à ne jamais se satisfaire de ses acquis, à comprendre avant d'agir et à perfectionner continuellement son savoir-faire. Choisir Magisteria, c'est aspirer à devenir un artisan de sa propre excellence, conscient que la véritable maîtrise est moins un état à atteindre qu'une quête à poursuivre.",
        philosophy: "le potentiel ne devient maîtrise que lorsqu'il est cultivé par l'effort et la connaissance.",
        virtues: 'discipline, curiosité, persévérance et rigueur.',
        ideal: 'apprendre sans cesse pour repousser les limites de sa maîtrise.'
    }
];
