import { SuggestModal } from 'obsidian';

export default class SelectionModal extends SuggestModal {
    constructor(app, items, onChoose) {
        super(app);
        this.items = items;
        this.onChoose = onChoose;
        this.setPlaceholder("Начни вводить название...");
    }
    getSuggestions(query) { return this.items.filter(item => item.toLowerCase().includes(query.toLowerCase())); }
    renderSuggestion(item, el) { el.createEl("div", { text: item }); }
    onChooseSuggestion(item, evt) { this.onChoose(item); }
}