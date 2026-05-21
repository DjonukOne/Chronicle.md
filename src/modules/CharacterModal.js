import { Modal } from 'obsidian';

export default class CharacterModal extends Modal {
    constructor(app, plugin) { super(app); this.plugin = plugin; }
    onOpen() { this.render(); }

    render() {
        const { contentEl } = this; contentEl.empty(); contentEl.addClass('rpg-shop-container');
        const p = this.plugin; const c = p.currentCompanion; const ui = p.currentUniverse?.ui || { coin_icon: "🪙" }; const t = p.currentUniverse?.terminology || {};

        contentEl.createEl('h2', { text: "🪪 Личное Дело", style: 'text-align: center; color: var(--interactive-accent); margin: 0;' });
        const layout = contentEl.createEl('div', { cls: 'rpg-char-layout' });

        const left = layout.createEl('div', { cls: 'rpg-char-left' });
        const avatarContainer = left.createEl('div', { cls: 'rpg-char-avatar' });

        if (p.currentSpriteUrl) {
            const img = avatarContainer.createEl('img', { attr: { src: p.currentSpriteUrl } });
            img.onerror = () => {
                img.remove();
                avatarContainer.innerText = c.avatar_text || '👤';
                avatarContainer.style.fontSize = '4em';
            };
        } else {
            avatarContainer.innerText = c.avatar_text || '👤';
            avatarContainer.style.fontSize = '4em';
        }

        left.createEl('div', { cls: 'rpg-char-name', text: c?.name || "Неизвестный" });

        const statsSummary = left.createEl('div', { style: 'text-align: center; width: 100%; font-family: monospace; font-size: 1.1em; line-height: 1.5; color: var(--text-normal);' });
        statsSummary.createEl('div', { text: `${t.level} ${p.state.level} (${Math.floor(p.state.xp)}/${p.state.xpToNextLevel} XP)` });
        statsSummary.createEl('div', { text: `${t.hp}: ${p.state.hp}/${p.state.maxHp}`, style: 'color: #e74c3c;' });
        statsSummary.createEl('div', { text: `Баланс: ${ui.coin_icon} ${p.state.coins}` });

        const equip = left.createEl('div', { cls: 'rpg-char-equip' });
        const eqState = p.state.equipment || {};

        const renderSlot = (slotName, slotLabel) => {
            const itemId = eqState[slotName];
            const slotEl = equip.createEl('div', { cls: 'rpg-equip-slot' });
            if (itemId) {
                const itemData = p.itemsDatabase.get(itemId); // ИЗМЕНЕНО: Глобальная БД
                if (itemData) {
                    if (itemData.icon_img) {
                        // ИЗМЕНЕНО: Берем папку из itemData.universe_id
                        const imgPath = `${this.plugin.manifest.dir}/universes/${itemData.universe_id}/items_icon/${itemData.icon_img}`;
                        const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
                        const img = slotEl.createEl('img', { attr: { src: src }, style: 'width:24px; height:24px; object-fit:contain;' });
                        img.onerror = () => { img.remove(); slotEl.createEl('span', { text: itemData.icon_text || '📦' }); };
                    } else { slotEl.createEl('span', { text: itemData.icon_text || itemData.icon || '📦' }); }
                    slotEl.createEl('span', { text: itemData.name });
                    return;
                }
            }
            slotEl.innerText = `${slotLabel} (Пусто)`;
            slotEl.style.color = 'var(--text-muted)';
        };

        renderSlot('head', 'Голова'); renderSlot('body', 'Броня'); renderSlot('weapon', 'Оружие'); renderSlot('accessory', 'Аксессуар');

        const right = layout.createEl('div', { cls: 'rpg-char-right' });
        const statsData = p.game.getEffectiveStats();
        const baseStats = statsData.base;
        const effStats = statsData.effective;

        const specialDefs = [
            { key: 'S', name: 'Сила (Strength)', desc: '+5 Макс. HP за каждое очко' },
            { key: 'P', name: 'Восприятие (Perception)', desc: '+2% к получаемому Золоту' },
            { key: 'E', name: 'Выносливость (Endurance)', desc: '-1 ежедневного урона за пропуски' },
            { key: 'C', name: 'Харизма (Charisma)', desc: '-2% цены в Магазине (макс. -50%)' },
            { key: 'I', name: 'Интеллект (Intelligence)', desc: '+2% к получаемому Опыту' },
            { key: 'A', name: 'Ловкость (Agility)', desc: '+2% шанс уклониться от урона (макс 70%)' },
            { key: 'L', name: 'Удача (Luck)', desc: '1% шанс найти предмет за квест' }
        ];

        specialDefs.forEach(stat => {
            const row = right.createEl('div', { cls: 'rpg-char-stat-row' });
            const info = row.createEl('div', { cls: 'rpg-char-stat-info' });
            info.createEl('div', { cls: 'rpg-char-stat-name', text: stat.name });
            info.createEl('div', { cls: 'rpg-char-stat-desc', text: stat.desc });

            const valContainer = row.createEl('div', { style: 'text-align: right;' });
            const baseVal = baseStats[stat.key] || 0;
            const effVal = effStats[stat.key] || 0;
            const diff = effVal - baseVal;

            valContainer.createEl('span', { cls: 'rpg-char-stat-val', text: baseVal.toString() });

            if (diff > 0) {
                valContainer.createEl('span', { text: ` (+${diff})`, style: 'color: #2ecc71; font-weight: bold; font-size: 0.9em;' });
            } else if (diff < 0) {
                valContainer.createEl('span', { text: ` (${diff})`, style: 'color: #e74c3c; font-weight: bold; font-size: 0.9em;' });
            }
        });

        contentEl.createEl('div', { cls: 'rpg-char-footer', text: "ℹ️ Подсказка: Используйте теги с заглавной буквы (например, #Sport, #Code, #English) в ваших задачах, чтобы прокачивать соответствующие характеристики S.P.E.C.I.A.L." });
    }
    onClose() { this.contentEl.empty(); }
}