import { Notice } from 'obsidian';

export default class InventoryManager {
    constructor(plugin) {
        this.plugin = plugin;
    }

    get state() { return this.plugin.state; }

    async equipItem(slotId, itemId) {
        if (!this.state.equipment) this.state.equipment = { head: null, body: null, weapon: null, accessory: null };
        this.state.equipment[slotId] = itemId;
        this.plugin.game.recalculateMaxHp(); 
        await this.plugin.saveProgress();
        
        // Получаем предмет из БД и пишем уникальную фразу, либо дефолтную
        const itemData = this.plugin.itemsDatabase.get(itemId);
        const phrase = itemData?.use_phrase || `Ты надел: ${itemData?.name || 'Предмет'}`;
        if (this.plugin.ui) this.plugin.ui.setChatText(phrase);
        
        new Notice("Предмет надет!");
    }

    async unequipItem(slotId) {
        const itemId = this.state.equipment ? this.state.equipment[slotId] : null;
        if (this.state.equipment) this.state.equipment[slotId] = null;
        this.plugin.game.recalculateMaxHp(); 
        await this.plugin.saveProgress();
        
        // Можем добавить фразу при снятии (просто дефолтную)
        const itemData = itemId ? this.plugin.itemsDatabase.get(itemId) : null;
        if (this.plugin.ui && itemData) this.plugin.ui.setChatText(`Ты снял: ${itemData.name}.`);
        
        new Notice("Предмет снят!");
    }

    async addToInventory(itemId) {
        if (!this.state.inventory) this.state.inventory = [];
        const existing = this.state.inventory.find(i => i.id === itemId);
        if (existing) existing.quantity++;
        else this.state.inventory.push({ id: itemId, quantity: 1 });
        await this.plugin.saveProgress();
    }

    async useItem(itemId, itemData) {
        if (!this.state.inventory) return;
        const existing = this.state.inventory.find(i => i.id === itemId);
        if (!existing || existing.quantity <= 0) return;

        // Если это лутбокс
        if (itemData.type === 'lootbox' && itemData.lootbox_data) {
            const phrase = itemData.use_phrase || "Открываю сундук... Что же внутри?";
            if (this.plugin.ui) this.plugin.ui.setChatText(phrase);
            
            await this.openLootbox(itemData.lootbox_data);
            existing.quantity--;
            if (existing.quantity <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
            await this.plugin.saveProgress();
            return; 
        }

         // Если это расходник с массивом эффектов
        if (itemData.effects && Array.isArray(itemData.effects)) {
            for (let effect of itemData.effects) {
                switch (effect.type) {
                    case 'gain_hp': this.state.hp = Math.min(this.state.maxHp, this.state.hp + effect.value); break;
                    case 'lose_hp': 
                        this.state.hp = Math.max(0, this.state.hp - effect.value);
                        if (this.state.hp === 0) await this.plugin.game.die(this.plugin.currentUniverse?.penalties || { death_xp_loss_pct: 10, death_gold_loss_pct: 10 });
                        break;
                    case 'gain_xp': await this.plugin.game.gainXP(effect.value); break;
                    case 'lose_xp': await this.plugin.game.loseXP(effect.value); break;
                    case 'gain_coins': await this.plugin.game.gainCoins(effect.value); break;
                    case 'lose_coins': await this.plugin.game.loseCoins(effect.value); break;
                    case 'gain_mood': await this.plugin.game.gainMood(effect.value); break;
                    case 'lose_mood': await this.plugin.game.loseMood(effect.value); break;
                }
            }
            
            // ИСПОЛЬЗУЕМ ФРАЗУ ИЗ ПРЕДМЕТА!
            const phrase = itemData.use_phrase || `Ты использовал ${itemData.name}.`;
            if (this.plugin.ui) this.plugin.ui.setChatText(phrase);
        }

        existing.quantity--;
        if (existing.quantity <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
        await this.plugin.saveProgress();
        new Notice(`Использовано: ${itemData.name}`);
    }

    // НОВАЯ ФУНКЦИЯ ДЛЯ РУЛЕТКИ
    async openLootbox(lootboxData) {
        const universeItems = this.plugin.currentUniverse?.items || [];
        const rolls = lootboxData.rolls || 1;
        const chances = lootboxData.chances || { common: 100 };

        let wonItems = [];

        for (let i = 0; i < rolls; i++) {
            // Крутим колесо (от 0 до 100)
            const roll = Math.random() * 100;
            let currentWeight = 0;
            let wonRarity = "common";

            // Определяем выпавшую редкость
            for (const [rarity, weight] of Object.entries(chances)) {
                currentWeight += weight;
                if (roll <= currentWeight) {
                    wonRarity = rarity;
                    break;
                }
            }

            // Ищем все предметы этой редкости в магазине
            const possibleItems = universeItems.filter(item => (item.rarity || 'common') === wonRarity && item.type !== 'lootbox');

            if (possibleItems.length > 0) {
                // Выбираем случайный предмет нужной редкости
                const drop = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                wonItems.push(drop);
                await this.addToInventory(drop.id); // Кладем в рюкзак
            }
        }

        // Показываем красивые уведомления о луте
        if (wonItems.length > 0) {
            const itemNames = wonItems.map(item => `${item.icon_text || '📦'} ${item.name}`).join('\n');
            new Notice(`🎁 ИЗ СУНДУКА ВЫПАЛО:\n${itemNames}`, 5000); // Висит 5 секунд
            if (this.plugin.ui) this.plugin.ui.setChatText("Ого! Неплохой улов!");
        } else {
            new Notice("Сундук оказался пуст...");
        }
    }

    async dropItem(itemId) {
        if (!this.state.inventory) return;
        const existing = this.state.inventory.find(i => i.id === itemId);
        if (!existing) return;

        existing.quantity--;
        if (existing.quantity <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);

        // Снимаем вещь, если выкинули последнюю
        if (this.state.equipment) {
            for (let slot in this.state.equipment) {
                if (this.state.equipment[slot] === itemId && existing.quantity <= 0) {
                    this.state.equipment[slot] = null;
                }
            }
        }
        await this.plugin.saveProgress();
    }
}