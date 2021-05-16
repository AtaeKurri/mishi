export default class MItemSheet extends ItemSheet {
    static get defaultOption(){
        return mergeObject(super.defaultOption, {
            width: 530,
            height: 340,
            classes: ["mishi", "sheet", "item"]
        })
    }
    get template() {
        return `systems/Mishi/templates/sheets/${this.item.data.type}-sheet.hbs`;
    }

    getData() {
        const data = super.getData();
    
        data.config = CONFIG.mishi;
    
        return data;
    }
}