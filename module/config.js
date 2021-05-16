export const mishi = {};

mishi.Magies = {
    none: "",
    basique: "Basique",
    divine: "Divine",
    cristal: "Cristal",
    cataclysmique: "Cataclysmique",
    satanique: "Satanique",
    haal: "Haal",
    tamaya: "Tamaya"
}

mishi.Especes = {
    none: "",
    shibafu: "Shibafu",
    ghanc: "Ghanc",
    chain: "Chain",
    hole: "Hole",
    reve: "Rêve",
    humain: "Humain",
    mimoh: "Mimoh",
    androide: "Androïde"
}

mishi.classes = {
    none: "",
    necromancien: "Nécromancien",
    magus: "Magus",
    tareahaal: "Tarea Haal",
    ecrivain: "Écrivain",
    manieurarme: "Manieur d'Armes",
    manieuroy: "Manieur d'Oy",
    oricite: "Oricite",
    assassin: "Assassin",
    bouki: "Bouki",
    technomancien: "Technomancien",
    germinale: "Germinale",
    spirite: "Spirite",
    solari: "Solari",
    pretresseeau: "Prêtresse de l'Eau",
    invocateurs: "Invocateurs",
    chronomancien: "Chronomancien",
    orateur: "Orateur",
    alchimiste: "Alchimiste"
}

mishi.Rarity = {
    Commun: "000000",
    Rare: "03b603",
    SuperRare: "0000ff",
    UltraRare: "ff0000",
    Legendaire: "f9a004"
}

mishi.technomancieoption = {
    Pirater: 3,
    Créer: 4,
    Supprimer: 3
}

mishi.cp = {
    a: {
        "name": "Repos, hors-combat, aucun danger ni adrénaline",
        "ctx": 80,
        "cost": 2
    },
    b: {
        "name": "Contexte tendu, situation instable",
        "ctx": 75,
        "cost": 2
    },
    c: {
        "name": "En combat rapproché",
        "ctx": 70,
        "cost": 3
    },
    d: {
        "name": "En combat éloigné",
        "ctx": 75,
        "cost": 3
    },
    e: {
        "name": "En situation complexe, pas le temps de penser",
        "ctx": 60,
        "cost": 4
    },
    f: {
        "name": "Situation extrêmement compliquée, une action doit être faite à ce moment précis",
        "ctx": 50,
        "cost": 5
    },
}

mishi.spes = {
    a: {
        "name": "Aucune connaissance (0)",
        "valeur": 0
    },
    b: {
        "name": "Basique (1)",
        "valeur": 1
    },
    c: {
        "name": "Novice (2)",
        "valeur": 2
    },
    d: {
        "name": "Habitué (3)",
        "valeur": 3
    },
    e: {
        "name": "Maître (4)",
        "valeur": 4
    },
    f: {
        "name": "Grand Maître (5)",
        "valeur": 5
    }
}