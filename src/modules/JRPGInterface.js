export default class JRPGInterface {
    constructor(plugin) { this.plugin = plugin; }

    getEmotion() {
        const c = this.plugin.currentCompanion;
        const currentMood = this.plugin.state.mood || 0;
        const defaultPhrases = c?.phrases || { task_done: ["Ок."], task_undone: "Ок.", level_up: "Уровень.", death: "Смерть." };

        if (!c || !c.emotions || c.emotions.length === 0) {
            return { mood_name: "Нейтрально", avatar_text: c?.avatar_text || "👤", phrases: defaultPhrases };
        }

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

    createWindow() {
        const p = this.plugin; const c = p.currentCompanion; const u = p.currentUniverse;

        const t = c?.terminology || { hp: "HP", xp: "Опыт", mood: "Настроение" };
        const colors = c?.colors || { hp: "#b30000", xp: "#4b0082", mood: "#f1c40f" };
        const ui = u?.ui || { coin_icon: "🪙" };

        const emotion = this.getEmotion();

        this.container = document.createElement('div');
        this.container.className = 'jrpg-bottom-panel';

        this.container.style.setProperty('--dyn-hp-color', colors.hp);
        this.container.style.setProperty('--dyn-xp-color', colors.xp);
        this.container.style.setProperty('--dyn-mood-color', colors.mood);

        const avatarWrapper = document.createElement('div');
        avatarWrapper.className = 'rpg-avatar-wrapper';

        this.spriteContainer = document.createElement('div');
        this.spriteContainer.className = 'jrpg-sprite-container';
        avatarWrapper.appendChild(this.spriteContainer);

        this.moodLabel = document.createElement('div');
        this.moodLabel.className = 'rpg-mood-label';
        avatarWrapper.appendChild(this.moodLabel);

        const dialogArea = document.createElement('div');
        dialogArea.className = 'jrpg-dialog-area';

        const statsHeader = document.createElement('div');
        statsHeader.className = 'jrpg-stats-header';

        statsHeader.innerHTML = `
            <div class="jrpg-stat-item"><span id="jrpg-hp-text"></span><div class="jrpg-bar-bg"><div class="jrpg-bar-fill hp" id="jrpg-hp-fill"></div></div></div>
            <div class="jrpg-stat-item"><span id="jrpg-xp-text"></span><div class="jrpg-bar-bg"><div class="jrpg-bar-fill xp" id="jrpg-xp-fill"></div></div></div>
            <div class="jrpg-stat-item"><span id="jrpg-mood-text"></span><div class="jrpg-bar-bg"><div class="jrpg-bar-fill mood" id="jrpg-mood-fill"></div></div></div>
            <div class="jrpg-stat-item" style="justify-content: center; font-size: 1.2em;"><span id="jrpg-gold-text"></span></div>
        `;

        const nameLabel = document.createElement('div');
        nameLabel.className = 'jrpg-character-name'; nameLabel.innerText = c?.name || "Неизвестный";

        this.dialogText = document.createElement('div');
        this.dialogText.className = 'jrpg-dialog-text';

        dialogArea.appendChild(statsHeader); dialogArea.appendChild(nameLabel); dialogArea.appendChild(this.dialogText);

        this.container.appendChild(avatarWrapper);
        this.container.appendChild(dialogArea);
        document.body.appendChild(this.container);

        this.hpText = document.getElementById('jrpg-hp-text');
        this.xpText = document.getElementById('jrpg-xp-text');
        this.moodText = document.getElementById('jrpg-mood-text');
        this.goldText = document.getElementById('jrpg-gold-text');

        this.hpFill = document.getElementById('jrpg-hp-fill');
        this.xpFill = document.getElementById('jrpg-xp-fill');
        this.moodFill = document.getElementById('jrpg-mood-fill');

        this.setChatText(emotion.phrases?.greeting || "Приветствую.");
        this.updateStatsUI(); // Теперь вызывается как async
    }

    setChatText(text) { if (this.dialogText) this.dialogText.innerText = `«${text}»`; }

    // ТЕПЕРЬ ФУНКЦИЯ ASYNC - БЕЗ ОШИБОК И СПАМА
    async updateStatsUI() {
        const p = this.plugin; const c = p.currentCompanion; const u = p.currentUniverse;
        if (!c || !u || !this.xpFill) return;

        const t = c.terminology || { hp: "HP", xp: "Опыт", mood: "Настроение" };
        const ui = u.ui || { coin_icon: "🪙" };
        const emotion = this.getEmotion();

        // 1. УМНОЕ ОБНОВЛЕНИЕ АВАТАРА
        this.spriteContainer.innerHTML = "";
        if (emotion.icon_img) {
            const imgPath = `${p.manifest.dir}/companions/${p.data.companionId}/sprites/${emotion.icon_img}`;

            // Заранее проверяем, существует ли картинка, чтобы не спамить в консоль 404
            if (await p.app.vault.adapter.exists(imgPath)) {
                const src = p.app.vault.adapter.getResourcePath(imgPath);
                const img = document.createElement('img');
                img.src = src;
                img.className = 'jrpg-sprite-img';
                this.spriteContainer.appendChild(img);
            } else {
                this.renderTextAvatar(emotion.avatar_text);
            }
        } else {
            this.renderTextAvatar(emotion.avatar_text);
        }

        // 2. Обновляем плашку Настроения
        this.moodLabel.innerText = emotion.mood_name || "Нейтрально";

        // 3. Обновляем полоски
        const xpPercent = (p.state.xp / p.state.xpToNextLevel) * 100;
        const hpPercent = (p.state.hp / p.state.maxHp) * 100;
        const moodPercent = p.state.mood || 0;

        this.xpFill.style.width = `${Math.min(100, xpPercent)}%`;
        this.hpFill.style.width = `${Math.min(100, hpPercent)}%`;
        this.moodFill.style.width = `${Math.min(100, moodPercent)}%`;

        if (this.hpText) this.hpText.innerText = `${t.hp}: ${p.state.hp}/${p.state.maxHp}`;
        if (this.xpText) this.xpText.innerText = `${t.xp}: ${p.state.level} Ур.`;
        if (this.moodText) this.moodText.innerText = `${t.mood}: ${p.state.mood}%`;
        if (this.goldText) this.goldText.innerText = `${ui.coin_icon} ${p.state.coins}`;
    }

    renderTextAvatar(text) {
        // Оборачиваем эмодзи в span для точного контроля в CSS
        this.spriteContainer.innerHTML = `<span class="jrpg-text-avatar">${text || '👤'}</span>`;
        
        // Очищаем старые инлайн-стили (на случай если переключились с картинки на текст и обратно)
        this.spriteContainer.style.display = '';
        this.spriteContainer.style.alignItems = '';
        this.spriteContainer.style.justifyContent = '';
        this.spriteContainer.style.fontSize = '';
    }

    remove() { if (this.container) this.container.remove(); }
}