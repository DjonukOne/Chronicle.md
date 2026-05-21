import { Plugin, Notice, Menu } from 'obsidian';

// Модули UI
import SelectionModal from './modules/SelectionModal.js';
import CalendarModal from './modules/CalendarModal.js';
import JRPGInterface from './modules/JRPGInterface.js';
import QuestLogView, { VIEW_TYPE_QUEST_LOG } from './modules/QuestLogView.js';
import ShopModal from './modules/ShopModal.js';
import InventoryModal from './modules/InventoryModal.js';
import CharacterModal from './modules/CharacterModal.js';
import EncounterModal from './modules/EncounterModal.js';

// Логические движки
import GameEngine from './modules/GameEngine.js';
import InventoryManager from './modules/InventoryManager.js';
import DocGenerator from './modules/DocGenerator.js';

const DEFAULT_SAVE = {
    level: 1, xp: 0, xpToNextLevel: 1000, coins: 0, hp: 100, maxHp: 100, mood: 100,
    inventory: [], equipment: { head: null, body: null, weapon: null, accessory: null },
    stats: { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 },
    lastCheckedDate: window.moment().format('YYYY-MM-DD')
};

export default class DailyRPGPlugin extends Plugin {

    get state() {
        const cid = this.data.companionId || 'default';
        if (!this.data.saves[cid]) this.data.saves[cid] = JSON.parse(JSON.stringify(DEFAULT_SAVE));
        return this.data.saves[cid];
    }

    async onload() {
        console.log('Chronicle.md: Инициализация ядра...');

        let rawData = await this.loadData() || {};
        this.data = Object.assign({ universeId: 'default', companionId: 'default', history: {}, saves: {} }, rawData);

        this.game = new GameEngine(this);
        this.inventory = new InventoryManager(this);

        this.game = new GameEngine(this);
        this.inventory = new InventoryManager(this);

        // Генерация документации (модуль)
        this.docGenerator = new DocGenerator(this);
        await this.docGenerator.generate();

        // Мигратор
        if (this.data.level !== undefined && !this.data.saves[this.data.companionId]) {
            this.data.saves[this.data.companionId] = {
                level: this.data.level, xp: this.data.xp, xpToNextLevel: this.data.xpToNextLevel, coins: this.data.coins, hp: this.data.hp, maxHp: this.data.maxHp, mood: 100,
                inventory: this.data.inventory || [], equipment: { head: null, body: null, weapon: null, accessory: null }, stats: this.data.stats || { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 },
                lastCheckedDate: this.data.lastCheckedDate || window.moment().format('YYYY-MM-DD')
            };
            delete this.data.level; delete this.data.xp; delete this.data.xpToNextLevel; delete this.data.coins; delete this.data.hp; delete this.data.maxHp; delete this.data.inventory; delete this.data.stats; delete this.data.lastCheckedDate;
            await this.saveData(this.data);
        }

        this.registerView(VIEW_TYPE_QUEST_LOG, (leaf) => new QuestLogView(leaf, this));

        // ==========================================
        // МАСТЕР-КНОПКА (ОСНОВНОЕ МЕНЮ РПГ)
        // ==========================================
        const masterBtn = this.addRibbonIcon('swords', 'Chronicle.md Menu', (evt) => {
            const menu = new Menu();

            menu.addItem((item) => item.setTitle('📜 Журнал Квестов').setIcon('clipboard-list').onClick(() => this.activateQuestLog()));
            menu.addItem((item) => item.setTitle('🪪 Личное Дело').setIcon('id-card').onClick(() => new CharacterModal(this.app, this).open()));
            menu.addItem((item) => item.setTitle('🎒 Рюкзак').setIcon('backpack').onClick(() => new InventoryModal(this.app, this).open()));
            menu.addItem((item) => item.setTitle('🛒 Лавка Торговца').setIcon('store').onClick(() => new ShopModal(this.app, this).open()));
            menu.addItem((item) => item.setTitle('📅 Хроники').setIcon('calendar-days').onClick(() => new CalendarModal(this.app, this).open()));
            menu.addSeparator();

            menu.addItem((item) =>
                item.setTitle('🎭 Сменить Компаньона')
                    .setIcon('user')
                    .onClick(async () => {
                        const c = await this.scanFolders('companions');
                        new SelectionModal(this.app, c, async (s) => { this.data.companionId = s; await this.saveProgress(); await this.reloadModules(); }).open();
                    })
            );

            menu.addItem((item) =>
                item.setTitle('🌌 Сменить Вселенную')
                    .setIcon('globe')
                    .onClick(async () => {
                        const u = await this.scanFolders('universes');
                        new SelectionModal(this.app, u, async (s) => { this.data.universeId = s; await this.saveProgress(); await this.reloadModules(); }).open();
                    })
            );

            menu.addSeparator();

            menu.addItem((item) =>
                item.setTitle('🛠️ Запустить Кузницу Миров')
                    .setIcon('hammer') // или 'wrench'
                    .onClick(() => {
                        const forgePath = "Chronicle.md/🛠️ Кузница Миров.html";
                        const file = this.app.vault.getAbstractFileByPath(forgePath);
                        if (file) {
                            // Эта команда заставит ОС открыть файл в браузере по умолчанию!
                            this.app.openWithDefaultApp(forgePath);
                        } else {
                            new Notice("Файл Кузницы не найден! Убедитесь, что папка Chronicle.md существует.");
                        }
                    })
            );

            // Показываем меню ровно в той точке...
            menu.showAtMouseEvent(evt);
        });

        masterBtn.addClass('rpg-ribbon-icon', 'rpg-master-icon');

        // СОБИРАЕМ БАЗУ ВСЕХ ПРЕДМЕТОВ МУЛЬТИВСЕЛЕННОЙ ПЕРЕД ЗАГРУЗКОЙ МОДУЛЕЙ
        await this.buildItemsDatabase();

        await this.reloadModules();
        await this.checkDailyDamage();

        this.registerDomEvent(document, 'click', (evt) => {
            if (evt.target.classList.contains('task-list-item-checkbox')) {
                if (!this.currentUniverse || !this.currentCompanion) return;
                const taskText = evt.target.parentElement ? evt.target.parentElement.innerText : "";
                this.recordTaskCompletion(evt.target.checked, taskText);
            }
        });
    }

    // НОВАЯ ФУНКЦИЯ: Сканирует все вселенные
    async buildItemsDatabase() {
        this.itemsDatabase = new Map();
        const universes = await this.scanFolders('universes');

        for (const u of universes) {
            try {
                const jsonPath = `${this.manifest.dir}/universes/${u}/universe_${u}.json`;
                if (await this.app.vault.adapter.exists(jsonPath)) {
                    const uniData = JSON.parse(await this.app.vault.adapter.read(jsonPath));
                    if (uniData.items) {
                        uniData.items.forEach(item => {
                            item.universe_id = u; // Запоминаем из какой он вселенной для путей к иконкам!
                            this.itemsDatabase.set(item.id, item);
                        });
                    }
                }
            } catch (e) {
                console.error(`Ошибка загрузки предметов из вселенной ${u}:`, e);
            }
        }
        console.log(`🌌 Мультивселенная загружена: найдено ${this.itemsDatabase.size} уник. предметов.`);
    }

    async activateQuestLog() {
        const { workspace } = this.app; let leaf = workspace.getLeavesOfType(VIEW_TYPE_QUEST_LOG)[0];
        if (!leaf) { leaf = workspace.getRightLeaf(false); await leaf.setViewState({ type: VIEW_TYPE_QUEST_LOG, active: true }); }
        workspace.revealLeaf(leaf);
    }

    async scanFolders(folderType) {
        const adapter = this.app.vault.adapter; const dir = `${this.manifest.dir}/${folderType}`;
        if (!(await adapter.exists(dir))) return []; return (await adapter.list(dir)).folders.map(path => path.split('/').pop());
    }

    async reloadModules() {
        if (this.ui) this.ui.remove(); if (this.universeStyleTag) this.universeStyleTag.remove();
        const uniLoaded = await this.loadUniverse(this.data.universeId); const compLoaded = await this.loadCompanion(this.data.companionId);
        if (uniLoaded && compLoaded) {
            this.ui = new JRPGInterface(this); this.ui.createWindow();
            this.app.workspace.getLeavesOfType(VIEW_TYPE_QUEST_LOG).forEach(leaf => leaf.view.renderTasks());
        }
    }

    async loadUniverse(id) {
        try {
            const adapter = this.app.vault.adapter; const jsonPath = `${this.manifest.dir}/universes/${id}/universe_${id}.json`; const cssPath = `${this.manifest.dir}/universes/${id}/universe_${id}.css`;
            if (!(await adapter.exists(jsonPath))) return false;
            this.currentUniverse = JSON.parse(await adapter.read(jsonPath));
            if (await adapter.exists(cssPath)) {
                this.universeStyleTag = document.createElement('style'); this.universeStyleTag.id = 'chronicle-md-universe-theme'; this.universeStyleTag.innerHTML = await adapter.read(cssPath); document.head.appendChild(this.universeStyleTag);
            }
            return true;
        } catch (e) { return false; }
    }

    async loadCompanion(id) {
        try {
            const adapter = this.app.vault.adapter; const jsonPath = `${this.manifest.dir}/companions/${id}/companion_${id}.json`; const spritePath = `${this.manifest.dir}/companions/${id}/sprites/idle.png`;
            if (!(await adapter.exists(jsonPath))) return false;
            this.currentCompanion = JSON.parse(await adapter.read(jsonPath));

            const effStats = this.game.getEffectiveStats().effective;
            const strengthBonus = (effStats['S'] || 0) * 5;
            this.state.maxHp = (this.currentCompanion.maxHp || 100) + strengthBonus;
            if (this.state.hp > this.state.maxHp) this.state.hp = this.state.maxHp;

            this.currentSpriteUrl = (await adapter.exists(spritePath)) ? adapter.getResourcePath(spritePath) : ''; return true;
        } catch (e) { return false; }
    }

    async saveProgress() {
        await this.saveData(this.data);
        if (this.ui) this.ui.updateStatsUI();
        this.app.workspace.getLeavesOfType(VIEW_TYPE_QUEST_LOG).forEach(leaf => { if (leaf.view.renderTasks) leaf.view.renderTasks(); });
    }

    onunload() { if (this.ui) this.ui.remove(); if (this.universeStyleTag) this.universeStyleTag.remove(); }

    // ==========================================
    // API FACADE
    // ==========================================
    async recordTaskCompletion(c, t) { await this.game.recordTaskCompletion(c, t); }
    async checkDailyDamage() { await this.game.checkDailyDamage(); }
    async gainXP(a) { await this.game.gainXP(a); }
    async gainCoins(a) { await this.game.gainCoins(a); }
    async loseXP(a) { await this.game.loseXP(a); }
    async loseCoins(a) { await this.game.loseCoins(a); }

    async equipItem(s, i) { await this.inventory.equipItem(s, i); }
    async unequipItem(s) { await this.inventory.unequipItem(s); }
    async addToInventory(i) { await this.inventory.addToInventory(i); }
    async useItem(i, d) { await this.inventory.useItem(i, d); }
    async dropItem(i) { await this.inventory.dropItem(i); }

    triggerEncounter(encounterData) {
        new EncounterModal(this.app, this, encounterData).open();
    }
}