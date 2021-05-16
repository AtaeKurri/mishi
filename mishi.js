import { mishi } from "./module/config.js";
import MItem from "./module/MItem.js";
import MItemSheet from "./module/sheets/MItemSheet.js";
import MPersonnageSheet from "./module/sheets/MPersonnageSheet.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/mishi/templates/partials/character-stat-block.hbs",
        "systems/mishi/templates/partials/character-desc-block.hbs",
        "systems/mishi/templates/partials/character-skills-block.hbs",
        "systems/mishi/templates/partials/class-card.hbs",
        "systems/mishi/templates/partials/cp-card.hbs",
        "systems/mishi/templates/partials/sort-card.hbs"
    ];
    return loadTemplates(templatePaths);
}

Hooks.once("init", function() {
    console.log("Mishi | Initialized.");

    CONFIG.mishi = mishi;
    CONFIG.Item.entityClass = MItem;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("Mishi", MItemSheet, {makeDefault:true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("Mishi", MPersonnageSheet, {makeDefault:true});

    preloadHandlebarsTemplates();

    // Templates Helpers //
    Handlebars.registerHelper("getRarity", function (rarity) {
        const rare = CONFIG.mishi.Rarity;
        return rare[rarity];
    });
    Handlebars.registerHelper("getClassname", function (classType) {
        const classes = CONFIG.mishi.classes;
        return classes[classType];
    });
});

Hooks.on("renderChatMessage", (app, html, data) => {
    hightlightTaskCheckResult(app, html, data);
})

const hightlightTaskCheckResult = function (message, html, data) {
    if(!message.isRoll || !message.isContentVisible) {
        return;
    }

    const roll = message.roll;

    if(roll.results[0] <= 3) {
        html.find(".dice-total").addClass("CritSuccess")
    } else if(roll.results[0] >= 98) {
        html.find(".dice-total").addClass("CritFail")
    }
}