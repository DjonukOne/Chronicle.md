import { Modal, Notice } from 'obsidian';

export default class ShopModal extends Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() { this.render(); }

    render() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('rpg-shop-container');

        const uiText = this.plugin.currentUniverse?.ui || {};
        const shopTitle = uiText.shop_title || "🛒 Лавка";
        const coinIcon = uiText.coin_icon || "🪙";

        const header = contentEl.createEl('div', { cls: 'rpg-shop-header' });
        header.createEl('h2', { text: shopTitle, style: 'margin: 0; color: var(--interactive-accent); font-family: var(--font-text);' });

        const effStats = this.plugin.game.getEffectiveStats().effective;
        const discountPct = Math.min(50, (effStats['C'] || 0) * 2);

        header.createEl('div', { cls: 'rpg-shop-balance', text: `${coinIcon} ${this.plugin.state.coins} (Скидка ${discountPct}%)` });

        const grid = contentEl.createEl('div', { cls: 'rpg-shop-grid' });

        const items = this.plugin.currentUniverse?.items || [];
        if (items.length === 0) {
            grid.createEl('p', { text: "Торговец ушел на обед. В этой вселенной товаров нет.", style: "color: var(--text-muted); grid-column: 1 / -1; text-align: center;" });
            return;
        }

        items.forEach(item => {
            const itemRarity = item.rarity || 'common';
            // ДОБАВЛЕН КЛАСС РЕДКОСТИ
            const card = grid.createEl('div', { cls: `rpg-item-card rpg-rarity-${itemRarity}` });

            const top = card.createEl('div', { cls: 'rpg-item-header' });

            const iconEl = top.createEl('div', { cls: 'rpg-item-icon' });
            if (item.icon_img) {
                const imgPath = `${this.plugin.manifest.dir}/universes/${this.plugin.data.universeId}/items_icon/${item.icon_img}`;
                const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
                const img = iconEl.createEl('img', { attr: { src: src } });
                img.onerror = () => { img.remove(); iconEl.innerText = item.icon_text || '📦'; };
            } else {
                iconEl.innerText = item.icon_text || item.icon || '📦';
            }

            const info = top.createEl('div', { cls: 'rpg-item-info' });
            info.createEl('div', { cls: 'rpg-item-name', text: item.name });
            info.createEl('div', { cls: 'rpg-item-desc', text: item.description });

            const finalPrice = Math.max(1, Math.floor(item.price * (1 - (discountPct / 100))));

            const btn = card.createEl('button', { cls: 'rpg-item-action' });
            btn.innerText = discountPct > 0 ? `Купить (${coinIcon} ${finalPrice})` : `Купить (${coinIcon} ${item.price})`;

            if (this.plugin.state.coins < finalPrice) btn.disabled = true;

            btn.onclick = async () => {
                if (this.plugin.state.coins >= finalPrice) {
                    await this.plugin.loseCoins(finalPrice);
                    await this.plugin.inventory.addToInventory(item.id);
                    new Notice(`Куплено: ${item.name}`);
                    this.render();
                }
            };
        });
    }

    onClose() { this.contentEl.empty(); }
}