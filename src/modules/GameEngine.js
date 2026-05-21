import { Notice } from 'obsidian';

export default class GameEngine {
    constructor(plugin) {
        this.plugin = plugin;
    }

    get state() { return this.plugin.state; }

    getEffectiveStats() {
        const baseStats = this.state.stats || { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 };
        const effectiveStats = { ...baseStats };
        const equipment = this.state.equipment || {};

        // Теперь берем статы предметов из глобальной базы!
        for (const slotId in equipment) {
            const itemId = equipment[slotId];
            if (itemId) {
                const itemData = this.plugin.itemsDatabase.get(itemId); // ИЗМЕНЕНО
                if (itemData && itemData.bonus_stats) {
                    for (const [stat, value] of Object.entries(itemData.bonus_stats)) {
                        effectiveStats[stat] = (effectiveStats[stat] || 0) + value;
                    }
                }
            }
        }
        return { base: baseStats, effective: effectiveStats };
    }
    // Динамический пересчет ХП (вызывается при смене статов или экипировки)
    recalculateMaxHp() {
        const baseHp = this.plugin.currentCompanion?.maxHp || 100;
        const effStats = this.getEffectiveStats().effective;
        const strengthBonus = (effStats['S'] || 0) * 5;

        this.state.maxHp = baseHp + strengthBonus;
        if (this.state.hp > this.state.maxHp) this.state.hp = this.state.maxHp;
    }

    getEmotion() {
        const c = this.plugin.currentCompanion;
        const currentMood = this.state.mood || 0;
        const defaultPhrases = c?.phrases || { task_done: ["Выполнено!"], task_undone: "Отменено.", level_up: "Новый уровень!", death: "Вы погибли." };
        if (!c || !c.emotions || c.emotions.length === 0) return { phrases: defaultPhrases, avatar_text: c?.avatar_text || "👤" };

        const sorted = [...c.emotions].sort((a, b) => b.threshold - a.threshold);
        for (let emotion of sorted) {
            if (currentMood >= emotion.threshold) {
                if (!emotion.phrases) emotion.phrases = defaultPhrases;
                return emotion;
            }
        }
        const last = sorted[sorted.length - 1];
        if (!last.phrases) last.phrases = defaultPhrases;
        return last;
    }

    async gainMood(amount) { this.state.mood = Math.min(100, (this.state.mood || 0) + amount); }
    async loseMood(amount) { this.state.mood = Math.max(0, (this.state.mood || 0) - amount); }

    async recordTaskCompletion(isCompleted, taskText = "") {
        const today = window.moment().format('YYYY-MM-DD');
        if (!this.plugin.data.history[today]) this.plugin.data.history[today] = 0;

        let xpReward = 25; let coinReward = 5;
        const modifiers = this.plugin.currentUniverse?.modifiers || {};
        for (const [tag, mults] of Object.entries(modifiers)) {
            if (taskText.includes(tag)) { xpReward = Math.round(xpReward * mults.xp); coinReward = Math.round(coinReward * mults.coins); break; }
        }

        let gainedStat = null;
        const tags = taskText.match(/#[a-zA-Zа-яА-ЯёЁ_0-9]+/g) || [];
        const specialKeys = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];

        if (isCompleted) {
            for (let tag of tags) {
                const firstLetter = tag.charAt(1);
                if (specialKeys.includes(firstLetter)) {
                    // Капы теперь работают только для БАЗОВЫХ статов (вещами можно пробить лимит!)
                    if (firstLetter === 'C' && this.state.stats['C'] >= 25) continue;
                    if (firstLetter === 'A' && this.state.stats['A'] >= 35) continue;
                    this.state.stats[firstLetter]++; gainedStat = firstLetter; break;
                }
            }
        } else {
            for (let tag of tags) {
                const firstLetter = tag.charAt(1);
                if (specialKeys.includes(firstLetter)) { this.state.stats[firstLetter] = Math.max(0, this.state.stats[firstLetter] - 1); break; }
            }
        }

        this.recalculateMaxHp(); // Обновляем ХП после изменения статов
        const effStats = this.getEffectiveStats().effective; // Берем статы с учетом вещей!

        if (isCompleted) {
            this.plugin.data.history[today]++;
            await this.gainMood(2);

            const iBonus = 1 + ((effStats['I'] || 0) * 0.02);
            const pBonus = 1 + ((effStats['P'] || 0) * 0.02);
            await this.gainXP(Math.round(xpReward * iBonus));
            await this.gainCoins(Math.round(coinReward * pBonus));

            let luckChance = effStats['L'] || 0; let itemsToGive = 0;

            // --- СЛУЧАЙНЫЕ СОБЫТИЯ (RANDOM ENCOUNTERS) ---
            const encounters = this.plugin.currentUniverse?.encounters || [];

            // Шанс события: базовые 5%
            const ENCOUNTER_CHANCE = 5;

            if (encounters.length > 0 && Math.random() * 100 < ENCOUNTER_CHANCE) {
                // Выбираем случайное событие
                const randomEncounter = encounters[Math.floor(Math.random() * encounters.length)];

                // Просим Ядро показать модалку
                this.plugin.triggerEncounter(randomEncounter);
            }

            while (luckChance >= 100) { itemsToGive++; luckChance -= 100; }
            if (Math.random() * 100 < luckChance) itemsToGive++;

            const shopItems = this.plugin.currentUniverse?.items || [];
            if (itemsToGive > 0 && shopItems.length > 0) {
                for (let i = 0; i < itemsToGive; i++) {
                    const randomItem = shopItems[Math.floor(Math.random() * shopItems.length)];
                    await this.plugin.inventory.addToInventory(randomItem.id);
                    new Notice(`🍀 Удача! Вы нашли: ${randomItem.name}`);
                }
            }

            const emotion = this.getEmotion();
            if (gainedStat && this.plugin.ui) this.plugin.ui.setChatText(`Твоя характеристика [${gainedStat}] возрастает!`);
            else if (taskText.includes('#boss') && this.plugin.ui) this.plugin.ui.setChatText("Эпичная битва! Враг повержен!");
            else if (this.plugin.ui) {
                const phrasesList = emotion.phrases?.task_done || ["Выполнено!"];
                this.plugin.ui.setChatText(phrasesList[Math.floor(Math.random() * phrasesList.length)]);
            }
        } else {
            this.plugin.data.history[today] = Math.max(0, this.plugin.data.history[today] - 1);
            await this.loseXP(xpReward); await this.loseCoins(coinReward); await this.loseMood(10);
            if (this.plugin.ui) {
                const emotion = this.getEmotion();
                this.plugin.ui.setChatText(emotion.phrases?.task_undone || "Отменено.");
            }
        }
        await this.plugin.saveProgress();
    }

    async checkDailyDamage() {
        const todayStr = window.moment().format('YYYY-MM-DD');
        if (this.state.lastCheckedDate === todayStr) return;

        let penalties = this.plugin.currentUniverse?.penalties || { daily_hp_loss: 5, death_xp_loss_pct: 10, death_gold_loss_pct: 10 };
        let checkDate = window.moment(this.state.lastCheckedDate).add(1, 'days');
        let damageToTake = 0; let missedDays = 0;

        const effStats = this.getEffectiveStats().effective; // Считаем Выносливость с учетом шмота
        let dailyLoss = Math.max(1, penalties.daily_hp_loss - (effStats['E'] || 0));

        while (checkDate.format('YYYY-MM-DD') < todayStr) {
            const dStr = checkDate.format('YYYY-MM-DD');
            if (!this.plugin.data.history?.[dStr] || this.plugin.data.history[dStr] === 0) { damageToTake += dailyLoss; missedDays++; await this.loseMood(20); }
            checkDate.add(1, 'days');
        }
        this.state.lastCheckedDate = todayStr;

        if (damageToTake > 0) {
            const dodgeChance = Math.min(70, (effStats['A'] || 0) * 2); // Считаем Ловкость от шмота
            if (Math.random() * 100 < dodgeChance) new Notice(`🏃 Вы пропустили ${missedDays} дней, но Ловкость помогла избежать урона!`);
            else {
                this.state.hp -= damageToTake;
                if (this.state.hp <= 0) await this.die(penalties);
                else new Notice(`Вы пропустили ${missedDays} дней. Потеряно ${damageToTake} HP!`);
            }
        }
        await this.plugin.saveProgress();
    }

    async die(penalties) {
        const xpLoss = Math.floor(this.state.xp * (penalties.death_xp_loss_pct / 100)); const goldLoss = Math.floor(this.state.coins * (penalties.death_gold_loss_pct / 100));
        this.state.xp = Math.max(0, this.state.xp - xpLoss); this.state.coins = Math.max(0, this.state.coins - goldLoss); this.state.hp = this.state.maxHp;
        const emotion = this.getEmotion(); const deathMsg = emotion.phrases?.death || "Вы погибли от истощения сил.";
        new Notice(`💀 ВЫ УМЕРЛИ!\nПотеряно XP: ${xpLoss}, Золота: ${goldLoss}`);
        if (this.plugin.ui) this.plugin.ui.setChatText(deathMsg);
    }

    async gainXP(amount) {
        this.state.xp += amount;
        if (this.state.xp >= this.state.xpToNextLevel) {
            this.state.level++; this.state.xp -= this.state.xpToNextLevel; this.state.xpToNextLevel += 500; this.state.hp = this.state.maxHp;
            const emotion = this.getEmotion();
            if (this.plugin.ui && emotion.phrases?.level_up) this.plugin.ui.setChatText(emotion.phrases.level_up.replace('{level}', this.state.level));
        }
    }
    async gainCoins(amount) { this.state.coins += amount; }
    async loseXP(amount) {
        this.state.xp -= amount;
        if (this.state.xp < 0) {
            if (this.state.level > 1) { this.state.level--; this.state.xpToNextLevel = Math.max(1000, this.state.xpToNextLevel - 500); this.state.xp = this.state.xpToNextLevel + this.state.xp; }
            else { this.state.xp = 0; }
        }
    }
    async loseCoins(amount) { this.state.coins = Math.max(0, this.state.coins - amount); }
}