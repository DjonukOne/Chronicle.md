import { Modal } from 'obsidian';

export default class InventoryModal extends Modal {
    constructor(app, plugin) { super(app); this.plugin = plugin; this.selectedItemId = null; }
    onOpen() { this.render(); }

    render() {
        const { contentEl } = this; contentEl.empty(); contentEl.addClass('rpg-shop-container');
        const uiText = this.plugin.currentUniverse?.ui || {}; const invTitle = uiText.inventory_title || "🎒 Рюкзак";

        const maxSlots = 20 + ((this.plugin.state.level - 1) * 2);

        const header = contentEl.createEl('div', { cls: 'rpg-shop-header' });
        header.createEl('h2', { text: invTitle, style: 'margin: 0; color: var(--interactive-accent); font-family: var(--font-text);' });
        header.createEl('div', { text: `Ур. ${this.plugin.state.level} | Слотов: ${maxSlots}`, style: 'color: var(--text-muted); font-weight: bold;' });

        const layout = contentEl.createEl('div', { cls: 'rpg-inv-layout' });
        const gridContainer = layout.createEl('div', { cls: 'rpg-inv-grid-container' });
        const grid = gridContainer.createEl('div', { cls: 'rpg-inv-grid' });

        const inventory = this.plugin.state.inventory || [];
        const equippedItems = Object.values(this.plugin.state.equipment || {});

        for (let i = 0; i < maxSlots; i++) {
            const slot = grid.createEl('div', { cls: 'rpg-inv-slot' });

            if (i < inventory.length) {
                const invItem = inventory[i]; 
                const itemData = this.plugin.itemsDatabase.get(invItem.id); // ИЗМЕНЕНО
                
                if (itemData) {
                    if (itemData.icon_img) {
                        // ИЗМЕНЕНО: Берем папку из itemData.universe_id
                        const imgPath = `${this.plugin.manifest.dir}/universes/${itemData.universe_id}/items_icon/${itemData.icon_img}`;
                        const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
                        const img = slot.createEl('img', { attr: { src: src } });
                        img.onerror = () => { img.remove(); slot.innerText = itemData.icon_text || '📦'; };
                    } else { slot.innerText = itemData.icon_text || itemData.icon || '📦'; }

                    if (invItem.quantity > 1) slot.createEl('span', { cls: 'rpg-slot-qty', text: `x${invItem.quantity}` });
                    if (this.selectedItemId === invItem.id) slot.addClass('selected');
                    if (equippedItems.includes(invItem.id)) slot.addClass('equipped');

                    slot.onclick = () => { this.selectedItemId = invItem.id; this.render(); };
                }
            } else { slot.addClass('empty'); }
        }

        const sidebar = layout.createEl('div', { cls: 'rpg-inv-sidebar' });

        if (!this.selectedItemId) { sidebar.createEl('div', { text: "Выбери предмет", style: "text-align: center; color: var(--text-muted); margin-top: auto; margin-bottom: auto;" }); return; }

        const selectedInvItem = inventory.find(i => i.id === this.selectedItemId);
        const selectedData = this.plugin.itemsDatabase.get(this.selectedItemId); // ИЗМЕНЕНО
        
        if (!selectedInvItem || !selectedData) { this.selectedItemId = null; this.render(); return; }

        const itemRarity = selectedData.rarity || 'common';
        sidebar.addClass(`rpg-rarity-${itemRarity}`);

        const iconEl = sidebar.createEl('div', { cls: 'rpg-sidebar-icon' });
        if (selectedData.icon_img) {
            // ИЗМЕНЕНО: Берем папку из selectedData.universe_id
            const imgPath = `${this.plugin.manifest.dir}/universes/${selectedData.universe_id}/items_icon/${selectedData.icon_img}`;
            const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
            const img = iconEl.createEl('img', { attr: { src: src }, style: "width: 100%; height: 100%; object-fit: contain;" });
            img.onerror = () => { img.remove(); iconEl.innerText = selectedData.icon_text || '📦'; };
        } else { iconEl.innerText = selectedData.icon_text || selectedData.icon || '📦'; }

        sidebar.createEl('div', { cls: 'rpg-item-name', text: `${selectedData.name} (x${selectedInvItem.quantity})`, style: "text-align: center; margin-bottom: 10px; font-size: 1.2em;" });
        sidebar.createEl('div', { cls: 'rpg-sidebar-desc', text: selectedData.description });

        const actions = sidebar.createEl('div', { cls: 'rpg-sidebar-actions' });
        const isEquipped = equippedItems.includes(selectedInvItem.id);

        if (selectedData.type === 'equipment') {
            if (isEquipped) {
                const btnUnequip = actions.createEl('button', { cls: 'btn-use', text: 'Снять' });
                btnUnequip.onclick = async () => { await this.plugin.inventory.unequipItem(selectedData.equipSlot); this.render(); };
            } else {
                const btnEquip = actions.createEl('button', { cls: 'btn-use', text: 'Надеть' });
                btnEquip.onclick = async () => { await this.plugin.inventory.equipItem(selectedData.equipSlot, selectedInvItem.id); this.render(); };
            }
        } else {
            const btnUse = actions.createEl('button', { cls: 'btn-use', text: uiText.btn_use || "Использовать" });
            btnUse.onclick = async () => {
                await this.plugin.inventory.useItem(selectedInvItem.id, selectedData);
                const check = this.plugin.state.inventory.find(i => i.id === this.selectedItemId);
                if (!check) this.selectedItemId = null;
                this.render();
            };
        }

        if (!isEquipped) {
            const btnDrop = actions.createEl('button', { cls: 'btn-drop', text: uiText.btn_drop || "Выбросить" });
            btnDrop.onclick = async () => {
                await this.plugin.inventory.dropItem(selectedInvItem.id);
                const check = this.plugin.state.inventory.find(i => i.id === this.selectedItemId);
                if (!check) this.selectedItemId = null;
                this.render();
            };
        }
    }
    onClose() { this.contentEl.empty(); }
}