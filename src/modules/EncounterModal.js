import { Modal, Notice } from 'obsidian';

export default class EncounterModal extends Modal {
    constructor(app, plugin, encounterData) {
        super(app);
        this.plugin = plugin;
        this.encounter = encounterData;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('rpg-shop-container'); // Используем базовые отступы

        // Заголовок и Иконка
        contentEl.createEl('div', {
            text: this.encounter.icon || "🎲",
            style: 'font-size: 4em; text-align: center; margin-bottom: 10px;'
        });

        contentEl.createEl('h2', {
            text: this.encounter.title,
            style: 'text-align: center; color: var(--interactive-accent); font-family: var(--font-text); margin-top: 0;'
        });

        // Описание ситуации
        contentEl.createEl('p', {
            text: this.encounter.description,
            style: 'font-size: 1.1em; line-height: 1.5; color: var(--text-normal); text-align: center; margin-bottom: 25px; padding: 0 15px;'
        });

        // Контейнер для кнопок выбора
        const actionsDiv = contentEl.createEl('div', { style: 'display: flex; gap: 15px; justify-content: center;' });

        this.encounter.choices.forEach(choice => {
            const btn = actionsDiv.createEl('button', {
                text: choice.text,
                style: 'padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; flex: 1; background: var(--background-secondary); border: 2px solid var(--background-modifier-border); color: var(--text-normal); transition: 0.2s;'
            });

            btn.onmouseover = () => { btn.style.borderColor = 'var(--interactive-accent)'; };
            btn.onmouseout = () => { btn.style.borderColor = 'var(--background-modifier-border)'; };

            btn.onclick = async () => {
                await this.processOutcomes(choice.outcomes);
                this.close(); // Закрываем окно после выбора
            };
        });
    }

    async processOutcomes(outcomes) {
        for (const outcome of outcomes) {
            switch (outcome.type) {
                case 'gain_xp':
                    await this.plugin.game.gainXP(outcome.value);
                    break;
                case 'lose_xp':
                    await this.plugin.game.loseXP(outcome.value);
                    break;
                case 'gain_coins':
                    await this.plugin.game.gainCoins(outcome.value);
                    break;
                case 'lose_coins':
                    await this.plugin.game.loseCoins(outcome.value);
                    break;
                case 'gain_hp':
                    this.plugin.state.hp = Math.min(this.plugin.state.maxHp, this.plugin.state.hp + outcome.value);
                    break;
                case 'lose_hp':
                    this.plugin.state.hp -= outcome.value;
                    if (this.plugin.state.hp <= 0) {
                        const penalties = this.plugin.currentUniverse?.penalties || { death_xp_loss_pct: 10, death_gold_loss_pct: 10 };
                        await this.plugin.game.die(penalties);
                    }
                    break;
                case 'gain_mood':
                    await this.plugin.game.gainMood(outcome.value);
                    break;
                case 'lose_mood':
                    await this.plugin.game.loseMood(outcome.value);
                    break;
                case 'message':
                    new Notice(`📜 ${outcome.text}`, 6000);
                    if (this.plugin.ui) this.plugin.ui.setChatText(outcome.text);
                    break;
            }
        }
        await this.plugin.saveProgress();
    }

    onClose() { this.contentEl.empty(); }
}