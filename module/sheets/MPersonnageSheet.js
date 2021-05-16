export default class MPersonnageSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["mishi", "sheet", "personnage"],
            tabs: [{
                navSelector: ".tabs",
                contentSelector: ".content",
                initial: "description" }]
        });
    }
    
    get template() {
        return `systems/Mishi/templates/sheets/${this.actor.data.type}-sheet.hbs`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.mishi;
        data.grimoires = data.items.filter(function (item) {return item.type == "Grimoire" && item.data.Equipe == true});
        data.armes = data.items.filter(function (item) {return item.type == "Arme" && item.data.Equipe == true});
        data.armures = data.items.filter(function (item) {return item.type == "Armure" && item.data.Equipe == true});
        data.accessoires = data.items.filter(function (item) {return item.type == "Accessoire" && item.data.Equipe == true});
        data.sorts = data.items.filter(function (item) {return item.type == "Sort"});
        data.objets = data.items.filter(function (item) {return item.type == "Objet" || item.data.Equipe == false});
        return data;
    }

    activateListeners(html) {
        if (this.actor.owner) {
            html.find(".item-create").click(this._onItemCreate.bind(this));
            html.find(".item-delete").click(this._onItemDelete.bind(this));
            html.find(".inline-edit").change(this._onInlineEdit.bind(this));
            html.find(".inline-check-edit").change(this._onInlineCheckEdit.bind(this));
            html.find(".item-roll").click(this._onItemRoll.bind(this));
            html.find(".class-roll").click(this._onClassRoll.bind(this));
            html.find(".stats-test").click(this._onStatTest.bind(this));
            html.find(".cp-roll").click(this._onCpRoll.bind(this));
            html.find(".sort-edit").click(this._onSortEdit.bind(this));
            html.find(".sort-roll").click(this._onSortRoll.bind(this));
            html.find(".spé-test").click(this._onSpeRoll.bind(this));
        }

        super.activateListeners(html);
    }

    _onStatTest(event) {
        const testSeuil = event.currentTarget.closest(".stats-test").dataset.seuil;

        let rollFormula = `1d100[Seuil:${testSeuil*10}]`;

        let messageData = {
            speaker: ChatMessage.getSpeaker()
        }

        new Roll(rollFormula).roll().toMessage(messageData);
    }

    _onItemRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);

        item.roll();
    }

    async _onSpeRoll(event) {
        const testSeuil = event.currentTarget.closest(".spé-test").dataset.seuil;
        const test = event.currentTarget.closest(".spé-test").dataset.test;
        
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            formule: "1d6",
            description: `Test sur la spécialisation : ${test}`,
            seuil: testSeuil
        };

        chatData.content = await renderTemplate("systems/mishi/templates/partials/specialisation-card.hbs", cardData);
        chatData.roll = true;
        return ChatMessage.create(chatData);
    }

    async GetTaskCheckOptions(cost, costName) {
        const template = "systems/mishi/templates/partials/classcost-dialog.hbs";
        const htmlParams = {
            cost: cost,
            costName: costName,
            technomancieoption: CONFIG.mishi.technomancieoption
        }
        const html = await renderTemplate(template, htmlParams);

        return new Promise(resolve => {
            const data = {
                title: "Arguments",
                content: html,
                buttons: {
                    normal: {
                        label: "Accepter",
                        callback: html => resolve(_processTaskCheckOptions(html[0].querySelector("form")))
                    },
                    cancel: {
                        label: "Annuler",
                        callback: html => resolve({cancelled: true})
                    }
                },
                default: "normal",
                close: () => resolve({cancelled: true}) 
            }
            new Dialog(data, null).render(true);
        });
    }

    async GetCpRollOptions() {
        const template = "systems/mishi/templates/partials/cp-dialog.hbs";
        const htmlParams = {
            cp: CONFIG.mishi.cp
        }
        const html = await renderTemplate(template, htmlParams);

        return new Promise(resolve => {
            const data = {
                title: "Compétence Primaire",
                content: html,
                buttons: {
                    normal: {
                        label: "Accepter",
                        callback: html => resolve(_processCpRollOptions(html[0].querySelector("form")))
                    },
                    cancel: {
                        label: "Annuler",
                        callback: html => resolve({cancelled: true})
                    }
                },
                default: "normal",
                close: () => resolve({cancelled: true})
            }
            new Dialog(data, null).render(true);
        });
    }
    
    async GetSortEditOptions(itemData) {
        const template = "systems/mishi/templates/partials/sort-edit-dialog.hbs";
        const htmlParams = {
            sort: itemData
        }
        const html = await renderTemplate(template, htmlParams);

        return new Promise(resolve => {
            const data = {
                title: "Modifier un sort",
                content: html,
                buttons: {
                    normal: {
                        label: "Accepter",
                        callback: html => resolve(_processSortEditOptions(html[0].querySelector("form")))
                    },
                    cancel: {
                        label: "Annuler",
                        callback: html => resolve({cancelled: true})
                    }
                },
                default: "normal",
                close: () => resolve({cancelled: true})
            }
            new Dialog(data, null).render(true);
        });
    }

    async GetSortRollOptions(dataList) {
        const template = "systems/mishi/templates/partials/sort-variables-dialog.hbs";
        const htmlParams = {
            data: dataList
        }
        const html = await renderTemplate(template, htmlParams);

        return new Promise(resolve => {
            const data = {
                title: "Entrer des valeurs",
                content: html,
                buttons: {
                    normal: {
                        label: "Accepter",
                        callback: html => resolve(_processSortRollOptions(html[0].querySelector("form"), dataList))
                    },
                    cancel: {
                        label: "Annuler",
                        callback: html => resolve({cancelled: true})
                    }
                },
                default: "normal",
                close: () => resolve({cancelled: true})
            }
            new Dialog(data, null).render(true);
        });
    }


    _onClassRoll(event) {
        const className = event.currentTarget.closest(".class-roll").dataset.class;
        const classe = CONFIG.mishi.classes;

        let classesFormulas = {
            necromancien: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.INT.value}+${this.actor.data.data.SAV.value})`,
                "cost": "2+{}",
                "costName": "Personnes contrôlées"
            },
            magus: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.FOR.value}+${this.actor.data.data.AGI.value}+${this.actor.data.data.OY.value})`,
                "cost": "4",
                "costName": ""
            },
            tareahaal: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.FOR.value}+${this.actor.data.data.PER.value})`,
                "cost": "3",
                "costName": ""
            },
            ecrivain: {
                "formula": `68+15/27*(${this.actor.data.data.INT.value}+${this.actor.data.data.SAV.value})`,
                "cost": "",
                "costName": ""
            },
            manieurarme: {
                "formula": `68+15/27*(${this.actor.data.data.FOR.value}+${this.actor.data.data.AGI.value})`,
                "cost": "",
                "costName": ""
            },
            manieuroy: {
                "formula": `68+15/27*(${this.actor.data.data.FOR.value}+${this.actor.data.data.OY.value})`,
                "cost": "",
                "costName": ""
            },
            oricite: {
                "formula": `68+15/27*(${this.actor.data.data.FOR.value}+${this.actor.data.data.SAV.value})`,
                "cost": "",
                "costName": ""
            },
            assassin: {
                "formula": `68+15/27*(${this.actor.data.data.AGI.value}+${this.actor.data.data.PER.value})`,
                "cost": "",
                "costName": ""
            },
            bouki: {
                "formula": `68+15/27*(${this.actor.data.data.SOC.value}+${this.actor.data.data.INT.value}+${this.actor.data.data.PER.value})`,
                "cost": "",
                "costName": ""
            },
            technomancien: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.SAV.value}+${this.actor.data.data.INT.value})`,
                "cost": "{}",
                "costName": "Technomancie"
            },
            germinale: {
                "formula": `68+15/27*(${this.actor.data.data.INT.value})`,
                "cost": "2",
                "costName": ""
            },
            spirite: {
                "formula": `68+15/27*(${this.actor.data.data.INT.value}+${this.actor.data.data.SOC.value})`,
                "cost": "3",
                "costName": ""
            },
            solari: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value})`,
                "cost": "2",
                "costName": ""
            },
            pretresseeau: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.INT.value})`,
                "cost": "2",
                "costName": ""
            },
            invocateurs: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.SAV.value}+${this.actor.data.data.INT.value})`,
                "cost": "({}/2)+2",
                "costName": "Durée (en minutes)"
            },
            chronomancien: {
                "formula": `68+15/27*(${this.actor.data.data.MAG.value}+${this.actor.data.data.SAV.value}+${this.actor.data.data.INT.value})`,
                "cost": "({}/2)+2",
                "costName": "Durée (en secondes)"
            },
            orateur: {
                "formula": `68+15/27*(${this.actor.data.data.SOC.value}+${this.actor.data.data.MAG.value})`,
                "cost": "1.5*{}",
                "costName": "Nbr de mots"
            },
            alchimiste: {
                "formula": `68+15/27*(${this.actor.data.data.INT.value}+${this.actor.data.data.SAV.value}+${this.actor.data.data.OY.value})`,
                "cost": "",
                "costName": ""
            }
        }
        
        this._classRoll(classesFormulas[className], classe[className]);
    }

    _onCpRoll(event) {
        const cpName = event.currentTarget.closest(".cp-roll").dataset.type;
        this._cpRoll(cpName);
    }

    _onSortEdit(event) {
        const sortName = event.currentTarget.closest(".sort-edit").dataset.sortid;
        let item = this.actor.getOwnedItem(sortName);
        this._sortEdit(item);
    }

    _onSortRoll(event) {
        const sortID = event.currentTarget.closest(".sort-roll").dataset.sortid;
        let sort = this.actor.getOwnedItem(sortID);
        this._sortRoll(sort);
    }

    async _classRoll(classeFormula, className) {

        let cost = classeFormula["cost"]

        if (classeFormula["costName"] != "") {
            let checkOptions = await this.GetTaskCheckOptions(cost, classeFormula["costName"]);
    
            if (checkOptions.cancelled) {
                return;
            }
    
            let modificateur = checkOptions.modificateur;
            let oldcost = classeFormula["cost"];
            cost = oldcost.replace("{}", modificateur);
        }
        
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            formule: `floor(${classeFormula["formula"]})`,
            cost: `floor(${cost})`,
            name: className,
            actorData: game.actors.getName(this.actor.name)
        };

        chatData.content = await renderTemplate("systems/mishi/templates/partials/class-card.hbs", cardData);
        chatData.roll = true;
        return ChatMessage.create(chatData);
    }

    async _cpRoll(cpName) {
        let checkOptions = await this.GetCpRollOptions();
        if (checkOptions.cancelled) {
            return;
        }
        let AMP = checkOptions.AMP;
        let ctx = CONFIG.mishi.cp[AMP]["ctx"];
        let cost = CONFIG.mishi.cp[AMP]["cost"];

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };
        var cpn="";
        if(cpName == "cpm"){
            cpn = this.actor.data.data.cpm
        } else {
            cpn = this.actor.data.data.cpc
        }
        let cardData = {
            seuil: ctx,
            cost: cost,
            cpName: cpn
        };

        chatData.content = await renderTemplate("systems/mishi/templates/partials/cp-card.hbs", cardData);
        chatData.roll = true;
        return ChatMessage.create(chatData);
    }

    async _sortRoll(sort) {
        let name = sort.data.name;
        let description = sort.data.data.Description;
        let degats = sort.data.data.Degats;
        let seuil = sort.data.data.Seuil;
        let cout = sort.data.data.Cout;
        let effets = sort.data.data.Effets;
        let nbrQuestions = [];

        degats = degats.replace(/@{FOR}/g, this.actor.data.data.FOR.value);
        degats = degats.replace(/@{MAG}/g, this.actor.data.data.MAG.value);
        degats = degats.replace(/@{AGI}/g, this.actor.data.data.AGI.value);
        degats = degats.replace(/@{SOC}/g, this.actor.data.data.SOC.value);
        degats = degats.replace(/@{INT}/g, this.actor.data.data.INT.value);
        degats = degats.replace(/@{SAV}/g, this.actor.data.data.SAV.value);
        degats = degats.replace(/@{OY}/g, this.actor.data.data.OY.value);
        degats = degats.replace(/@{PER}/g, this.actor.data.data.PER.value);
        degats = degats.replace(/@{COR}/g, this.actor.data.data.COR.value);

        var countQuestions = (seuil.match(/!{[a-zA-Z à/0-9ûô()]+}/g) || []);
        if (countQuestions != 0) {
            for (var i=0; i < countQuestions.length; i++) {
                nbrQuestions.push(countQuestions[i].replace(/[!{}]+/g,''));
            }

            let checkOptions = await this.GetSortRollOptions(nbrQuestions);
            if (checkOptions.cancelled) {
                return;
            }

            for (var j=0; j < countQuestions.length; j++) {
                seuil = seuil.replace(`!{${nbrQuestions[j]}}`, checkOptions[j]);
            }
        }
        countQuestions = [];
        nbrQuestions = [];

        var countQuestions = (cout.match(/!{[a-zA-Z à/0-9ûô()]+}/g) || []);
        if (cout != "" && countQuestions != 0) {
            for (var i=0; i < countQuestions.length; i++) {
                nbrQuestions.push(countQuestions[i].replace(/[!{}]+/g,''));
            }

            let checkOptions = await this.GetSortRollOptions(nbrQuestions);
            if (checkOptions.cancelled) {
                return;
            }

            for (var j=0; j < countQuestions.length; j++) {
                cout = cout.replace(`!{${nbrQuestions[j]}}`, checkOptions[j]);
            }
        }

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            Name: name,
            Description: description,
            Degats: degats,
            Seuil: seuil,
            Cout: cout,
            Effets: effets
        };

        chatData.content = await renderTemplate("systems/mishi/templates/partials/sort-card.hbs", cardData);
        chatData.roll = true;
        return ChatMessage.create(chatData);
    }

    async _sortEdit(item) {
        let checkOptions = await this.GetSortEditOptions(item);
        if (checkOptions.cancelled) {
            return;
        }

        let name = checkOptions.name;
        let Description = checkOptions.Description;
        let Degats = checkOptions.Degats;
        let Seuil = checkOptions.Seuil;
        let Cout = checkOptions.Cout;
        let Effets = checkOptions.Effets;

        console.log(item)
        return item.update({
            name: name,
            data: {
                Description: Description,
                Degats: Degats,
                Seuil: Seuil,
                Cout: Cout,
                Effets: Effets
            }
        });
    }

    _onItemCreate(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemData = {
            name: "New Object",
            type: element.dataset.type
        }

        return this.actor.createOwnedItem(itemData);
    }

    _onInlineEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);
        let field = element.dataset.field;

        return item.update({ [field]: element.value});
    }

    _onInlineCheckEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);
        let field = element.dataset.field;
        var isTrueSet = (element.value == "true");
        if(isTrueSet == true){
            isTrueSet = false;
        } else {
            isTrueSet = true;
        }

        return item.update({ [field]: isTrueSet});
    }

    _onItemDelete(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item-delete").dataset.itemId;
        return this.actor.deleteOwnedItem(itemId);
    }
}

function _processTaskCheckOptions(form) {
    return {
        modificateur: parseInt(form.modificateur.value)
    }
}

function _processCpRollOptions(form) {
    return {
        AMP: form.AMP.value
    }
}

function _processSortEditOptions(form) {
    return {
        name: form.name.value,
        Description: form.Description.value,
        Degats: form.Degats.value,
        Seuil: form.Seuil.value,
        Cout: form.Cout.value,
        Effets: form.Effets.value
    }
}

function _processSortRollOptions(form, dataList) {
    let dataL = [];
    for (var i=0; i < dataList.length; i++) {
        let n = dataList[i];
        dataL.push(form[n].value);
    }
    console.log(dataL);
    return dataL
}