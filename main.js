/* Обсидиан Плагин: Chronicle.md */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.js
var main_exports = {};
__export(main_exports, {
  default: () => DailyRPGPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian11 = require("obsidian");

// src/modules/SelectionModal.js
var import_obsidian = require("obsidian");
var SelectionModal = class extends import_obsidian.SuggestModal {
  constructor(app, items, onChoose) {
    super(app);
    this.items = items;
    this.onChoose = onChoose;
    this.setPlaceholder("\u041D\u0430\u0447\u043D\u0438 \u0432\u0432\u043E\u0434\u0438\u0442\u044C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435...");
  }
  getSuggestions(query) {
    return this.items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }
  renderSuggestion(item, el) {
    el.createEl("div", { text: item });
  }
  onChooseSuggestion(item, evt) {
    this.onChoose(item);
  }
};

// src/modules/CalendarModal.js
var import_obsidian2 = require("obsidian");
var CalendarModal = class extends import_obsidian2.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.currentDate = window.moment();
  }
  onOpen() {
    this.renderCalendar();
  }
  renderCalendar() {
    var _a;
    const { contentEl } = this;
    contentEl.empty();
    const uiText = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.ui) || { calendar_title: "\u{1F4C5} \u0425\u0440\u043E\u043D\u0438\u043A\u0438", quest_icon: "\u2694\uFE0F" };
    contentEl.createEl("h2", { text: uiText.calendar_title, style: "text-align: center; color: var(--interactive-accent); border-bottom: 2px solid var(--background-modifier-border); padding-bottom: 10px; font-family: var(--font-text);" });
    const header = contentEl.createEl("div", { cls: "rpg-calendar-header" });
    const prevBtn = header.createEl("button", { text: "\u25C0" });
    const monthName = this.currentDate.format("MMMM YYYY");
    header.createEl("h3", { text: monthName.charAt(0).toUpperCase() + monthName.slice(1), style: "margin: 0; color: var(--text-normal); font-family: var(--font-text);" });
    const nextBtn = header.createEl("button", { text: "\u25B6" });
    prevBtn.onclick = () => {
      this.currentDate.subtract(1, "month");
      this.renderCalendar();
    };
    nextBtn.onclick = () => {
      this.currentDate.add(1, "month");
      this.renderCalendar();
    };
    const grid = contentEl.createEl("div", { cls: "rpg-calendar-grid" });
    ["\u041F\u043D", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041F\u0442", "\u0421\u0431", "\u0412\u0441"].forEach((d) => grid.createEl("div", { cls: "rpg-calendar-dow", text: d }));
    const startOfMonth = this.currentDate.clone().startOf("month");
    const endOfMonth = this.currentDate.clone().endOf("month");
    let startDayOfWeek = startOfMonth.day();
    if (startDayOfWeek === 0) startDayOfWeek = 7;
    startDayOfWeek--;
    for (let i = 0; i < startDayOfWeek; i++) grid.createEl("div", { cls: "rpg-calendar-day empty" });
    const history = this.plugin.data.history || {};
    const todayStr = window.moment().format("YYYY-MM-DD");
    for (let day = 1; day <= endOfMonth.date(); day++) {
      const dateStr = startOfMonth.clone().date(day).format("YYYY-MM-DD");
      const questsDone = history[dateStr] || 0;
      const dayCell = grid.createEl("div", { cls: "rpg-calendar-day" });
      dayCell.createEl("span", { text: day.toString(), style: "color: var(--text-normal);" });
      if (dateStr === todayStr) dayCell.addClass("today");
      if (questsDone > 0) {
        dayCell.addClass("has-quests");
        dayCell.createEl("span", { cls: "rpg-quest-badge", text: `${uiText.quest_icon} ${questsDone}` });
      }
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modules/JRPGInterface.js
var JRPGInterface = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  getEmotion() {
    const c = this.plugin.currentCompanion;
    const currentMood = this.plugin.state.mood || 0;
    const defaultPhrases = (c == null ? void 0 : c.phrases) || { task_done: ["\u041E\u043A."], task_undone: "\u041E\u043A.", level_up: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C.", death: "\u0421\u043C\u0435\u0440\u0442\u044C." };
    if (!c || !c.emotions || c.emotions.length === 0) {
      return { mood_name: "\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E", avatar_text: (c == null ? void 0 : c.avatar_text) || "\u{1F464}", phrases: defaultPhrases };
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
    var _a;
    const p = this.plugin;
    const c = p.currentCompanion;
    const u = p.currentUniverse;
    const t = (c == null ? void 0 : c.terminology) || { hp: "HP", xp: "\u041E\u043F\u044B\u0442", mood: "\u041D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435" };
    const colors = (c == null ? void 0 : c.colors) || { hp: "#b30000", xp: "#4b0082", mood: "#f1c40f" };
    const ui = (u == null ? void 0 : u.ui) || { coin_icon: "\u{1FA99}" };
    const emotion = this.getEmotion();
    this.container = document.createElement("div");
    this.container.className = "jrpg-bottom-panel";
    this.container.style.setProperty("--dyn-hp-color", colors.hp);
    this.container.style.setProperty("--dyn-xp-color", colors.xp);
    this.container.style.setProperty("--dyn-mood-color", colors.mood);
    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "rpg-avatar-wrapper";
    this.spriteContainer = document.createElement("div");
    this.spriteContainer.className = "jrpg-sprite-container";
    avatarWrapper.appendChild(this.spriteContainer);
    this.moodLabel = document.createElement("div");
    this.moodLabel.className = "rpg-mood-label";
    avatarWrapper.appendChild(this.moodLabel);
    const dialogArea = document.createElement("div");
    dialogArea.className = "jrpg-dialog-area";
    const statsHeader = document.createElement("div");
    statsHeader.className = "jrpg-stats-header";
    statsHeader.innerHTML = `
            <div class="jrpg-stat-item"><span id="jrpg-hp-text"></span><div class="jrpg-bar-bg"><div class="jrpg-bar-fill hp" id="jrpg-hp-fill"></div></div></div>
            <div class="jrpg-stat-item"><span id="jrpg-xp-text"></span><div class="jrpg-bar-bg"><div class="jrpg-bar-fill xp" id="jrpg-xp-fill"></div></div></div>
            <div class="jrpg-stat-item"><span id="jrpg-mood-text"></span><div class="jrpg-bar-bg"><div class="jrpg-bar-fill mood" id="jrpg-mood-fill"></div></div></div>
            <div class="jrpg-stat-item" style="justify-content: center; font-size: 1.2em;"><span id="jrpg-gold-text"></span></div>
        `;
    const nameLabel = document.createElement("div");
    nameLabel.className = "jrpg-character-name";
    nameLabel.innerText = (c == null ? void 0 : c.name) || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439";
    this.dialogText = document.createElement("div");
    this.dialogText.className = "jrpg-dialog-text";
    dialogArea.appendChild(statsHeader);
    dialogArea.appendChild(nameLabel);
    dialogArea.appendChild(this.dialogText);
    this.container.appendChild(avatarWrapper);
    this.container.appendChild(dialogArea);
    document.body.appendChild(this.container);
    this.hpText = document.getElementById("jrpg-hp-text");
    this.xpText = document.getElementById("jrpg-xp-text");
    this.moodText = document.getElementById("jrpg-mood-text");
    this.goldText = document.getElementById("jrpg-gold-text");
    this.hpFill = document.getElementById("jrpg-hp-fill");
    this.xpFill = document.getElementById("jrpg-xp-fill");
    this.moodFill = document.getElementById("jrpg-mood-fill");
    this.setChatText(((_a = emotion.phrases) == null ? void 0 : _a.greeting) || "\u041F\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E.");
    this.updateStatsUI();
  }
  setChatText(text) {
    if (this.dialogText) this.dialogText.innerText = `\xAB${text}\xBB`;
  }
  // ТЕПЕРЬ ФУНКЦИЯ ASYNC - БЕЗ ОШИБОК И СПАМА
  async updateStatsUI() {
    const p = this.plugin;
    const c = p.currentCompanion;
    const u = p.currentUniverse;
    if (!c || !u || !this.xpFill) return;
    const t = c.terminology || { hp: "HP", xp: "\u041E\u043F\u044B\u0442", mood: "\u041D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435" };
    const ui = u.ui || { coin_icon: "\u{1FA99}" };
    const emotion = this.getEmotion();
    this.spriteContainer.innerHTML = "";
    if (emotion.icon_img) {
      const imgPath = `${p.manifest.dir}/companions/${p.data.companionId}/sprites/${emotion.icon_img}`;
      if (await p.app.vault.adapter.exists(imgPath)) {
        const src = p.app.vault.adapter.getResourcePath(imgPath);
        const img = document.createElement("img");
        img.src = src;
        img.className = "jrpg-sprite-img";
        this.spriteContainer.appendChild(img);
      } else {
        this.renderTextAvatar(emotion.avatar_text);
      }
    } else {
      this.renderTextAvatar(emotion.avatar_text);
    }
    this.moodLabel.innerText = emotion.mood_name || "\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E";
    const xpPercent = p.state.xp / p.state.xpToNextLevel * 100;
    const hpPercent = p.state.hp / p.state.maxHp * 100;
    const moodPercent = p.state.mood || 0;
    this.xpFill.style.width = `${Math.min(100, xpPercent)}%`;
    this.hpFill.style.width = `${Math.min(100, hpPercent)}%`;
    this.moodFill.style.width = `${Math.min(100, moodPercent)}%`;
    if (this.hpText) this.hpText.innerText = `${t.hp}: ${p.state.hp}/${p.state.maxHp}`;
    if (this.xpText) this.xpText.innerText = `${t.xp}: ${p.state.level} \u0423\u0440.`;
    if (this.moodText) this.moodText.innerText = `${t.mood}: ${p.state.mood}%`;
    if (this.goldText) this.goldText.innerText = `${ui.coin_icon} ${p.state.coins}`;
  }
  renderTextAvatar(text) {
    this.spriteContainer.innerHTML = `<span class="jrpg-text-avatar">${text || "\u{1F464}"}</span>`;
    this.spriteContainer.style.display = "";
    this.spriteContainer.style.alignItems = "";
    this.spriteContainer.style.justifyContent = "";
    this.spriteContainer.style.fontSize = "";
  }
  remove() {
    if (this.container) this.container.remove();
  }
};

// src/modules/QuestLogView.js
var import_obsidian3 = require("obsidian");
var VIEW_TYPE_QUEST_LOG = "chronicle-md-quest-log";
var QuestLogView = class extends import_obsidian3.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.isProcessing = false;
    this.viewMode = "local";
  }
  getViewType() {
    return VIEW_TYPE_QUEST_LOG;
  }
  getDisplayText() {
    return "\u0416\u0443\u0440\u043D\u0430\u043B \u041A\u0432\u0435\u0441\u0442\u043E\u0432";
  }
  getIcon() {
    return "clipboard-list";
  }
  async onOpen() {
    await this.renderTasks();
    this.registerEvent(this.app.workspace.on("file-open", () => this.renderTasks()));
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (this.viewMode === "local" && activeFile && file.path === activeFile.path) {
          this.renderTasks();
        } else if (this.viewMode !== "local") {
          setTimeout(() => this.renderTasks(), 200);
        }
      })
    );
  }
  async renderTasks() {
    var _a;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("rpg-quest-log-container");
    const uiText = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.ui) || {
      quest_board: "\u{1F4DC} \u0414\u043E\u0441\u043A\u0430 \u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432",
      current_location: "\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043B\u043E\u043A\u0430\u0446\u0438\u044F",
      global_map: "\u041A\u0430\u0440\u0442\u0430 \u043C\u0438\u0440\u0430",
      completed_quests: "\u0410\u0440\u0445\u0438\u0432",
      no_quests: "\u041F\u0443\u0441\u0442\u043E."
    };
    container.createEl("div", { cls: "rpg-quest-board-title", text: uiText.quest_board });
    const toggleDiv = container.createEl("div", { cls: "rpg-quest-toggle" });
    const btnLocal = toggleDiv.createEl("button", { text: uiText.current_location });
    const btnGlobal = toggleDiv.createEl("button", { text: uiText.global_map });
    const btnCompleted = toggleDiv.createEl("button", { text: uiText.completed_quests });
    if (this.viewMode === "local") btnLocal.addClass("active");
    else if (this.viewMode === "global") btnGlobal.addClass("active");
    else btnCompleted.addClass("active");
    btnLocal.onclick = () => {
      this.viewMode = "local";
      this.renderTasks();
    };
    btnGlobal.onclick = () => {
      this.viewMode = "global";
      this.renderTasks();
    };
    btnCompleted.onclick = () => {
      this.viewMode = "completed";
      this.renderTasks();
    };
    this.listContainer = container.createEl("div");
    if (this.viewMode === "local") await this.renderLocalMode(uiText);
    else if (this.viewMode === "global") await this.renderGlobalMode(uiText, "unfinished");
    else await this.renderGlobalMode(uiText, "completed");
  }
  async renderLocalMode(uiText) {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || activeFile.extension !== "md") {
      this.listContainer.createEl("p", { text: uiText.no_quests, style: "text-align: center; color: var(--text-muted);" });
      return;
    }
    await this.processFileTasks(activeFile, uiText.no_quests, "all");
  }
  async renderGlobalMode(uiText, filterType) {
    const files = this.app.vault.getMarkdownFiles();
    let foundAny = false;
    const sortedFiles = files.sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, 30);
    for (const file of sortedFiles) {
      const hasTasks = await this.processFileTasks(file, null, filterType);
      if (hasTasks) foundAny = true;
    }
    if (!foundAny) this.listContainer.createEl("p", { text: uiText.no_quests, style: "text-align: center; color: var(--text-muted);" });
  }
  async processFileTasks(file, emptyMessage, filterType) {
    const content = await this.app.vault.read(file);
    const lines = content.split("\n");
    const tasks = [];
    const taskRegex = /^([ \t]*)- \[(.)\] (.*)/;
    lines.forEach((line, index) => {
      const match = line.match(taskRegex);
      if (match) {
        const isCompleted = match[2].toLowerCase() === "x";
        if (filterType === "unfinished" && isCompleted) return;
        if (filterType === "completed" && !isCompleted) return;
        tasks.push({ lineIndex: index, isCompleted, text: match[3] });
      }
    });
    if (tasks.length === 0) {
      if (emptyMessage) this.listContainer.createEl("p", { text: emptyMessage, style: "text-align: center; color: var(--text-muted);" });
      return false;
    }
    const card = this.listContainer.createEl("div", { cls: "rpg-quest-day-card" });
    const header = card.createEl("div", { cls: "rpg-quest-day-header" });
    header.createEl("span", { text: file.basename });
    const list = card.createEl("ul", { cls: "rpg-quest-list" });
    tasks.forEach((task) => {
      const li = list.createEl("li", { text: task.text });
      if (task.isCompleted) li.addClass("completed");
      li.addEventListener("click", async () => {
        if (this.isProcessing) return;
        this.isProcessing = true;
        await this.toggleTaskInFile(file, task.lineIndex, !task.isCompleted);
        await this.plugin.recordTaskCompletion(!task.isCompleted, task.text);
        setTimeout(() => {
          this.isProcessing = false;
        }, 500);
      });
    });
    return true;
  }
  async toggleTaskInFile(file, lineIndex, makeCompleted) {
    await this.app.vault.process(file, (data) => {
      const lines = data.split("\n");
      const line = lines[lineIndex];
      if (makeCompleted) lines[lineIndex] = line.replace(/- \[(.)\]/, "- [x]");
      else lines[lineIndex] = line.replace(/- \[(.)\]/, "- [ ]");
      return lines.join("\n");
    });
  }
  async onClose() {
  }
};

// src/modules/ShopModal.js
var import_obsidian4 = require("obsidian");
var ShopModal = class extends import_obsidian4.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    this.render();
  }
  render() {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("rpg-shop-container");
    const uiText = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.ui) || {};
    const shopTitle = uiText.shop_title || "\u{1F6D2} \u041B\u0430\u0432\u043A\u0430";
    const coinIcon = uiText.coin_icon || "\u{1FA99}";
    const header = contentEl.createEl("div", { cls: "rpg-shop-header" });
    header.createEl("h2", { text: shopTitle, style: "margin: 0; color: var(--interactive-accent); font-family: var(--font-text);" });
    const effStats = this.plugin.game.getEffectiveStats().effective;
    const discountPct = Math.min(50, (effStats["C"] || 0) * 2);
    header.createEl("div", { cls: "rpg-shop-balance", text: `${coinIcon} ${this.plugin.state.coins} (\u0421\u043A\u0438\u0434\u043A\u0430 ${discountPct}%)` });
    const grid = contentEl.createEl("div", { cls: "rpg-shop-grid" });
    const items = ((_b = this.plugin.currentUniverse) == null ? void 0 : _b.items) || [];
    if (items.length === 0) {
      grid.createEl("p", { text: "\u0422\u043E\u0440\u0433\u043E\u0432\u0435\u0446 \u0443\u0448\u0435\u043B \u043D\u0430 \u043E\u0431\u0435\u0434. \u0412 \u044D\u0442\u043E\u0439 \u0432\u0441\u0435\u043B\u0435\u043D\u043D\u043E\u0439 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043D\u0435\u0442.", style: "color: var(--text-muted); grid-column: 1 / -1; text-align: center;" });
      return;
    }
    items.forEach((item) => {
      const itemRarity = item.rarity || "common";
      const card = grid.createEl("div", { cls: `rpg-item-card rpg-rarity-${itemRarity}` });
      const top = card.createEl("div", { cls: "rpg-item-header" });
      const iconEl = top.createEl("div", { cls: "rpg-item-icon" });
      if (item.icon_img) {
        const imgPath = `${this.plugin.manifest.dir}/universes/${this.plugin.data.universeId}/items_icon/${item.icon_img}`;
        const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
        const img = iconEl.createEl("img", { attr: { src } });
        img.onerror = () => {
          img.remove();
          iconEl.innerText = item.icon_text || "\u{1F4E6}";
        };
      } else {
        iconEl.innerText = item.icon_text || item.icon || "\u{1F4E6}";
      }
      const info = top.createEl("div", { cls: "rpg-item-info" });
      info.createEl("div", { cls: "rpg-item-name", text: item.name });
      info.createEl("div", { cls: "rpg-item-desc", text: item.description });
      const finalPrice = Math.max(1, Math.floor(item.price * (1 - discountPct / 100)));
      const btn = card.createEl("button", { cls: "rpg-item-action" });
      btn.innerText = discountPct > 0 ? `\u041A\u0443\u043F\u0438\u0442\u044C (${coinIcon} ${finalPrice})` : `\u041A\u0443\u043F\u0438\u0442\u044C (${coinIcon} ${item.price})`;
      if (this.plugin.state.coins < finalPrice) btn.disabled = true;
      btn.onclick = async () => {
        if (this.plugin.state.coins >= finalPrice) {
          await this.plugin.loseCoins(finalPrice);
          await this.plugin.inventory.addToInventory(item.id);
          new import_obsidian4.Notice(`\u041A\u0443\u043F\u043B\u0435\u043D\u043E: ${item.name}`);
          this.render();
        }
      };
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modules/InventoryModal.js
var import_obsidian5 = require("obsidian");
var InventoryModal = class extends import_obsidian5.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.selectedItemId = null;
  }
  onOpen() {
    this.render();
  }
  render() {
    var _a;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("rpg-shop-container");
    const uiText = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.ui) || {};
    const invTitle = uiText.inventory_title || "\u{1F392} \u0420\u044E\u043A\u0437\u0430\u043A";
    const maxSlots = 20 + (this.plugin.state.level - 1) * 2;
    const header = contentEl.createEl("div", { cls: "rpg-shop-header" });
    header.createEl("h2", { text: invTitle, style: "margin: 0; color: var(--interactive-accent); font-family: var(--font-text);" });
    header.createEl("div", { text: `\u0423\u0440. ${this.plugin.state.level} | \u0421\u043B\u043E\u0442\u043E\u0432: ${maxSlots}`, style: "color: var(--text-muted); font-weight: bold;" });
    const layout = contentEl.createEl("div", { cls: "rpg-inv-layout" });
    const gridContainer = layout.createEl("div", { cls: "rpg-inv-grid-container" });
    const grid = gridContainer.createEl("div", { cls: "rpg-inv-grid" });
    const inventory = this.plugin.state.inventory || [];
    const equippedItems = Object.values(this.plugin.state.equipment || {});
    for (let i = 0; i < maxSlots; i++) {
      const slot = grid.createEl("div", { cls: "rpg-inv-slot" });
      if (i < inventory.length) {
        const invItem = inventory[i];
        const itemData = this.plugin.itemsDatabase.get(invItem.id);
        if (itemData) {
          if (itemData.icon_img) {
            const imgPath = `${this.plugin.manifest.dir}/universes/${itemData.universe_id}/items_icon/${itemData.icon_img}`;
            const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
            const img = slot.createEl("img", { attr: { src } });
            img.onerror = () => {
              img.remove();
              slot.innerText = itemData.icon_text || "\u{1F4E6}";
            };
          } else {
            slot.innerText = itemData.icon_text || itemData.icon || "\u{1F4E6}";
          }
          if (invItem.quantity > 1) slot.createEl("span", { cls: "rpg-slot-qty", text: `x${invItem.quantity}` });
          if (this.selectedItemId === invItem.id) slot.addClass("selected");
          if (equippedItems.includes(invItem.id)) slot.addClass("equipped");
          slot.onclick = () => {
            this.selectedItemId = invItem.id;
            this.render();
          };
        }
      } else {
        slot.addClass("empty");
      }
    }
    const sidebar = layout.createEl("div", { cls: "rpg-inv-sidebar" });
    if (!this.selectedItemId) {
      sidebar.createEl("div", { text: "\u0412\u044B\u0431\u0435\u0440\u0438 \u043F\u0440\u0435\u0434\u043C\u0435\u0442", style: "text-align: center; color: var(--text-muted); margin-top: auto; margin-bottom: auto;" });
      return;
    }
    const selectedInvItem = inventory.find((i) => i.id === this.selectedItemId);
    const selectedData = this.plugin.itemsDatabase.get(this.selectedItemId);
    if (!selectedInvItem || !selectedData) {
      this.selectedItemId = null;
      this.render();
      return;
    }
    const itemRarity = selectedData.rarity || "common";
    sidebar.addClass(`rpg-rarity-${itemRarity}`);
    const iconEl = sidebar.createEl("div", { cls: "rpg-sidebar-icon" });
    if (selectedData.icon_img) {
      const imgPath = `${this.plugin.manifest.dir}/universes/${selectedData.universe_id}/items_icon/${selectedData.icon_img}`;
      const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
      const img = iconEl.createEl("img", { attr: { src }, style: "width: 100%; height: 100%; object-fit: contain;" });
      img.onerror = () => {
        img.remove();
        iconEl.innerText = selectedData.icon_text || "\u{1F4E6}";
      };
    } else {
      iconEl.innerText = selectedData.icon_text || selectedData.icon || "\u{1F4E6}";
    }
    sidebar.createEl("div", { cls: "rpg-item-name", text: `${selectedData.name} (x${selectedInvItem.quantity})`, style: "text-align: center; margin-bottom: 10px; font-size: 1.2em;" });
    sidebar.createEl("div", { cls: "rpg-sidebar-desc", text: selectedData.description });
    const actions = sidebar.createEl("div", { cls: "rpg-sidebar-actions" });
    const isEquipped = equippedItems.includes(selectedInvItem.id);
    if (selectedData.type === "equipment") {
      if (isEquipped) {
        const btnUnequip = actions.createEl("button", { cls: "btn-use", text: "\u0421\u043D\u044F\u0442\u044C" });
        btnUnequip.onclick = async () => {
          await this.plugin.inventory.unequipItem(selectedData.equipSlot);
          this.render();
        };
      } else {
        const btnEquip = actions.createEl("button", { cls: "btn-use", text: "\u041D\u0430\u0434\u0435\u0442\u044C" });
        btnEquip.onclick = async () => {
          await this.plugin.inventory.equipItem(selectedData.equipSlot, selectedInvItem.id);
          this.render();
        };
      }
    } else {
      const btnUse = actions.createEl("button", { cls: "btn-use", text: uiText.btn_use || "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C" });
      btnUse.onclick = async () => {
        await this.plugin.inventory.useItem(selectedInvItem.id, selectedData);
        const check = this.plugin.state.inventory.find((i) => i.id === this.selectedItemId);
        if (!check) this.selectedItemId = null;
        this.render();
      };
    }
    if (!isEquipped) {
      const btnDrop = actions.createEl("button", { cls: "btn-drop", text: uiText.btn_drop || "\u0412\u044B\u0431\u0440\u043E\u0441\u0438\u0442\u044C" });
      btnDrop.onclick = async () => {
        await this.plugin.inventory.dropItem(selectedInvItem.id);
        const check = this.plugin.state.inventory.find((i) => i.id === this.selectedItemId);
        if (!check) this.selectedItemId = null;
        this.render();
      };
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modules/CharacterModal.js
var import_obsidian6 = require("obsidian");
var CharacterModal = class extends import_obsidian6.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    this.render();
  }
  render() {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("rpg-shop-container");
    const p = this.plugin;
    const c = p.currentCompanion;
    const ui = ((_a = p.currentUniverse) == null ? void 0 : _a.ui) || { coin_icon: "\u{1FA99}" };
    const t = ((_b = p.currentUniverse) == null ? void 0 : _b.terminology) || {};
    contentEl.createEl("h2", { text: "\u{1FAAA} \u041B\u0438\u0447\u043D\u043E\u0435 \u0414\u0435\u043B\u043E", style: "text-align: center; color: var(--interactive-accent); margin: 0;" });
    const layout = contentEl.createEl("div", { cls: "rpg-char-layout" });
    const left = layout.createEl("div", { cls: "rpg-char-left" });
    const avatarContainer = left.createEl("div", { cls: "rpg-char-avatar" });
    if (p.currentSpriteUrl) {
      const img = avatarContainer.createEl("img", { attr: { src: p.currentSpriteUrl } });
      img.onerror = () => {
        img.remove();
        avatarContainer.innerText = c.avatar_text || "\u{1F464}";
        avatarContainer.style.fontSize = "4em";
      };
    } else {
      avatarContainer.innerText = c.avatar_text || "\u{1F464}";
      avatarContainer.style.fontSize = "4em";
    }
    left.createEl("div", { cls: "rpg-char-name", text: (c == null ? void 0 : c.name) || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439" });
    const statsSummary = left.createEl("div", { style: "text-align: center; width: 100%; font-family: monospace; font-size: 1.1em; line-height: 1.5; color: var(--text-normal);" });
    statsSummary.createEl("div", { text: `${t.level} ${p.state.level} (${Math.floor(p.state.xp)}/${p.state.xpToNextLevel} XP)` });
    statsSummary.createEl("div", { text: `${t.hp}: ${p.state.hp}/${p.state.maxHp}`, style: "color: #e74c3c;" });
    statsSummary.createEl("div", { text: `\u0411\u0430\u043B\u0430\u043D\u0441: ${ui.coin_icon} ${p.state.coins}` });
    const equip = left.createEl("div", { cls: "rpg-char-equip" });
    const eqState = p.state.equipment || {};
    const renderSlot = (slotName, slotLabel) => {
      const itemId = eqState[slotName];
      const slotEl = equip.createEl("div", { cls: "rpg-equip-slot" });
      if (itemId) {
        const itemData = p.itemsDatabase.get(itemId);
        if (itemData) {
          if (itemData.icon_img) {
            const imgPath = `${this.plugin.manifest.dir}/universes/${itemData.universe_id}/items_icon/${itemData.icon_img}`;
            const src = this.plugin.app.vault.adapter.getResourcePath(imgPath);
            const img = slotEl.createEl("img", { attr: { src }, style: "width:24px; height:24px; object-fit:contain;" });
            img.onerror = () => {
              img.remove();
              slotEl.createEl("span", { text: itemData.icon_text || "\u{1F4E6}" });
            };
          } else {
            slotEl.createEl("span", { text: itemData.icon_text || itemData.icon || "\u{1F4E6}" });
          }
          slotEl.createEl("span", { text: itemData.name });
          return;
        }
      }
      slotEl.innerText = `${slotLabel} (\u041F\u0443\u0441\u0442\u043E)`;
      slotEl.style.color = "var(--text-muted)";
    };
    renderSlot("head", "\u0413\u043E\u043B\u043E\u0432\u0430");
    renderSlot("body", "\u0411\u0440\u043E\u043D\u044F");
    renderSlot("weapon", "\u041E\u0440\u0443\u0436\u0438\u0435");
    renderSlot("accessory", "\u0410\u043A\u0441\u0435\u0441\u0441\u0443\u0430\u0440");
    const right = layout.createEl("div", { cls: "rpg-char-right" });
    const statsData = p.game.getEffectiveStats();
    const baseStats = statsData.base;
    const effStats = statsData.effective;
    const specialDefs = [
      { key: "S", name: "\u0421\u0438\u043B\u0430 (Strength)", desc: "+5 \u041C\u0430\u043A\u0441. HP \u0437\u0430 \u043A\u0430\u0436\u0434\u043E\u0435 \u043E\u0447\u043A\u043E" },
      { key: "P", name: "\u0412\u043E\u0441\u043F\u0440\u0438\u044F\u0442\u0438\u0435 (Perception)", desc: "+2% \u043A \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u043C\u043E\u043C\u0443 \u0417\u043E\u043B\u043E\u0442\u0443" },
      { key: "E", name: "\u0412\u044B\u043D\u043E\u0441\u043B\u0438\u0432\u043E\u0441\u0442\u044C (Endurance)", desc: "-1 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E\u0433\u043E \u0443\u0440\u043E\u043D\u0430 \u0437\u0430 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0438" },
      { key: "C", name: "\u0425\u0430\u0440\u0438\u0437\u043C\u0430 (Charisma)", desc: "-2% \u0446\u0435\u043D\u044B \u0432 \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u0435 (\u043C\u0430\u043A\u0441. -50%)" },
      { key: "I", name: "\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442 (Intelligence)", desc: "+2% \u043A \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u043C\u043E\u043C\u0443 \u041E\u043F\u044B\u0442\u0443" },
      { key: "A", name: "\u041B\u043E\u0432\u043A\u043E\u0441\u0442\u044C (Agility)", desc: "+2% \u0448\u0430\u043D\u0441 \u0443\u043A\u043B\u043E\u043D\u0438\u0442\u044C\u0441\u044F \u043E\u0442 \u0443\u0440\u043E\u043D\u0430 (\u043C\u0430\u043A\u0441 70%)" },
      { key: "L", name: "\u0423\u0434\u0430\u0447\u0430 (Luck)", desc: "1% \u0448\u0430\u043D\u0441 \u043D\u0430\u0439\u0442\u0438 \u043F\u0440\u0435\u0434\u043C\u0435\u0442 \u0437\u0430 \u043A\u0432\u0435\u0441\u0442" }
    ];
    specialDefs.forEach((stat) => {
      const row = right.createEl("div", { cls: "rpg-char-stat-row" });
      const info = row.createEl("div", { cls: "rpg-char-stat-info" });
      info.createEl("div", { cls: "rpg-char-stat-name", text: stat.name });
      info.createEl("div", { cls: "rpg-char-stat-desc", text: stat.desc });
      const valContainer = row.createEl("div", { style: "text-align: right;" });
      const baseVal = baseStats[stat.key] || 0;
      const effVal = effStats[stat.key] || 0;
      const diff = effVal - baseVal;
      valContainer.createEl("span", { cls: "rpg-char-stat-val", text: baseVal.toString() });
      if (diff > 0) {
        valContainer.createEl("span", { text: ` (+${diff})`, style: "color: #2ecc71; font-weight: bold; font-size: 0.9em;" });
      } else if (diff < 0) {
        valContainer.createEl("span", { text: ` (${diff})`, style: "color: #e74c3c; font-weight: bold; font-size: 0.9em;" });
      }
    });
    contentEl.createEl("div", { cls: "rpg-char-footer", text: "\u2139\uFE0F \u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430: \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u0435\u0433\u0438 \u0441 \u0437\u0430\u0433\u043B\u0430\u0432\u043D\u043E\u0439 \u0431\u0443\u043A\u0432\u044B (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, #Sport, #Code, #English) \u0432 \u0432\u0430\u0448\u0438\u0445 \u0437\u0430\u0434\u0430\u0447\u0430\u0445, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 S.P.E.C.I.A.L." });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modules/EncounterModal.js
var import_obsidian7 = require("obsidian");
var EncounterModal = class extends import_obsidian7.Modal {
  constructor(app, plugin, encounterData) {
    super(app);
    this.plugin = plugin;
    this.encounter = encounterData;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("rpg-shop-container");
    contentEl.createEl("div", {
      text: this.encounter.icon || "\u{1F3B2}",
      style: "font-size: 4em; text-align: center; margin-bottom: 10px;"
    });
    contentEl.createEl("h2", {
      text: this.encounter.title,
      style: "text-align: center; color: var(--interactive-accent); font-family: var(--font-text); margin-top: 0;"
    });
    contentEl.createEl("p", {
      text: this.encounter.description,
      style: "font-size: 1.1em; line-height: 1.5; color: var(--text-normal); text-align: center; margin-bottom: 25px; padding: 0 15px;"
    });
    const actionsDiv = contentEl.createEl("div", { style: "display: flex; gap: 15px; justify-content: center;" });
    this.encounter.choices.forEach((choice) => {
      const btn = actionsDiv.createEl("button", {
        text: choice.text,
        style: "padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; flex: 1; background: var(--background-secondary); border: 2px solid var(--background-modifier-border); color: var(--text-normal); transition: 0.2s;"
      });
      btn.onmouseover = () => {
        btn.style.borderColor = "var(--interactive-accent)";
      };
      btn.onmouseout = () => {
        btn.style.borderColor = "var(--background-modifier-border)";
      };
      btn.onclick = async () => {
        await this.processOutcomes(choice.outcomes);
        this.close();
      };
    });
  }
  async processOutcomes(outcomes) {
    var _a;
    for (const outcome of outcomes) {
      switch (outcome.type) {
        case "gain_xp":
          await this.plugin.game.gainXP(outcome.value);
          break;
        case "lose_xp":
          await this.plugin.game.loseXP(outcome.value);
          break;
        case "gain_coins":
          await this.plugin.game.gainCoins(outcome.value);
          break;
        case "lose_coins":
          await this.plugin.game.loseCoins(outcome.value);
          break;
        case "gain_hp":
          this.plugin.state.hp = Math.min(this.plugin.state.maxHp, this.plugin.state.hp + outcome.value);
          break;
        case "lose_hp":
          this.plugin.state.hp -= outcome.value;
          if (this.plugin.state.hp <= 0) {
            const penalties = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.penalties) || { death_xp_loss_pct: 10, death_gold_loss_pct: 10 };
            await this.plugin.game.die(penalties);
          }
          break;
        case "gain_mood":
          await this.plugin.game.gainMood(outcome.value);
          break;
        case "lose_mood":
          await this.plugin.game.loseMood(outcome.value);
          break;
        case "message":
          new import_obsidian7.Notice(`\u{1F4DC} ${outcome.text}`, 6e3);
          if (this.plugin.ui) this.plugin.ui.setChatText(outcome.text);
          break;
      }
    }
    await this.plugin.saveProgress();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modules/GameEngine.js
var import_obsidian8 = require("obsidian");
var GameEngine = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  get state() {
    return this.plugin.state;
  }
  getEffectiveStats() {
    const baseStats = this.state.stats || { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 };
    const effectiveStats = { ...baseStats };
    const equipment = this.state.equipment || {};
    for (const slotId in equipment) {
      const itemId = equipment[slotId];
      if (itemId) {
        const itemData = this.plugin.itemsDatabase.get(itemId);
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
    var _a;
    const baseHp = ((_a = this.plugin.currentCompanion) == null ? void 0 : _a.maxHp) || 100;
    const effStats = this.getEffectiveStats().effective;
    const strengthBonus = (effStats["S"] || 0) * 5;
    this.state.maxHp = baseHp + strengthBonus;
    if (this.state.hp > this.state.maxHp) this.state.hp = this.state.maxHp;
  }
  getEmotion() {
    const c = this.plugin.currentCompanion;
    const currentMood = this.state.mood || 0;
    const defaultPhrases = (c == null ? void 0 : c.phrases) || { task_done: ["\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E!"], task_undone: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E.", level_up: "\u041D\u043E\u0432\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C!", death: "\u0412\u044B \u043F\u043E\u0433\u0438\u0431\u043B\u0438." };
    if (!c || !c.emotions || c.emotions.length === 0) return { phrases: defaultPhrases, avatar_text: (c == null ? void 0 : c.avatar_text) || "\u{1F464}" };
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
  async gainMood(amount) {
    this.state.mood = Math.min(100, (this.state.mood || 0) + amount);
  }
  async loseMood(amount) {
    this.state.mood = Math.max(0, (this.state.mood || 0) - amount);
  }
  async recordTaskCompletion(isCompleted, taskText = "") {
    var _a, _b, _c, _d, _e;
    const today = window.moment().format("YYYY-MM-DD");
    if (!this.plugin.data.history[today]) this.plugin.data.history[today] = 0;
    let xpReward = 25;
    let coinReward = 5;
    const modifiers = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.modifiers) || {};
    for (const [tag, mults] of Object.entries(modifiers)) {
      if (taskText.includes(tag)) {
        xpReward = Math.round(xpReward * mults.xp);
        coinReward = Math.round(coinReward * mults.coins);
        break;
      }
    }
    let gainedStat = null;
    const tags = taskText.match(/#[a-zA-Zа-яА-ЯёЁ_0-9]+/g) || [];
    const specialKeys = ["S", "P", "E", "C", "I", "A", "L"];
    if (isCompleted) {
      for (let tag of tags) {
        const firstLetter = tag.charAt(1);
        if (specialKeys.includes(firstLetter)) {
          if (firstLetter === "C" && this.state.stats["C"] >= 25) continue;
          if (firstLetter === "A" && this.state.stats["A"] >= 35) continue;
          this.state.stats[firstLetter]++;
          gainedStat = firstLetter;
          break;
        }
      }
    } else {
      for (let tag of tags) {
        const firstLetter = tag.charAt(1);
        if (specialKeys.includes(firstLetter)) {
          this.state.stats[firstLetter] = Math.max(0, this.state.stats[firstLetter] - 1);
          break;
        }
      }
    }
    this.recalculateMaxHp();
    const effStats = this.getEffectiveStats().effective;
    if (isCompleted) {
      this.plugin.data.history[today]++;
      await this.gainMood(2);
      const iBonus = 1 + (effStats["I"] || 0) * 0.02;
      const pBonus = 1 + (effStats["P"] || 0) * 0.02;
      await this.gainXP(Math.round(xpReward * iBonus));
      await this.gainCoins(Math.round(coinReward * pBonus));
      let luckChance = effStats["L"] || 0;
      let itemsToGive = 0;
      const encounters = ((_b = this.plugin.currentUniverse) == null ? void 0 : _b.encounters) || [];
      const ENCOUNTER_CHANCE = 5;
      if (encounters.length > 0 && Math.random() * 100 < ENCOUNTER_CHANCE) {
        const randomEncounter = encounters[Math.floor(Math.random() * encounters.length)];
        this.plugin.triggerEncounter(randomEncounter);
      }
      while (luckChance >= 100) {
        itemsToGive++;
        luckChance -= 100;
      }
      if (Math.random() * 100 < luckChance) itemsToGive++;
      const shopItems = ((_c = this.plugin.currentUniverse) == null ? void 0 : _c.items) || [];
      if (itemsToGive > 0 && shopItems.length > 0) {
        for (let i = 0; i < itemsToGive; i++) {
          const randomItem = shopItems[Math.floor(Math.random() * shopItems.length)];
          await this.plugin.inventory.addToInventory(randomItem.id);
          new import_obsidian8.Notice(`\u{1F340} \u0423\u0434\u0430\u0447\u0430! \u0412\u044B \u043D\u0430\u0448\u043B\u0438: ${randomItem.name}`);
        }
      }
      const emotion = this.getEmotion();
      if (gainedStat && this.plugin.ui) this.plugin.ui.setChatText(`\u0422\u0432\u043E\u044F \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0430 [${gainedStat}] \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u0430\u0435\u0442!`);
      else if (taskText.includes("#boss") && this.plugin.ui) this.plugin.ui.setChatText("\u042D\u043F\u0438\u0447\u043D\u0430\u044F \u0431\u0438\u0442\u0432\u0430! \u0412\u0440\u0430\u0433 \u043F\u043E\u0432\u0435\u0440\u0436\u0435\u043D!");
      else if (this.plugin.ui) {
        const phrasesList = ((_d = emotion.phrases) == null ? void 0 : _d.task_done) || ["\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E!"];
        this.plugin.ui.setChatText(phrasesList[Math.floor(Math.random() * phrasesList.length)]);
      }
    } else {
      this.plugin.data.history[today] = Math.max(0, this.plugin.data.history[today] - 1);
      await this.loseXP(xpReward);
      await this.loseCoins(coinReward);
      await this.loseMood(10);
      if (this.plugin.ui) {
        const emotion = this.getEmotion();
        this.plugin.ui.setChatText(((_e = emotion.phrases) == null ? void 0 : _e.task_undone) || "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E.");
      }
    }
    await this.plugin.saveProgress();
  }
  async checkDailyDamage() {
    var _a, _b;
    const todayStr = window.moment().format("YYYY-MM-DD");
    if (this.state.lastCheckedDate === todayStr) return;
    let penalties = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.penalties) || { daily_hp_loss: 5, death_xp_loss_pct: 10, death_gold_loss_pct: 10 };
    let checkDate = window.moment(this.state.lastCheckedDate).add(1, "days");
    let damageToTake = 0;
    let missedDays = 0;
    const effStats = this.getEffectiveStats().effective;
    let dailyLoss = Math.max(1, penalties.daily_hp_loss - (effStats["E"] || 0));
    while (checkDate.format("YYYY-MM-DD") < todayStr) {
      const dStr = checkDate.format("YYYY-MM-DD");
      if (!((_b = this.plugin.data.history) == null ? void 0 : _b[dStr]) || this.plugin.data.history[dStr] === 0) {
        damageToTake += dailyLoss;
        missedDays++;
        await this.loseMood(20);
      }
      checkDate.add(1, "days");
    }
    this.state.lastCheckedDate = todayStr;
    if (damageToTake > 0) {
      const dodgeChance = Math.min(70, (effStats["A"] || 0) * 2);
      if (Math.random() * 100 < dodgeChance) new import_obsidian8.Notice(`\u{1F3C3} \u0412\u044B \u043F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u043B\u0438 ${missedDays} \u0434\u043D\u0435\u0439, \u043D\u043E \u041B\u043E\u0432\u043A\u043E\u0441\u0442\u044C \u043F\u043E\u043C\u043E\u0433\u043B\u0430 \u0438\u0437\u0431\u0435\u0436\u0430\u0442\u044C \u0443\u0440\u043E\u043D\u0430!`);
      else {
        this.state.hp -= damageToTake;
        if (this.state.hp <= 0) await this.die(penalties);
        else new import_obsidian8.Notice(`\u0412\u044B \u043F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u043B\u0438 ${missedDays} \u0434\u043D\u0435\u0439. \u041F\u043E\u0442\u0435\u0440\u044F\u043D\u043E ${damageToTake} HP!`);
      }
    }
    await this.plugin.saveProgress();
  }
  async die(penalties) {
    var _a;
    const xpLoss = Math.floor(this.state.xp * (penalties.death_xp_loss_pct / 100));
    const goldLoss = Math.floor(this.state.coins * (penalties.death_gold_loss_pct / 100));
    this.state.xp = Math.max(0, this.state.xp - xpLoss);
    this.state.coins = Math.max(0, this.state.coins - goldLoss);
    this.state.hp = this.state.maxHp;
    const emotion = this.getEmotion();
    const deathMsg = ((_a = emotion.phrases) == null ? void 0 : _a.death) || "\u0412\u044B \u043F\u043E\u0433\u0438\u0431\u043B\u0438 \u043E\u0442 \u0438\u0441\u0442\u043E\u0449\u0435\u043D\u0438\u044F \u0441\u0438\u043B.";
    new import_obsidian8.Notice(`\u{1F480} \u0412\u042B \u0423\u041C\u0415\u0420\u041B\u0418!
\u041F\u043E\u0442\u0435\u0440\u044F\u043D\u043E XP: ${xpLoss}, \u0417\u043E\u043B\u043E\u0442\u0430: ${goldLoss}`);
    if (this.plugin.ui) this.plugin.ui.setChatText(deathMsg);
  }
  async gainXP(amount) {
    var _a;
    this.state.xp += amount;
    if (this.state.xp >= this.state.xpToNextLevel) {
      this.state.level++;
      this.state.xp -= this.state.xpToNextLevel;
      this.state.xpToNextLevel += 500;
      this.state.hp = this.state.maxHp;
      const emotion = this.getEmotion();
      if (this.plugin.ui && ((_a = emotion.phrases) == null ? void 0 : _a.level_up)) this.plugin.ui.setChatText(emotion.phrases.level_up.replace("{level}", this.state.level));
    }
  }
  async gainCoins(amount) {
    this.state.coins += amount;
  }
  async loseXP(amount) {
    this.state.xp -= amount;
    if (this.state.xp < 0) {
      if (this.state.level > 1) {
        this.state.level--;
        this.state.xpToNextLevel = Math.max(1e3, this.state.xpToNextLevel - 500);
        this.state.xp = this.state.xpToNextLevel + this.state.xp;
      } else {
        this.state.xp = 0;
      }
    }
  }
  async loseCoins(amount) {
    this.state.coins = Math.max(0, this.state.coins - amount);
  }
};

// src/modules/InventoryManager.js
var import_obsidian9 = require("obsidian");
var InventoryManager = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  get state() {
    return this.plugin.state;
  }
  async equipItem(slotId, itemId) {
    if (!this.state.equipment) this.state.equipment = { head: null, body: null, weapon: null, accessory: null };
    this.state.equipment[slotId] = itemId;
    this.plugin.game.recalculateMaxHp();
    await this.plugin.saveProgress();
    const itemData = this.plugin.itemsDatabase.get(itemId);
    const phrase = (itemData == null ? void 0 : itemData.use_phrase) || `\u0422\u044B \u043D\u0430\u0434\u0435\u043B: ${(itemData == null ? void 0 : itemData.name) || "\u041F\u0440\u0435\u0434\u043C\u0435\u0442"}`;
    if (this.plugin.ui) this.plugin.ui.setChatText(phrase);
    new import_obsidian9.Notice("\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u043D\u0430\u0434\u0435\u0442!");
  }
  async unequipItem(slotId) {
    const itemId = this.state.equipment ? this.state.equipment[slotId] : null;
    if (this.state.equipment) this.state.equipment[slotId] = null;
    this.plugin.game.recalculateMaxHp();
    await this.plugin.saveProgress();
    const itemData = itemId ? this.plugin.itemsDatabase.get(itemId) : null;
    if (this.plugin.ui && itemData) this.plugin.ui.setChatText(`\u0422\u044B \u0441\u043D\u044F\u043B: ${itemData.name}.`);
    new import_obsidian9.Notice("\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0441\u043D\u044F\u0442!");
  }
  async addToInventory(itemId) {
    if (!this.state.inventory) this.state.inventory = [];
    const existing = this.state.inventory.find((i) => i.id === itemId);
    if (existing) existing.quantity++;
    else this.state.inventory.push({ id: itemId, quantity: 1 });
    await this.plugin.saveProgress();
  }
  async useItem(itemId, itemData) {
    var _a;
    if (!this.state.inventory) return;
    const existing = this.state.inventory.find((i) => i.id === itemId);
    if (!existing || existing.quantity <= 0) return;
    if (itemData.type === "lootbox" && itemData.lootbox_data) {
      const phrase = itemData.use_phrase || "\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u044E \u0441\u0443\u043D\u0434\u0443\u043A... \u0427\u0442\u043E \u0436\u0435 \u0432\u043D\u0443\u0442\u0440\u0438?";
      if (this.plugin.ui) this.plugin.ui.setChatText(phrase);
      await this.openLootbox(itemData.lootbox_data);
      existing.quantity--;
      if (existing.quantity <= 0) this.state.inventory = this.state.inventory.filter((i) => i.id !== itemId);
      await this.plugin.saveProgress();
      return;
    }
    if (itemData.effects && Array.isArray(itemData.effects)) {
      for (let effect of itemData.effects) {
        switch (effect.type) {
          case "gain_hp":
            this.state.hp = Math.min(this.state.maxHp, this.state.hp + effect.value);
            break;
          case "lose_hp":
            this.state.hp = Math.max(0, this.state.hp - effect.value);
            if (this.state.hp === 0) await this.plugin.game.die(((_a = this.plugin.currentUniverse) == null ? void 0 : _a.penalties) || { death_xp_loss_pct: 10, death_gold_loss_pct: 10 });
            break;
          case "gain_xp":
            await this.plugin.game.gainXP(effect.value);
            break;
          case "lose_xp":
            await this.plugin.game.loseXP(effect.value);
            break;
          case "gain_coins":
            await this.plugin.game.gainCoins(effect.value);
            break;
          case "lose_coins":
            await this.plugin.game.loseCoins(effect.value);
            break;
          case "gain_mood":
            await this.plugin.game.gainMood(effect.value);
            break;
          case "lose_mood":
            await this.plugin.game.loseMood(effect.value);
            break;
        }
      }
      const phrase = itemData.use_phrase || `\u0422\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043B ${itemData.name}.`;
      if (this.plugin.ui) this.plugin.ui.setChatText(phrase);
    }
    existing.quantity--;
    if (existing.quantity <= 0) this.state.inventory = this.state.inventory.filter((i) => i.id !== itemId);
    await this.plugin.saveProgress();
    new import_obsidian9.Notice(`\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u043E: ${itemData.name}`);
  }
  // НОВАЯ ФУНКЦИЯ ДЛЯ РУЛЕТКИ
  async openLootbox(lootboxData) {
    var _a;
    const universeItems = ((_a = this.plugin.currentUniverse) == null ? void 0 : _a.items) || [];
    const rolls = lootboxData.rolls || 1;
    const chances = lootboxData.chances || { common: 100 };
    let wonItems = [];
    for (let i = 0; i < rolls; i++) {
      const roll = Math.random() * 100;
      let currentWeight = 0;
      let wonRarity = "common";
      for (const [rarity, weight] of Object.entries(chances)) {
        currentWeight += weight;
        if (roll <= currentWeight) {
          wonRarity = rarity;
          break;
        }
      }
      const possibleItems = universeItems.filter((item) => (item.rarity || "common") === wonRarity && item.type !== "lootbox");
      if (possibleItems.length > 0) {
        const drop = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        wonItems.push(drop);
        await this.addToInventory(drop.id);
      }
    }
    if (wonItems.length > 0) {
      const itemNames = wonItems.map((item) => `${item.icon_text || "\u{1F4E6}"} ${item.name}`).join("\n");
      new import_obsidian9.Notice(`\u{1F381} \u0418\u0417 \u0421\u0423\u041D\u0414\u0423\u041A\u0410 \u0412\u042B\u041F\u0410\u041B\u041E:
${itemNames}`, 5e3);
      if (this.plugin.ui) this.plugin.ui.setChatText("\u041E\u0433\u043E! \u041D\u0435\u043F\u043B\u043E\u0445\u043E\u0439 \u0443\u043B\u043E\u0432!");
    } else {
      new import_obsidian9.Notice("\u0421\u0443\u043D\u0434\u0443\u043A \u043E\u043A\u0430\u0437\u0430\u043B\u0441\u044F \u043F\u0443\u0441\u0442...");
    }
  }
  async dropItem(itemId) {
    if (!this.state.inventory) return;
    const existing = this.state.inventory.find((i) => i.id === itemId);
    if (!existing) return;
    existing.quantity--;
    if (existing.quantity <= 0) this.state.inventory = this.state.inventory.filter((i) => i.id !== itemId);
    if (this.state.equipment) {
      for (let slot in this.state.equipment) {
        if (this.state.equipment[slot] === itemId && existing.quantity <= 0) {
          this.state.equipment[slot] = null;
        }
      }
    }
    await this.plugin.saveProgress();
  }
};

// src/modules/DocGenerator.js
var import_obsidian10 = require("obsidian");
var DocGenerator = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  async generate() {
    const folderName = "Chronicle.md";
    const vault = this.plugin.app.vault;
    const adapter = vault.adapter;
    const files = [
      "\u{1F4D6} \u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u041C\u043E\u0434\u043E\u0434\u0435\u043B\u0430.md",
      "\u{1F6E0}\uFE0F \u041A\u0443\u0437\u043D\u0438\u0446\u0430 \u041C\u0438\u0440\u043E\u0432.html"
    ];
    try {
      if (!vault.getAbstractFileByPath(folderName)) {
        await vault.createFolder(folderName);
      }
      let isCopied = false;
      for (const fileName of files) {
        const targetPath = `${folderName}/${fileName}`;
        const sourcePath = `${this.plugin.manifest.dir}/assets/${fileName}`;
        if (!vault.getAbstractFileByPath(targetPath)) {
          if (await adapter.exists(sourcePath)) {
            const content = await adapter.read(sourcePath);
            await vault.create(targetPath, content);
            isCopied = true;
          } else {
            console.error(`Chronicle.md: \u0424\u0430\u0439\u043B ${fileName} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u043F\u0430\u043F\u043A\u0435 assets!`);
          }
        }
      }
      if (isCopied) {
        new import_obsidian10.Notice("Chronicle.md: \u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u0438 \u041A\u0443\u0437\u043D\u0438\u0446\u0430 \u041C\u0438\u0440\u043E\u0432 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0432 \u0432\u0430\u0448\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435!");
      }
    } catch (error) {
      console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438 \u0444\u0430\u0439\u043B\u043E\u0432 Chronicle.md:", error);
    }
  }
};

// src/main.js
var DEFAULT_SAVE = {
  level: 1,
  xp: 0,
  xpToNextLevel: 1e3,
  coins: 0,
  hp: 100,
  maxHp: 100,
  mood: 100,
  inventory: [],
  equipment: { head: null, body: null, weapon: null, accessory: null },
  stats: { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 },
  lastCheckedDate: window.moment().format("YYYY-MM-DD")
};
var DailyRPGPlugin = class extends import_obsidian11.Plugin {
  get state() {
    const cid = this.data.companionId || "default";
    if (!this.data.saves[cid]) this.data.saves[cid] = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    return this.data.saves[cid];
  }
  async onload() {
    console.log("Chronicle.md: \u0418\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u044F\u0434\u0440\u0430...");
    let rawData = await this.loadData() || {};
    this.data = Object.assign({ universeId: "default", companionId: "default", history: {}, saves: {} }, rawData);
    this.game = new GameEngine(this);
    this.inventory = new InventoryManager(this);
    this.game = new GameEngine(this);
    this.inventory = new InventoryManager(this);
    this.docGenerator = new DocGenerator(this);
    await this.docGenerator.generate();
    if (this.data.level !== void 0 && !this.data.saves[this.data.companionId]) {
      this.data.saves[this.data.companionId] = {
        level: this.data.level,
        xp: this.data.xp,
        xpToNextLevel: this.data.xpToNextLevel,
        coins: this.data.coins,
        hp: this.data.hp,
        maxHp: this.data.maxHp,
        mood: 100,
        inventory: this.data.inventory || [],
        equipment: { head: null, body: null, weapon: null, accessory: null },
        stats: this.data.stats || { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 },
        lastCheckedDate: this.data.lastCheckedDate || window.moment().format("YYYY-MM-DD")
      };
      delete this.data.level;
      delete this.data.xp;
      delete this.data.xpToNextLevel;
      delete this.data.coins;
      delete this.data.hp;
      delete this.data.maxHp;
      delete this.data.inventory;
      delete this.data.stats;
      delete this.data.lastCheckedDate;
      await this.saveData(this.data);
    }
    this.registerView(VIEW_TYPE_QUEST_LOG, (leaf) => new QuestLogView(leaf, this));
    const masterBtn = this.addRibbonIcon("swords", "Chronicle.md Menu", (evt) => {
      const menu = new import_obsidian11.Menu();
      menu.addItem((item) => item.setTitle("\u{1F4DC} \u0416\u0443\u0440\u043D\u0430\u043B \u041A\u0432\u0435\u0441\u0442\u043E\u0432").setIcon("clipboard-list").onClick(() => this.activateQuestLog()));
      menu.addItem((item) => item.setTitle("\u{1FAAA} \u041B\u0438\u0447\u043D\u043E\u0435 \u0414\u0435\u043B\u043E").setIcon("id-card").onClick(() => new CharacterModal(this.app, this).open()));
      menu.addItem((item) => item.setTitle("\u{1F392} \u0420\u044E\u043A\u0437\u0430\u043A").setIcon("backpack").onClick(() => new InventoryModal(this.app, this).open()));
      menu.addItem((item) => item.setTitle("\u{1F6D2} \u041B\u0430\u0432\u043A\u0430 \u0422\u043E\u0440\u0433\u043E\u0432\u0446\u0430").setIcon("store").onClick(() => new ShopModal(this.app, this).open()));
      menu.addItem((item) => item.setTitle("\u{1F4C5} \u0425\u0440\u043E\u043D\u0438\u043A\u0438").setIcon("calendar-days").onClick(() => new CalendarModal(this.app, this).open()));
      menu.addSeparator();
      menu.addItem(
        (item) => item.setTitle("\u{1F3AD} \u0421\u043C\u0435\u043D\u0438\u0442\u044C \u041A\u043E\u043C\u043F\u0430\u043D\u044C\u043E\u043D\u0430").setIcon("user").onClick(async () => {
          const c = await this.scanFolders("companions");
          new SelectionModal(this.app, c, async (s) => {
            this.data.companionId = s;
            await this.saveProgress();
            await this.reloadModules();
          }).open();
        })
      );
      menu.addItem(
        (item) => item.setTitle("\u{1F30C} \u0421\u043C\u0435\u043D\u0438\u0442\u044C \u0412\u0441\u0435\u043B\u0435\u043D\u043D\u0443\u044E").setIcon("globe").onClick(async () => {
          const u = await this.scanFolders("universes");
          new SelectionModal(this.app, u, async (s) => {
            this.data.universeId = s;
            await this.saveProgress();
            await this.reloadModules();
          }).open();
        })
      );
      menu.addSeparator();
      menu.addItem(
        (item) => item.setTitle("\u{1F6E0}\uFE0F \u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u041A\u0443\u0437\u043D\u0438\u0446\u0443 \u041C\u0438\u0440\u043E\u0432").setIcon("hammer").onClick(() => {
          const forgePath = "Chronicle.md/\u{1F6E0}\uFE0F \u041A\u0443\u0437\u043D\u0438\u0446\u0430 \u041C\u0438\u0440\u043E\u0432.html";
          const file = this.app.vault.getAbstractFileByPath(forgePath);
          if (file) {
            this.app.openWithDefaultApp(forgePath);
          } else {
            new import_obsidian11.Notice("\u0424\u0430\u0439\u043B \u041A\u0443\u0437\u043D\u0438\u0446\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D! \u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E \u043F\u0430\u043F\u043A\u0430 Chronicle.md \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442.");
          }
        })
      );
      menu.showAtMouseEvent(evt);
    });
    masterBtn.addClass("rpg-ribbon-icon", "rpg-master-icon");
    await this.buildItemsDatabase();
    await this.reloadModules();
    await this.checkDailyDamage();
    this.registerDomEvent(document, "click", (evt) => {
      if (evt.target.classList.contains("task-list-item-checkbox")) {
        if (!this.currentUniverse || !this.currentCompanion) return;
        const taskText = evt.target.parentElement ? evt.target.parentElement.innerText : "";
        this.recordTaskCompletion(evt.target.checked, taskText);
      }
    });
  }
  // НОВАЯ ФУНКЦИЯ: Сканирует все вселенные
  async buildItemsDatabase() {
    this.itemsDatabase = /* @__PURE__ */ new Map();
    const universes = await this.scanFolders("universes");
    for (const u of universes) {
      try {
        const jsonPath = `${this.manifest.dir}/universes/${u}/universe_${u}.json`;
        if (await this.app.vault.adapter.exists(jsonPath)) {
          const uniData = JSON.parse(await this.app.vault.adapter.read(jsonPath));
          if (uniData.items) {
            uniData.items.forEach((item) => {
              item.universe_id = u;
              this.itemsDatabase.set(item.id, item);
            });
          }
        }
      } catch (e) {
        console.error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432 \u0438\u0437 \u0432\u0441\u0435\u043B\u0435\u043D\u043D\u043E\u0439 ${u}:`, e);
      }
    }
    console.log(`\u{1F30C} \u041C\u0443\u043B\u044C\u0442\u0438\u0432\u0441\u0435\u043B\u0435\u043D\u043D\u0430\u044F \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u0430: \u043D\u0430\u0439\u0434\u0435\u043D\u043E ${this.itemsDatabase.size} \u0443\u043D\u0438\u043A. \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432.`);
  }
  async activateQuestLog() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_QUEST_LOG)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_QUEST_LOG, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async scanFolders(folderType) {
    const adapter = this.app.vault.adapter;
    const dir = `${this.manifest.dir}/${folderType}`;
    if (!await adapter.exists(dir)) return [];
    return (await adapter.list(dir)).folders.map((path) => path.split("/").pop());
  }
  async reloadModules() {
    if (this.ui) this.ui.remove();
    if (this.universeStyleTag) this.universeStyleTag.remove();
    const uniLoaded = await this.loadUniverse(this.data.universeId);
    const compLoaded = await this.loadCompanion(this.data.companionId);
    if (uniLoaded && compLoaded) {
      this.ui = new JRPGInterface(this);
      this.ui.createWindow();
      this.app.workspace.getLeavesOfType(VIEW_TYPE_QUEST_LOG).forEach((leaf) => leaf.view.renderTasks());
    }
  }
  async loadUniverse(id) {
    try {
      const adapter = this.app.vault.adapter;
      const jsonPath = `${this.manifest.dir}/universes/${id}/universe_${id}.json`;
      const cssPath = `${this.manifest.dir}/universes/${id}/universe_${id}.css`;
      if (!await adapter.exists(jsonPath)) return false;
      this.currentUniverse = JSON.parse(await adapter.read(jsonPath));
      if (await adapter.exists(cssPath)) {
        this.universeStyleTag = document.createElement("style");
        this.universeStyleTag.id = "chronicle-md-universe-theme";
        this.universeStyleTag.innerHTML = await adapter.read(cssPath);
        document.head.appendChild(this.universeStyleTag);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  async loadCompanion(id) {
    try {
      const adapter = this.app.vault.adapter;
      const jsonPath = `${this.manifest.dir}/companions/${id}/companion_${id}.json`;
      const spritePath = `${this.manifest.dir}/companions/${id}/sprites/idle.png`;
      if (!await adapter.exists(jsonPath)) return false;
      this.currentCompanion = JSON.parse(await adapter.read(jsonPath));
      const effStats = this.game.getEffectiveStats().effective;
      const strengthBonus = (effStats["S"] || 0) * 5;
      this.state.maxHp = (this.currentCompanion.maxHp || 100) + strengthBonus;
      if (this.state.hp > this.state.maxHp) this.state.hp = this.state.maxHp;
      this.currentSpriteUrl = await adapter.exists(spritePath) ? adapter.getResourcePath(spritePath) : "";
      return true;
    } catch (e) {
      return false;
    }
  }
  async saveProgress() {
    await this.saveData(this.data);
    if (this.ui) this.ui.updateStatsUI();
    this.app.workspace.getLeavesOfType(VIEW_TYPE_QUEST_LOG).forEach((leaf) => {
      if (leaf.view.renderTasks) leaf.view.renderTasks();
    });
  }
  onunload() {
    if (this.ui) this.ui.remove();
    if (this.universeStyleTag) this.universeStyleTag.remove();
  }
  // ==========================================
  // API FACADE
  // ==========================================
  async recordTaskCompletion(c, t) {
    await this.game.recordTaskCompletion(c, t);
  }
  async checkDailyDamage() {
    await this.game.checkDailyDamage();
  }
  async gainXP(a) {
    await this.game.gainXP(a);
  }
  async gainCoins(a) {
    await this.game.gainCoins(a);
  }
  async loseXP(a) {
    await this.game.loseXP(a);
  }
  async loseCoins(a) {
    await this.game.loseCoins(a);
  }
  async equipItem(s, i) {
    await this.inventory.equipItem(s, i);
  }
  async unequipItem(s) {
    await this.inventory.unequipItem(s);
  }
  async addToInventory(i) {
    await this.inventory.addToInventory(i);
  }
  async useItem(i, d) {
    await this.inventory.useItem(i, d);
  }
  async dropItem(i) {
    await this.inventory.dropItem(i);
  }
  triggerEncounter(encounterData) {
    new EncounterModal(this.app, this, encounterData).open();
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4uanMiLCAic3JjL21vZHVsZXMvU2VsZWN0aW9uTW9kYWwuanMiLCAic3JjL21vZHVsZXMvQ2FsZW5kYXJNb2RhbC5qcyIsICJzcmMvbW9kdWxlcy9KUlBHSW50ZXJmYWNlLmpzIiwgInNyYy9tb2R1bGVzL1F1ZXN0TG9nVmlldy5qcyIsICJzcmMvbW9kdWxlcy9TaG9wTW9kYWwuanMiLCAic3JjL21vZHVsZXMvSW52ZW50b3J5TW9kYWwuanMiLCAic3JjL21vZHVsZXMvQ2hhcmFjdGVyTW9kYWwuanMiLCAic3JjL21vZHVsZXMvRW5jb3VudGVyTW9kYWwuanMiLCAic3JjL21vZHVsZXMvR2FtZUVuZ2luZS5qcyIsICJzcmMvbW9kdWxlcy9JbnZlbnRvcnlNYW5hZ2VyLmpzIiwgInNyYy9tb2R1bGVzL0RvY0dlbmVyYXRvci5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBOb3RpY2UsIE1lbnUgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG4vLyBcdTA0MUNcdTA0M0VcdTA0MzRcdTA0NDNcdTA0M0JcdTA0MzggVUlcclxuaW1wb3J0IFNlbGVjdGlvbk1vZGFsIGZyb20gJy4vbW9kdWxlcy9TZWxlY3Rpb25Nb2RhbC5qcyc7XHJcbmltcG9ydCBDYWxlbmRhck1vZGFsIGZyb20gJy4vbW9kdWxlcy9DYWxlbmRhck1vZGFsLmpzJztcclxuaW1wb3J0IEpSUEdJbnRlcmZhY2UgZnJvbSAnLi9tb2R1bGVzL0pSUEdJbnRlcmZhY2UuanMnO1xyXG5pbXBvcnQgUXVlc3RMb2dWaWV3LCB7IFZJRVdfVFlQRV9RVUVTVF9MT0cgfSBmcm9tICcuL21vZHVsZXMvUXVlc3RMb2dWaWV3LmpzJztcclxuaW1wb3J0IFNob3BNb2RhbCBmcm9tICcuL21vZHVsZXMvU2hvcE1vZGFsLmpzJztcclxuaW1wb3J0IEludmVudG9yeU1vZGFsIGZyb20gJy4vbW9kdWxlcy9JbnZlbnRvcnlNb2RhbC5qcyc7XHJcbmltcG9ydCBDaGFyYWN0ZXJNb2RhbCBmcm9tICcuL21vZHVsZXMvQ2hhcmFjdGVyTW9kYWwuanMnO1xyXG5pbXBvcnQgRW5jb3VudGVyTW9kYWwgZnJvbSAnLi9tb2R1bGVzL0VuY291bnRlck1vZGFsLmpzJztcclxuXHJcbi8vIFx1MDQxQlx1MDQzRVx1MDQzM1x1MDQzOFx1MDQ0N1x1MDQzNVx1MDQ0MVx1MDQzQVx1MDQzOFx1MDQzNSBcdTA0MzRcdTA0MzJcdTA0MzhcdTA0MzZcdTA0M0FcdTA0MzhcclxuaW1wb3J0IEdhbWVFbmdpbmUgZnJvbSAnLi9tb2R1bGVzL0dhbWVFbmdpbmUuanMnO1xyXG5pbXBvcnQgSW52ZW50b3J5TWFuYWdlciBmcm9tICcuL21vZHVsZXMvSW52ZW50b3J5TWFuYWdlci5qcyc7XHJcbmltcG9ydCBEb2NHZW5lcmF0b3IgZnJvbSAnLi9tb2R1bGVzL0RvY0dlbmVyYXRvci5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX1NBVkUgPSB7XHJcbiAgICBsZXZlbDogMSwgeHA6IDAsIHhwVG9OZXh0TGV2ZWw6IDEwMDAsIGNvaW5zOiAwLCBocDogMTAwLCBtYXhIcDogMTAwLCBtb29kOiAxMDAsXHJcbiAgICBpbnZlbnRvcnk6IFtdLCBlcXVpcG1lbnQ6IHsgaGVhZDogbnVsbCwgYm9keTogbnVsbCwgd2VhcG9uOiBudWxsLCBhY2Nlc3Nvcnk6IG51bGwgfSxcclxuICAgIHN0YXRzOiB7IFM6IDAsIFA6IDAsIEU6IDAsIEM6IDAsIEk6IDAsIEE6IDAsIEw6IDAgfSxcclxuICAgIGxhc3RDaGVja2VkRGF0ZTogd2luZG93Lm1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYWlseVJQR1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcblxyXG4gICAgZ2V0IHN0YXRlKCkge1xyXG4gICAgICAgIGNvbnN0IGNpZCA9IHRoaXMuZGF0YS5jb21wYW5pb25JZCB8fCAnZGVmYXVsdCc7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRhdGEuc2F2ZXNbY2lkXSkgdGhpcy5kYXRhLnNhdmVzW2NpZF0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KERFRkFVTFRfU0FWRSkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuc2F2ZXNbY2lkXTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvbmxvYWQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Nocm9uaWNsZS5tZDogXHUwNDE4XHUwNDNEXHUwNDM4XHUwNDQ2XHUwNDM4XHUwNDMwXHUwNDNCXHUwNDM4XHUwNDM3XHUwNDMwXHUwNDQ2XHUwNDM4XHUwNDRGIFx1MDQ0Rlx1MDQzNFx1MDQ0MFx1MDQzMC4uLicpO1xyXG5cclxuICAgICAgICBsZXQgcmF3RGF0YSA9IGF3YWl0IHRoaXMubG9hZERhdGEoKSB8fCB7fTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBPYmplY3QuYXNzaWduKHsgdW5pdmVyc2VJZDogJ2RlZmF1bHQnLCBjb21wYW5pb25JZDogJ2RlZmF1bHQnLCBoaXN0b3J5OiB7fSwgc2F2ZXM6IHt9IH0sIHJhd0RhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZUVuZ2luZSh0aGlzKTtcclxuICAgICAgICB0aGlzLmludmVudG9yeSA9IG5ldyBJbnZlbnRvcnlNYW5hZ2VyKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZUVuZ2luZSh0aGlzKTtcclxuICAgICAgICB0aGlzLmludmVudG9yeSA9IG5ldyBJbnZlbnRvcnlNYW5hZ2VyKHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBcdTA0MTNcdTA0MzVcdTA0M0RcdTA0MzVcdTA0NDBcdTA0MzBcdTA0NDZcdTA0MzhcdTA0NEYgXHUwNDM0XHUwNDNFXHUwNDNBXHUwNDQzXHUwNDNDXHUwNDM1XHUwNDNEXHUwNDQyXHUwNDMwXHUwNDQ2XHUwNDM4XHUwNDM4IChcdTA0M0NcdTA0M0VcdTA0MzRcdTA0NDNcdTA0M0JcdTA0NEMpXHJcbiAgICAgICAgdGhpcy5kb2NHZW5lcmF0b3IgPSBuZXcgRG9jR2VuZXJhdG9yKHRoaXMpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZG9jR2VuZXJhdG9yLmdlbmVyYXRlKCk7XHJcblxyXG4gICAgICAgIC8vIFx1MDQxQ1x1MDQzOFx1MDQzM1x1MDQ0MFx1MDQzMFx1MDQ0Mlx1MDQzRVx1MDQ0MFxyXG4gICAgICAgIGlmICh0aGlzLmRhdGEubGV2ZWwgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5kYXRhLnNhdmVzW3RoaXMuZGF0YS5jb21wYW5pb25JZF0pIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhLnNhdmVzW3RoaXMuZGF0YS5jb21wYW5pb25JZF0gPSB7XHJcbiAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5kYXRhLmxldmVsLCB4cDogdGhpcy5kYXRhLnhwLCB4cFRvTmV4dExldmVsOiB0aGlzLmRhdGEueHBUb05leHRMZXZlbCwgY29pbnM6IHRoaXMuZGF0YS5jb2lucywgaHA6IHRoaXMuZGF0YS5ocCwgbWF4SHA6IHRoaXMuZGF0YS5tYXhIcCwgbW9vZDogMTAwLFxyXG4gICAgICAgICAgICAgICAgaW52ZW50b3J5OiB0aGlzLmRhdGEuaW52ZW50b3J5IHx8IFtdLCBlcXVpcG1lbnQ6IHsgaGVhZDogbnVsbCwgYm9keTogbnVsbCwgd2VhcG9uOiBudWxsLCBhY2Nlc3Nvcnk6IG51bGwgfSwgc3RhdHM6IHRoaXMuZGF0YS5zdGF0cyB8fCB7IFM6IDAsIFA6IDAsIEU6IDAsIEM6IDAsIEk6IDAsIEE6IDAsIEw6IDAgfSxcclxuICAgICAgICAgICAgICAgIGxhc3RDaGVja2VkRGF0ZTogdGhpcy5kYXRhLmxhc3RDaGVja2VkRGF0ZSB8fCB3aW5kb3cubW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGF0YS5sZXZlbDsgZGVsZXRlIHRoaXMuZGF0YS54cDsgZGVsZXRlIHRoaXMuZGF0YS54cFRvTmV4dExldmVsOyBkZWxldGUgdGhpcy5kYXRhLmNvaW5zOyBkZWxldGUgdGhpcy5kYXRhLmhwOyBkZWxldGUgdGhpcy5kYXRhLm1heEhwOyBkZWxldGUgdGhpcy5kYXRhLmludmVudG9yeTsgZGVsZXRlIHRoaXMuZGF0YS5zdGF0czsgZGVsZXRlIHRoaXMuZGF0YS5sYXN0Q2hlY2tlZERhdGU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5kYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9RVUVTVF9MT0csIChsZWFmKSA9PiBuZXcgUXVlc3RMb2dWaWV3KGxlYWYsIHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgICAgLy8gXHUwNDFDXHUwNDEwXHUwNDIxXHUwNDIyXHUwNDE1XHUwNDIwLVx1MDQxQVx1MDQxRFx1MDQxRVx1MDQxRlx1MDQxQVx1MDQxMCAoXHUwNDFFXHUwNDIxXHUwNDFEXHUwNDFFXHUwNDEyXHUwNDFEXHUwNDFFXHUwNDE1IFx1MDQxQ1x1MDQxNVx1MDQxRFx1MDQyRSBcdTA0MjBcdTA0MUZcdTA0MTMpXHJcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgICAgY29uc3QgbWFzdGVyQnRuID0gdGhpcy5hZGRSaWJib25JY29uKCdzd29yZHMnLCAnQ2hyb25pY2xlLm1kIE1lbnUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lbnUgPSBuZXcgTWVudSgpO1xyXG5cclxuICAgICAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PiBpdGVtLnNldFRpdGxlKCdcdUQ4M0RcdURDREMgXHUwNDE2XHUwNDQzXHUwNDQwXHUwNDNEXHUwNDMwXHUwNDNCIFx1MDQxQVx1MDQzMlx1MDQzNVx1MDQ0MVx1MDQ0Mlx1MDQzRVx1MDQzMicpLnNldEljb24oJ2NsaXBib2FyZC1saXN0Jykub25DbGljaygoKSA9PiB0aGlzLmFjdGl2YXRlUXVlc3RMb2coKSkpO1xyXG4gICAgICAgICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IGl0ZW0uc2V0VGl0bGUoJ1x1RDgzRVx1REVBQSBcdTA0MUJcdTA0MzhcdTA0NDdcdTA0M0RcdTA0M0VcdTA0MzUgXHUwNDE0XHUwNDM1XHUwNDNCXHUwNDNFJykuc2V0SWNvbignaWQtY2FyZCcpLm9uQ2xpY2soKCkgPT4gbmV3IENoYXJhY3Rlck1vZGFsKHRoaXMuYXBwLCB0aGlzKS5vcGVuKCkpKTtcclxuICAgICAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PiBpdGVtLnNldFRpdGxlKCdcdUQ4M0NcdURGOTIgXHUwNDIwXHUwNDRFXHUwNDNBXHUwNDM3XHUwNDMwXHUwNDNBJykuc2V0SWNvbignYmFja3BhY2snKS5vbkNsaWNrKCgpID0+IG5ldyBJbnZlbnRvcnlNb2RhbCh0aGlzLmFwcCwgdGhpcykub3BlbigpKSk7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4gaXRlbS5zZXRUaXRsZSgnXHVEODNEXHVERUQyIFx1MDQxQlx1MDQzMFx1MDQzMlx1MDQzQVx1MDQzMCBcdTA0MjJcdTA0M0VcdTA0NDBcdTA0MzNcdTA0M0VcdTA0MzJcdTA0NDZcdTA0MzAnKS5zZXRJY29uKCdzdG9yZScpLm9uQ2xpY2soKCkgPT4gbmV3IFNob3BNb2RhbCh0aGlzLmFwcCwgdGhpcykub3BlbigpKSk7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4gaXRlbS5zZXRUaXRsZSgnXHVEODNEXHVEQ0M1IFx1MDQyNVx1MDQ0MFx1MDQzRVx1MDQzRFx1MDQzOFx1MDQzQVx1MDQzOCcpLnNldEljb24oJ2NhbGVuZGFyLWRheXMnKS5vbkNsaWNrKCgpID0+IG5ldyBDYWxlbmRhck1vZGFsKHRoaXMuYXBwLCB0aGlzKS5vcGVuKCkpKTtcclxuICAgICAgICAgICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcclxuXHJcbiAgICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT5cclxuICAgICAgICAgICAgICAgIGl0ZW0uc2V0VGl0bGUoJ1x1RDgzQ1x1REZBRCBcdTA0MjFcdTA0M0NcdTA0MzVcdTA0M0RcdTA0MzhcdTA0NDJcdTA0NEMgXHUwNDFBXHUwNDNFXHUwNDNDXHUwNDNGXHUwNDMwXHUwNDNEXHUwNDRDXHUwNDNFXHUwNDNEXHUwNDMwJylcclxuICAgICAgICAgICAgICAgICAgICAuc2V0SWNvbigndXNlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjID0gYXdhaXQgdGhpcy5zY2FuRm9sZGVycygnY29tcGFuaW9ucycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2VsZWN0aW9uTW9kYWwodGhpcy5hcHAsIGMsIGFzeW5jIChzKSA9PiB7IHRoaXMuZGF0YS5jb21wYW5pb25JZCA9IHM7IGF3YWl0IHRoaXMuc2F2ZVByb2dyZXNzKCk7IGF3YWl0IHRoaXMucmVsb2FkTW9kdWxlcygpOyB9KS5vcGVuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT5cclxuICAgICAgICAgICAgICAgIGl0ZW0uc2V0VGl0bGUoJ1x1RDgzQ1x1REYwQyBcdTA0MjFcdTA0M0NcdTA0MzVcdTA0M0RcdTA0MzhcdTA0NDJcdTA0NEMgXHUwNDEyXHUwNDQxXHUwNDM1XHUwNDNCXHUwNDM1XHUwNDNEXHUwNDNEXHUwNDQzXHUwNDRFJylcclxuICAgICAgICAgICAgICAgICAgICAuc2V0SWNvbignZ2xvYmUnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdSA9IGF3YWl0IHRoaXMuc2NhbkZvbGRlcnMoJ3VuaXZlcnNlcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2VsZWN0aW9uTW9kYWwodGhpcy5hcHAsIHUsIGFzeW5jIChzKSA9PiB7IHRoaXMuZGF0YS51bml2ZXJzZUlkID0gczsgYXdhaXQgdGhpcy5zYXZlUHJvZ3Jlc3MoKTsgYXdhaXQgdGhpcy5yZWxvYWRNb2R1bGVzKCk7IH0pLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcclxuXHJcbiAgICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT5cclxuICAgICAgICAgICAgICAgIGl0ZW0uc2V0VGl0bGUoJ1x1RDgzRFx1REVFMFx1RkUwRiBcdTA0MTdcdTA0MzBcdTA0M0ZcdTA0NDNcdTA0NDFcdTA0NDJcdTA0MzhcdTA0NDJcdTA0NEMgXHUwNDFBXHUwNDQzXHUwNDM3XHUwNDNEXHUwNDM4XHUwNDQ2XHUwNDQzIFx1MDQxQ1x1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMicpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldEljb24oJ2hhbW1lcicpIC8vIFx1MDQzOFx1MDQzQlx1MDQzOCAnd3JlbmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm9yZ2VQYXRoID0gXCJDaHJvbmljbGUubWQvXHVEODNEXHVERUUwXHVGRTBGIFx1MDQxQVx1MDQ0M1x1MDQzN1x1MDQzRFx1MDQzOFx1MDQ0Nlx1MDQzMCBcdTA0MUNcdTA0MzhcdTA0NDBcdTA0M0VcdTA0MzIuaHRtbFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZvcmdlUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcdTA0MkRcdTA0NDJcdTA0MzAgXHUwNDNBXHUwNDNFXHUwNDNDXHUwNDMwXHUwNDNEXHUwNDM0XHUwNDMwIFx1MDQzN1x1MDQzMFx1MDQ0MVx1MDQ0Mlx1MDQzMFx1MDQzMlx1MDQzOFx1MDQ0MiBcdTA0MUVcdTA0MjEgXHUwNDNFXHUwNDQyXHUwNDNBXHUwNDQwXHUwNDRCXHUwNDQyXHUwNDRDIFx1MDQ0NFx1MDQzMFx1MDQzOVx1MDQzQiBcdTA0MzIgXHUwNDMxXHUwNDQwXHUwNDMwXHUwNDQzXHUwNDM3XHUwNDM1XHUwNDQwXHUwNDM1IFx1MDQzRlx1MDQzRSBcdTA0NDNcdTA0M0NcdTA0M0VcdTA0M0JcdTA0NDdcdTA0MzBcdTA0M0RcdTA0MzhcdTA0NEUhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcC5vcGVuV2l0aERlZmF1bHRBcHAoZm9yZ2VQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJcdTA0MjRcdTA0MzBcdTA0MzlcdTA0M0IgXHUwNDFBXHUwNDQzXHUwNDM3XHUwNDNEXHUwNDM4XHUwNDQ2XHUwNDRCIFx1MDQzRFx1MDQzNSBcdTA0M0RcdTA0MzBcdTA0MzlcdTA0MzRcdTA0MzVcdTA0M0QhIFx1MDQyM1x1MDQzMVx1MDQzNVx1MDQzNFx1MDQzOFx1MDQ0Mlx1MDQzNVx1MDQ0MVx1MDQ0QywgXHUwNDQ3XHUwNDQyXHUwNDNFIFx1MDQzRlx1MDQzMFx1MDQzRlx1MDQzQVx1MDQzMCBDaHJvbmljbGUubWQgXHUwNDQxXHUwNDQzXHUwNDQ5XHUwNDM1XHUwNDQxXHUwNDQyXHUwNDMyXHUwNDQzXHUwNDM1XHUwNDQyLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBcdTA0MUZcdTA0M0VcdTA0M0FcdTA0MzBcdTA0MzdcdTA0NEJcdTA0MzJcdTA0MzBcdTA0MzVcdTA0M0MgXHUwNDNDXHUwNDM1XHUwNDNEXHUwNDRFIFx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzRFx1MDQzRSBcdTA0MzIgXHUwNDQyXHUwNDNFXHUwNDM5IFx1MDQ0Mlx1MDQzRVx1MDQ0N1x1MDQzQVx1MDQzNS4uLlxyXG4gICAgICAgICAgICBtZW51LnNob3dBdE1vdXNlRXZlbnQoZXZ0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbWFzdGVyQnRuLmFkZENsYXNzKCdycGctcmliYm9uLWljb24nLCAncnBnLW1hc3Rlci1pY29uJyk7XHJcblxyXG4gICAgICAgIC8vIFx1MDQyMVx1MDQxRVx1MDQxMVx1MDQxOFx1MDQyMFx1MDQxMFx1MDQxNVx1MDQxQyBcdTA0MTFcdTA0MTBcdTA0MTdcdTA0MjMgXHUwNDEyXHUwNDIxXHUwNDE1XHUwNDI1IFx1MDQxRlx1MDQyMFx1MDQxNVx1MDQxNFx1MDQxQ1x1MDQxNVx1MDQyMlx1MDQxRVx1MDQxMiBcdTA0MUNcdTA0MjNcdTA0MUJcdTA0MkNcdTA0MjJcdTA0MThcdTA0MTJcdTA0MjFcdTA0MTVcdTA0MUJcdTA0MTVcdTA0MURcdTA0MURcdTA0MUVcdTA0MTkgXHUwNDFGXHUwNDE1XHUwNDIwXHUwNDE1XHUwNDE0IFx1MDQxN1x1MDQxMFx1MDQxM1x1MDQyMFx1MDQyM1x1MDQxN1x1MDQxQVx1MDQxRVx1MDQxOSBcdTA0MUNcdTA0MUVcdTA0MTRcdTA0MjNcdTA0MUJcdTA0MTVcdTA0MTlcclxuICAgICAgICBhd2FpdCB0aGlzLmJ1aWxkSXRlbXNEYXRhYmFzZSgpO1xyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLnJlbG9hZE1vZHVsZXMoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrRGFpbHlEYW1hZ2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckRvbUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygndGFzay1saXN0LWl0ZW0tY2hlY2tib3gnKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRVbml2ZXJzZSB8fCAhdGhpcy5jdXJyZW50Q29tcGFuaW9uKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXNrVGV4dCA9IGV2dC50YXJnZXQucGFyZW50RWxlbWVudCA/IGV2dC50YXJnZXQucGFyZW50RWxlbWVudC5pbm5lclRleHQgOiBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRUYXNrQ29tcGxldGlvbihldnQudGFyZ2V0LmNoZWNrZWQsIHRhc2tUZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFx1MDQxRFx1MDQxRVx1MDQxMlx1MDQxMFx1MDQyRiBcdTA0MjRcdTA0MjNcdTA0MURcdTA0MUFcdTA0MjZcdTA0MThcdTA0MkY6IFx1MDQyMVx1MDQzQVx1MDQzMFx1MDQzRFx1MDQzOFx1MDQ0MFx1MDQ0M1x1MDQzNVx1MDQ0MiBcdTA0MzJcdTA0NDFcdTA0MzUgXHUwNDMyXHUwNDQxXHUwNDM1XHUwNDNCXHUwNDM1XHUwNDNEXHUwNDNEXHUwNDRCXHUwNDM1XHJcbiAgICBhc3luYyBidWlsZEl0ZW1zRGF0YWJhc2UoKSB7XHJcbiAgICAgICAgdGhpcy5pdGVtc0RhdGFiYXNlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGNvbnN0IHVuaXZlcnNlcyA9IGF3YWl0IHRoaXMuc2NhbkZvbGRlcnMoJ3VuaXZlcnNlcycpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHUgb2YgdW5pdmVyc2VzKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBqc29uUGF0aCA9IGAke3RoaXMubWFuaWZlc3QuZGlyfS91bml2ZXJzZXMvJHt1fS91bml2ZXJzZV8ke3V9Lmpzb25gO1xyXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGpzb25QYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaURhdGEgPSBKU09OLnBhcnNlKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChqc29uUGF0aCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmlEYXRhLml0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaURhdGEuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udW5pdmVyc2VfaWQgPSB1OyAvLyBcdTA0MTdcdTA0MzBcdTA0M0ZcdTA0M0VcdTA0M0NcdTA0MzhcdTA0M0RcdTA0MzBcdTA0MzVcdTA0M0MgXHUwNDM4XHUwNDM3IFx1MDQzQVx1MDQzMFx1MDQzQVx1MDQzRVx1MDQzOSBcdTA0M0VcdTA0M0QgXHUwNDMyXHUwNDQxXHUwNDM1XHUwNDNCXHUwNDM1XHUwNDNEXHUwNDNEXHUwNDNFXHUwNDM5IFx1MDQzNFx1MDQzQlx1MDQ0RiBcdTA0M0ZcdTA0NDNcdTA0NDJcdTA0MzVcdTA0MzkgXHUwNDNBIFx1MDQzOFx1MDQzQVx1MDQzRVx1MDQzRFx1MDQzQVx1MDQzMFx1MDQzQyFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNEYXRhYmFzZS5zZXQoaXRlbS5pZCwgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgXHUwNDFFXHUwNDQ4XHUwNDM4XHUwNDMxXHUwNDNBXHUwNDMwIFx1MDQzN1x1MDQzMFx1MDQzM1x1MDQ0MFx1MDQ0M1x1MDQzN1x1MDQzQVx1MDQzOCBcdTA0M0ZcdTA0NDBcdTA0MzVcdTA0MzRcdTA0M0NcdTA0MzVcdTA0NDJcdTA0M0VcdTA0MzIgXHUwNDM4XHUwNDM3IFx1MDQzMlx1MDQ0MVx1MDQzNVx1MDQzQlx1MDQzNVx1MDQzRFx1MDQzRFx1MDQzRVx1MDQzOSAke3V9OmAsIGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBcdUQ4M0NcdURGMEMgXHUwNDFDXHUwNDQzXHUwNDNCXHUwNDRDXHUwNDQyXHUwNDM4XHUwNDMyXHUwNDQxXHUwNDM1XHUwNDNCXHUwNDM1XHUwNDNEXHUwNDNEXHUwNDMwXHUwNDRGIFx1MDQzN1x1MDQzMFx1MDQzM1x1MDQ0MFx1MDQ0M1x1MDQzNlx1MDQzNVx1MDQzRFx1MDQzMDogXHUwNDNEXHUwNDMwXHUwNDM5XHUwNDM0XHUwNDM1XHUwNDNEXHUwNDNFICR7dGhpcy5pdGVtc0RhdGFiYXNlLnNpemV9IFx1MDQ0M1x1MDQzRFx1MDQzOFx1MDQzQS4gXHUwNDNGXHUwNDQwXHUwNDM1XHUwNDM0XHUwNDNDXHUwNDM1XHUwNDQyXHUwNDNFXHUwNDMyLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGFjdGl2YXRlUXVlc3RMb2coKSB7XHJcbiAgICAgICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwOyBsZXQgbGVhZiA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX1FVRVNUX0xPRylbMF07XHJcbiAgICAgICAgaWYgKCFsZWFmKSB7IGxlYWYgPSB3b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKGZhbHNlKTsgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoeyB0eXBlOiBWSUVXX1RZUEVfUVVFU1RfTE9HLCBhY3RpdmU6IHRydWUgfSk7IH1cclxuICAgICAgICB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzY2FuRm9sZGVycyhmb2xkZXJUeXBlKSB7XHJcbiAgICAgICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7IGNvbnN0IGRpciA9IGAke3RoaXMubWFuaWZlc3QuZGlyfS8ke2ZvbGRlclR5cGV9YDtcclxuICAgICAgICBpZiAoIShhd2FpdCBhZGFwdGVyLmV4aXN0cyhkaXIpKSkgcmV0dXJuIFtdOyByZXR1cm4gKGF3YWl0IGFkYXB0ZXIubGlzdChkaXIpKS5mb2xkZXJzLm1hcChwYXRoID0+IHBhdGguc3BsaXQoJy8nKS5wb3AoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVsb2FkTW9kdWxlcygpIHtcclxuICAgICAgICBpZiAodGhpcy51aSkgdGhpcy51aS5yZW1vdmUoKTsgaWYgKHRoaXMudW5pdmVyc2VTdHlsZVRhZykgdGhpcy51bml2ZXJzZVN0eWxlVGFnLnJlbW92ZSgpO1xyXG4gICAgICAgIGNvbnN0IHVuaUxvYWRlZCA9IGF3YWl0IHRoaXMubG9hZFVuaXZlcnNlKHRoaXMuZGF0YS51bml2ZXJzZUlkKTsgY29uc3QgY29tcExvYWRlZCA9IGF3YWl0IHRoaXMubG9hZENvbXBhbmlvbih0aGlzLmRhdGEuY29tcGFuaW9uSWQpO1xyXG4gICAgICAgIGlmICh1bmlMb2FkZWQgJiYgY29tcExvYWRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnVpID0gbmV3IEpSUEdJbnRlcmZhY2UodGhpcyk7IHRoaXMudWkuY3JlYXRlV2luZG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX1FVRVNUX0xPRykuZm9yRWFjaChsZWFmID0+IGxlYWYudmlldy5yZW5kZXJUYXNrcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbG9hZFVuaXZlcnNlKGlkKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7IGNvbnN0IGpzb25QYXRoID0gYCR7dGhpcy5tYW5pZmVzdC5kaXJ9L3VuaXZlcnNlcy8ke2lkfS91bml2ZXJzZV8ke2lkfS5qc29uYDsgY29uc3QgY3NzUGF0aCA9IGAke3RoaXMubWFuaWZlc3QuZGlyfS91bml2ZXJzZXMvJHtpZH0vdW5pdmVyc2VfJHtpZH0uY3NzYDtcclxuICAgICAgICAgICAgaWYgKCEoYXdhaXQgYWRhcHRlci5leGlzdHMoanNvblBhdGgpKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRVbml2ZXJzZSA9IEpTT04ucGFyc2UoYXdhaXQgYWRhcHRlci5yZWFkKGpzb25QYXRoKSk7XHJcbiAgICAgICAgICAgIGlmIChhd2FpdCBhZGFwdGVyLmV4aXN0cyhjc3NQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bml2ZXJzZVN0eWxlVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTsgdGhpcy51bml2ZXJzZVN0eWxlVGFnLmlkID0gJ2Nocm9uaWNsZS1tZC11bml2ZXJzZS10aGVtZSc7IHRoaXMudW5pdmVyc2VTdHlsZVRhZy5pbm5lckhUTUwgPSBhd2FpdCBhZGFwdGVyLnJlYWQoY3NzUGF0aCk7IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGhpcy51bml2ZXJzZVN0eWxlVGFnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxvYWRDb21wYW5pb24oaWQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjsgY29uc3QganNvblBhdGggPSBgJHt0aGlzLm1hbmlmZXN0LmRpcn0vY29tcGFuaW9ucy8ke2lkfS9jb21wYW5pb25fJHtpZH0uanNvbmA7IGNvbnN0IHNwcml0ZVBhdGggPSBgJHt0aGlzLm1hbmlmZXN0LmRpcn0vY29tcGFuaW9ucy8ke2lkfS9zcHJpdGVzL2lkbGUucG5nYDtcclxuICAgICAgICAgICAgaWYgKCEoYXdhaXQgYWRhcHRlci5leGlzdHMoanNvblBhdGgpKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDb21wYW5pb24gPSBKU09OLnBhcnNlKGF3YWl0IGFkYXB0ZXIucmVhZChqc29uUGF0aCkpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZWZmU3RhdHMgPSB0aGlzLmdhbWUuZ2V0RWZmZWN0aXZlU3RhdHMoKS5lZmZlY3RpdmU7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVuZ3RoQm9udXMgPSAoZWZmU3RhdHNbJ1MnXSB8fCAwKSAqIDU7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubWF4SHAgPSAodGhpcy5jdXJyZW50Q29tcGFuaW9uLm1heEhwIHx8IDEwMCkgKyBzdHJlbmd0aEJvbnVzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5ocCA+IHRoaXMuc3RhdGUubWF4SHApIHRoaXMuc3RhdGUuaHAgPSB0aGlzLnN0YXRlLm1heEhwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3ByaXRlVXJsID0gKGF3YWl0IGFkYXB0ZXIuZXhpc3RzKHNwcml0ZVBhdGgpKSA/IGFkYXB0ZXIuZ2V0UmVzb3VyY2VQYXRoKHNwcml0ZVBhdGgpIDogJyc7IHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2F2ZVByb2dyZXNzKCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5kYXRhKTtcclxuICAgICAgICBpZiAodGhpcy51aSkgdGhpcy51aS51cGRhdGVTdGF0c1VJKCk7XHJcbiAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfUVVFU1RfTE9HKS5mb3JFYWNoKGxlYWYgPT4geyBpZiAobGVhZi52aWV3LnJlbmRlclRhc2tzKSBsZWFmLnZpZXcucmVuZGVyVGFza3MoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb251bmxvYWQoKSB7IGlmICh0aGlzLnVpKSB0aGlzLnVpLnJlbW92ZSgpOyBpZiAodGhpcy51bml2ZXJzZVN0eWxlVGFnKSB0aGlzLnVuaXZlcnNlU3R5bGVUYWcucmVtb3ZlKCk7IH1cclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIEFQSSBGQUNBREVcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgYXN5bmMgcmVjb3JkVGFza0NvbXBsZXRpb24oYywgdCkgeyBhd2FpdCB0aGlzLmdhbWUucmVjb3JkVGFza0NvbXBsZXRpb24oYywgdCk7IH1cclxuICAgIGFzeW5jIGNoZWNrRGFpbHlEYW1hZ2UoKSB7IGF3YWl0IHRoaXMuZ2FtZS5jaGVja0RhaWx5RGFtYWdlKCk7IH1cclxuICAgIGFzeW5jIGdhaW5YUChhKSB7IGF3YWl0IHRoaXMuZ2FtZS5nYWluWFAoYSk7IH1cclxuICAgIGFzeW5jIGdhaW5Db2lucyhhKSB7IGF3YWl0IHRoaXMuZ2FtZS5nYWluQ29pbnMoYSk7IH1cclxuICAgIGFzeW5jIGxvc2VYUChhKSB7IGF3YWl0IHRoaXMuZ2FtZS5sb3NlWFAoYSk7IH1cclxuICAgIGFzeW5jIGxvc2VDb2lucyhhKSB7IGF3YWl0IHRoaXMuZ2FtZS5sb3NlQ29pbnMoYSk7IH1cclxuXHJcbiAgICBhc3luYyBlcXVpcEl0ZW0ocywgaSkgeyBhd2FpdCB0aGlzLmludmVudG9yeS5lcXVpcEl0ZW0ocywgaSk7IH1cclxuICAgIGFzeW5jIHVuZXF1aXBJdGVtKHMpIHsgYXdhaXQgdGhpcy5pbnZlbnRvcnkudW5lcXVpcEl0ZW0ocyk7IH1cclxuICAgIGFzeW5jIGFkZFRvSW52ZW50b3J5KGkpIHsgYXdhaXQgdGhpcy5pbnZlbnRvcnkuYWRkVG9JbnZlbnRvcnkoaSk7IH1cclxuICAgIGFzeW5jIHVzZUl0ZW0oaSwgZCkgeyBhd2FpdCB0aGlzLmludmVudG9yeS51c2VJdGVtKGksIGQpOyB9XHJcbiAgICBhc3luYyBkcm9wSXRlbShpKSB7IGF3YWl0IHRoaXMuaW52ZW50b3J5LmRyb3BJdGVtKGkpOyB9XHJcblxyXG4gICAgdHJpZ2dlckVuY291bnRlcihlbmNvdW50ZXJEYXRhKSB7XHJcbiAgICAgICAgbmV3IEVuY291bnRlck1vZGFsKHRoaXMuYXBwLCB0aGlzLCBlbmNvdW50ZXJEYXRhKS5vcGVuKCk7XHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IHsgU3VnZ2VzdE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0aW9uTW9kYWwgZXh0ZW5kcyBTdWdnZXN0TW9kYWwge1xyXG4gICAgY29uc3RydWN0b3IoYXBwLCBpdGVtcywgb25DaG9vc2UpIHtcclxuICAgICAgICBzdXBlcihhcHApO1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB0aGlzLm9uQ2hvb3NlID0gb25DaG9vc2U7XHJcbiAgICAgICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIlx1MDQxRFx1MDQzMFx1MDQ0N1x1MDQzRFx1MDQzOCBcdTA0MzJcdTA0MzJcdTA0M0VcdTA0MzRcdTA0MzhcdTA0NDJcdTA0NEMgXHUwNDNEXHUwNDMwXHUwNDM3XHUwNDMyXHUwNDMwXHUwNDNEXHUwNDM4XHUwNDM1Li4uXCIpO1xyXG4gICAgfVxyXG4gICAgZ2V0U3VnZ2VzdGlvbnMocXVlcnkpIHsgcmV0dXJuIHRoaXMuaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpKTsgfVxyXG4gICAgcmVuZGVyU3VnZ2VzdGlvbihpdGVtLCBlbCkgeyBlbC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGl0ZW0gfSk7IH1cclxuICAgIG9uQ2hvb3NlU3VnZ2VzdGlvbihpdGVtLCBldnQpIHsgdGhpcy5vbkNob29zZShpdGVtKTsgfVxyXG59IiwgImltcG9ydCB7IE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FsZW5kYXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICAgIGNvbnN0cnVjdG9yKGFwcCwgcGx1Z2luKSB7XHJcbiAgICAgICAgc3VwZXIoYXBwKTtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlID0gd2luZG93Lm1vbWVudCgpO1xyXG4gICAgfVxyXG4gICAgb25PcGVuKCkgeyB0aGlzLnJlbmRlckNhbGVuZGFyKCk7IH1cclxuICAgIHJlbmRlckNhbGVuZGFyKCkge1xyXG4gICAgICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gICAgICAgIGNvbnN0IHVpVGV4dCA9IHRoaXMucGx1Z2luLmN1cnJlbnRVbml2ZXJzZT8udWkgfHwgeyBjYWxlbmRhcl90aXRsZTogXCJcdUQ4M0RcdURDQzUgXHUwNDI1XHUwNDQwXHUwNDNFXHUwNDNEXHUwNDM4XHUwNDNBXHUwNDM4XCIsIHF1ZXN0X2ljb246IFwiXHUyNjk0XHVGRTBGXCIgfTtcclxuXHJcbiAgICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogdWlUZXh0LmNhbGVuZGFyX3RpdGxlLCBzdHlsZTogJ3RleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7IGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcik7IHBhZGRpbmctYm90dG9tOiAxMHB4OyBmb250LWZhbWlseTogdmFyKC0tZm9udC10ZXh0KTsnIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBoZWFkZXIgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWNhbGVuZGFyLWhlYWRlcicgfSk7XHJcbiAgICAgICAgY29uc3QgcHJldkJ0biA9IGhlYWRlci5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnXHUyNUMwJyB9KTtcclxuICAgICAgICBjb25zdCBtb250aE5hbWUgPSB0aGlzLmN1cnJlbnREYXRlLmZvcm1hdCgnTU1NTSBZWVlZJyk7XHJcbiAgICAgICAgaGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogbW9udGhOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbW9udGhOYW1lLnNsaWNlKDEpLCBzdHlsZTogJ21hcmdpbjogMDsgY29sb3I6IHZhcigtLXRleHQtbm9ybWFsKTsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtdGV4dCk7JyB9KTtcclxuICAgICAgICBjb25zdCBuZXh0QnRuID0gaGVhZGVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTI1QjYnIH0pO1xyXG5cclxuICAgICAgICBwcmV2QnRuLm9uY2xpY2sgPSAoKSA9PiB7IHRoaXMuY3VycmVudERhdGUuc3VidHJhY3QoMSwgJ21vbnRoJyk7IHRoaXMucmVuZGVyQ2FsZW5kYXIoKTsgfTtcclxuICAgICAgICBuZXh0QnRuLm9uY2xpY2sgPSAoKSA9PiB7IHRoaXMuY3VycmVudERhdGUuYWRkKDEsICdtb250aCcpOyB0aGlzLnJlbmRlckNhbGVuZGFyKCk7IH07XHJcblxyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWNhbGVuZGFyLWdyaWQnIH0pO1xyXG4gICAgICAgIFsnXHUwNDFGXHUwNDNEJywgJ1x1MDQxMlx1MDQ0MicsICdcdTA0MjFcdTA0NDAnLCAnXHUwNDI3XHUwNDQyJywgJ1x1MDQxRlx1MDQ0MicsICdcdTA0MjFcdTA0MzEnLCAnXHUwNDEyXHUwNDQxJ10uZm9yRWFjaChkID0+IGdyaWQuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWNhbGVuZGFyLWRvdycsIHRleHQ6IGQgfSkpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGFydE9mTW9udGggPSB0aGlzLmN1cnJlbnREYXRlLmNsb25lKCkuc3RhcnRPZignbW9udGgnKTtcclxuICAgICAgICBjb25zdCBlbmRPZk1vbnRoID0gdGhpcy5jdXJyZW50RGF0ZS5jbG9uZSgpLmVuZE9mKCdtb250aCcpO1xyXG5cclxuICAgICAgICBsZXQgc3RhcnREYXlPZldlZWsgPSBzdGFydE9mTW9udGguZGF5KCk7XHJcbiAgICAgICAgaWYgKHN0YXJ0RGF5T2ZXZWVrID09PSAwKSBzdGFydERheU9mV2VlayA9IDc7XHJcbiAgICAgICAgc3RhcnREYXlPZldlZWstLTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydERheU9mV2VlazsgaSsrKSBncmlkLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1jYWxlbmRhci1kYXkgZW1wdHknIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5wbHVnaW4uZGF0YS5oaXN0b3J5IHx8IHt9O1xyXG4gICAgICAgIGNvbnN0IHRvZGF5U3RyID0gd2luZG93Lm1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBkYXkgPSAxOyBkYXkgPD0gZW5kT2ZNb250aC5kYXRlKCk7IGRheSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVTdHIgPSBzdGFydE9mTW9udGguY2xvbmUoKS5kYXRlKGRheSkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHF1ZXN0c0RvbmUgPSBoaXN0b3J5W2RhdGVTdHJdIHx8IDA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkYXlDZWxsID0gZ3JpZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctY2FsZW5kYXItZGF5JyB9KTtcclxuICAgICAgICAgICAgZGF5Q2VsbC5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogZGF5LnRvU3RyaW5nKCksIHN0eWxlOiAnY29sb3I6IHZhcigtLXRleHQtbm9ybWFsKTsnIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGVTdHIgPT09IHRvZGF5U3RyKSBkYXlDZWxsLmFkZENsYXNzKCd0b2RheScpO1xyXG4gICAgICAgICAgICBpZiAocXVlc3RzRG9uZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGRheUNlbGwuYWRkQ2xhc3MoJ2hhcy1xdWVzdHMnKTtcclxuICAgICAgICAgICAgICAgIGRheUNlbGwuY3JlYXRlRWwoJ3NwYW4nLCB7IGNsczogJ3JwZy1xdWVzdC1iYWRnZScsIHRleHQ6IGAke3VpVGV4dC5xdWVzdF9pY29ufSAke3F1ZXN0c0RvbmV9YCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG9uQ2xvc2UoKSB7IHRoaXMuY29udGVudEVsLmVtcHR5KCk7IH1cclxufSIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBKUlBHSW50ZXJmYWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKHBsdWdpbikgeyB0aGlzLnBsdWdpbiA9IHBsdWdpbjsgfVxyXG5cclxuICAgIGdldEVtb3Rpb24oKSB7XHJcbiAgICAgICAgY29uc3QgYyA9IHRoaXMucGx1Z2luLmN1cnJlbnRDb21wYW5pb247XHJcbiAgICAgICAgY29uc3QgY3VycmVudE1vb2QgPSB0aGlzLnBsdWdpbi5zdGF0ZS5tb29kIHx8IDA7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFBocmFzZXMgPSBjPy5waHJhc2VzIHx8IHsgdGFza19kb25lOiBbXCJcdTA0MUVcdTA0M0EuXCJdLCB0YXNrX3VuZG9uZTogXCJcdTA0MUVcdTA0M0EuXCIsIGxldmVsX3VwOiBcIlx1MDQyM1x1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzNVx1MDQzRFx1MDQ0Qy5cIiwgZGVhdGg6IFwiXHUwNDIxXHUwNDNDXHUwNDM1XHUwNDQwXHUwNDQyXHUwNDRDLlwiIH07XHJcblxyXG4gICAgICAgIGlmICghYyB8fCAhYy5lbW90aW9ucyB8fCBjLmVtb3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4geyBtb29kX25hbWU6IFwiXHUwNDFEXHUwNDM1XHUwNDM5XHUwNDQyXHUwNDQwXHUwNDMwXHUwNDNCXHUwNDRDXHUwNDNEXHUwNDNFXCIsIGF2YXRhcl90ZXh0OiBjPy5hdmF0YXJfdGV4dCB8fCBcIlx1RDgzRFx1REM2NFwiLCBwaHJhc2VzOiBkZWZhdWx0UGhyYXNlcyB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc29ydGVkID0gWy4uLmMuZW1vdGlvbnNdLnNvcnQoKGEsIGIpID0+IGIudGhyZXNob2xkIC0gYS50aHJlc2hvbGQpO1xyXG4gICAgICAgIGZvciAobGV0IGVtb3Rpb24gb2Ygc29ydGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TW9vZCA+PSBlbW90aW9uLnRocmVzaG9sZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlbW90aW9uLnBocmFzZXMpIGVtb3Rpb24ucGhyYXNlcyA9IGRlZmF1bHRQaHJhc2VzO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVtb3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3QgPSBzb3J0ZWRbc29ydGVkLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGlmICghbGFzdC5waHJhc2VzKSBsYXN0LnBocmFzZXMgPSBkZWZhdWx0UGhyYXNlcztcclxuICAgICAgICByZXR1cm4gbGFzdDtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVXaW5kb3coKSB7XHJcbiAgICAgICAgY29uc3QgcCA9IHRoaXMucGx1Z2luOyBjb25zdCBjID0gcC5jdXJyZW50Q29tcGFuaW9uOyBjb25zdCB1ID0gcC5jdXJyZW50VW5pdmVyc2U7XHJcblxyXG4gICAgICAgIGNvbnN0IHQgPSBjPy50ZXJtaW5vbG9neSB8fCB7IGhwOiBcIkhQXCIsIHhwOiBcIlx1MDQxRVx1MDQzRlx1MDQ0Qlx1MDQ0MlwiLCBtb29kOiBcIlx1MDQxRFx1MDQzMFx1MDQ0MVx1MDQ0Mlx1MDQ0MFx1MDQzRVx1MDQzNVx1MDQzRFx1MDQzOFx1MDQzNVwiIH07XHJcbiAgICAgICAgY29uc3QgY29sb3JzID0gYz8uY29sb3JzIHx8IHsgaHA6IFwiI2IzMDAwMFwiLCB4cDogXCIjNGIwMDgyXCIsIG1vb2Q6IFwiI2YxYzQwZlwiIH07XHJcbiAgICAgICAgY29uc3QgdWkgPSB1Py51aSB8fCB7IGNvaW5faWNvbjogXCJcdUQ4M0VcdURFOTlcIiB9O1xyXG5cclxuICAgICAgICBjb25zdCBlbW90aW9uID0gdGhpcy5nZXRFbW90aW9uKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gJ2pycGctYm90dG9tLXBhbmVsJztcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUuc2V0UHJvcGVydHkoJy0tZHluLWhwLWNvbG9yJywgY29sb3JzLmhwKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1keW4teHAtY29sb3InLCBjb2xvcnMueHApO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnNldFByb3BlcnR5KCctLWR5bi1tb29kLWNvbG9yJywgY29sb3JzLm1vb2QpO1xyXG5cclxuICAgICAgICBjb25zdCBhdmF0YXJXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgYXZhdGFyV3JhcHBlci5jbGFzc05hbWUgPSAncnBnLWF2YXRhci13cmFwcGVyJztcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZUNvbnRhaW5lci5jbGFzc05hbWUgPSAnanJwZy1zcHJpdGUtY29udGFpbmVyJztcclxuICAgICAgICBhdmF0YXJXcmFwcGVyLmFwcGVuZENoaWxkKHRoaXMuc3ByaXRlQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb29kTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0aGlzLm1vb2RMYWJlbC5jbGFzc05hbWUgPSAncnBnLW1vb2QtbGFiZWwnO1xyXG4gICAgICAgIGF2YXRhcldyYXBwZXIuYXBwZW5kQ2hpbGQodGhpcy5tb29kTGFiZWwpO1xyXG5cclxuICAgICAgICBjb25zdCBkaWFsb2dBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZGlhbG9nQXJlYS5jbGFzc05hbWUgPSAnanJwZy1kaWFsb2ctYXJlYSc7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRzSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgc3RhdHNIZWFkZXIuY2xhc3NOYW1lID0gJ2pycGctc3RhdHMtaGVhZGVyJztcclxuXHJcbiAgICAgICAgc3RhdHNIZWFkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianJwZy1zdGF0LWl0ZW1cIj48c3BhbiBpZD1cImpycGctaHAtdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwianJwZy1iYXItYmdcIj48ZGl2IGNsYXNzPVwianJwZy1iYXItZmlsbCBocFwiIGlkPVwianJwZy1ocC1maWxsXCI+PC9kaXY+PC9kaXY+PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqcnBnLXN0YXQtaXRlbVwiPjxzcGFuIGlkPVwianJwZy14cC10ZXh0XCI+PC9zcGFuPjxkaXYgY2xhc3M9XCJqcnBnLWJhci1iZ1wiPjxkaXYgY2xhc3M9XCJqcnBnLWJhci1maWxsIHhwXCIgaWQ9XCJqcnBnLXhwLWZpbGxcIj48L2Rpdj48L2Rpdj48L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImpycGctc3RhdC1pdGVtXCI+PHNwYW4gaWQ9XCJqcnBnLW1vb2QtdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwianJwZy1iYXItYmdcIj48ZGl2IGNsYXNzPVwianJwZy1iYXItZmlsbCBtb29kXCIgaWQ9XCJqcnBnLW1vb2QtZmlsbFwiPjwvZGl2PjwvZGl2PjwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianJwZy1zdGF0LWl0ZW1cIiBzdHlsZT1cImp1c3RpZnktY29udGVudDogY2VudGVyOyBmb250LXNpemU6IDEuMmVtO1wiPjxzcGFuIGlkPVwianJwZy1nb2xkLXRleHRcIj48L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgY29uc3QgbmFtZUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgbmFtZUxhYmVsLmNsYXNzTmFtZSA9ICdqcnBnLWNoYXJhY3Rlci1uYW1lJzsgbmFtZUxhYmVsLmlubmVyVGV4dCA9IGM/Lm5hbWUgfHwgXCJcdTA0MURcdTA0MzVcdTA0MzhcdTA0MzdcdTA0MzJcdTA0MzVcdTA0NDFcdTA0NDJcdTA0M0RcdTA0NEJcdTA0MzlcIjtcclxuXHJcbiAgICAgICAgdGhpcy5kaWFsb2dUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdGhpcy5kaWFsb2dUZXh0LmNsYXNzTmFtZSA9ICdqcnBnLWRpYWxvZy10ZXh0JztcclxuXHJcbiAgICAgICAgZGlhbG9nQXJlYS5hcHBlbmRDaGlsZChzdGF0c0hlYWRlcik7IGRpYWxvZ0FyZWEuYXBwZW5kQ2hpbGQobmFtZUxhYmVsKTsgZGlhbG9nQXJlYS5hcHBlbmRDaGlsZCh0aGlzLmRpYWxvZ1RleHQpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChhdmF0YXJXcmFwcGVyKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChkaWFsb2dBcmVhKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5ocFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanJwZy1ocC10ZXh0Jyk7XHJcbiAgICAgICAgdGhpcy54cFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanJwZy14cC10ZXh0Jyk7XHJcbiAgICAgICAgdGhpcy5tb29kVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqcnBnLW1vb2QtdGV4dCcpO1xyXG4gICAgICAgIHRoaXMuZ29sZFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanJwZy1nb2xkLXRleHQnKTtcclxuXHJcbiAgICAgICAgdGhpcy5ocEZpbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanJwZy1ocC1maWxsJyk7XHJcbiAgICAgICAgdGhpcy54cEZpbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanJwZy14cC1maWxsJyk7XHJcbiAgICAgICAgdGhpcy5tb29kRmlsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqcnBnLW1vb2QtZmlsbCcpO1xyXG5cclxuICAgICAgICB0aGlzLnNldENoYXRUZXh0KGVtb3Rpb24ucGhyYXNlcz8uZ3JlZXRpbmcgfHwgXCJcdTA0MUZcdTA0NDBcdTA0MzhcdTA0MzJcdTA0MzVcdTA0NDJcdTA0NDFcdTA0NDJcdTA0MzJcdTA0NDNcdTA0NEUuXCIpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHNVSSgpOyAvLyBcdTA0MjJcdTA0MzVcdTA0M0ZcdTA0MzVcdTA0NDBcdTA0NEMgXHUwNDMyXHUwNDRCXHUwNDM3XHUwNDRCXHUwNDMyXHUwNDMwXHUwNDM1XHUwNDQyXHUwNDQxXHUwNDRGIFx1MDQzQVx1MDQzMFx1MDQzQSBhc3luY1xyXG4gICAgfVxyXG5cclxuICAgIHNldENoYXRUZXh0KHRleHQpIHsgaWYgKHRoaXMuZGlhbG9nVGV4dCkgdGhpcy5kaWFsb2dUZXh0LmlubmVyVGV4dCA9IGBcdTAwQUIke3RleHR9XHUwMEJCYDsgfVxyXG5cclxuICAgIC8vIFx1MDQyMlx1MDQxNVx1MDQxRlx1MDQxNVx1MDQyMFx1MDQyQyBcdTA0MjRcdTA0MjNcdTA0MURcdTA0MUFcdTA0MjZcdTA0MThcdTA0MkYgQVNZTkMgLSBcdTA0MTFcdTA0MTVcdTA0MTcgXHUwNDFFXHUwNDI4XHUwNDE4XHUwNDExXHUwNDFFXHUwNDFBIFx1MDQxOCBcdTA0MjFcdTA0MUZcdTA0MTBcdTA0MUNcdTA0MTBcclxuICAgIGFzeW5jIHVwZGF0ZVN0YXRzVUkoKSB7XHJcbiAgICAgICAgY29uc3QgcCA9IHRoaXMucGx1Z2luOyBjb25zdCBjID0gcC5jdXJyZW50Q29tcGFuaW9uOyBjb25zdCB1ID0gcC5jdXJyZW50VW5pdmVyc2U7XHJcbiAgICAgICAgaWYgKCFjIHx8ICF1IHx8ICF0aGlzLnhwRmlsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCB0ID0gYy50ZXJtaW5vbG9neSB8fCB7IGhwOiBcIkhQXCIsIHhwOiBcIlx1MDQxRVx1MDQzRlx1MDQ0Qlx1MDQ0MlwiLCBtb29kOiBcIlx1MDQxRFx1MDQzMFx1MDQ0MVx1MDQ0Mlx1MDQ0MFx1MDQzRVx1MDQzNVx1MDQzRFx1MDQzOFx1MDQzNVwiIH07XHJcbiAgICAgICAgY29uc3QgdWkgPSB1LnVpIHx8IHsgY29pbl9pY29uOiBcIlx1RDgzRVx1REU5OVwiIH07XHJcbiAgICAgICAgY29uc3QgZW1vdGlvbiA9IHRoaXMuZ2V0RW1vdGlvbigpO1xyXG5cclxuICAgICAgICAvLyAxLiBcdTA0MjNcdTA0MUNcdTA0MURcdTA0MUVcdTA0MTUgXHUwNDFFXHUwNDExXHUwNDFEXHUwNDFFXHUwNDEyXHUwNDFCXHUwNDE1XHUwNDFEXHUwNDE4XHUwNDE1IFx1MDQxMFx1MDQxMlx1MDQxMFx1MDQyMlx1MDQxMFx1MDQyMFx1MDQxMFxyXG4gICAgICAgIHRoaXMuc3ByaXRlQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKGVtb3Rpb24uaWNvbl9pbWcpIHtcclxuICAgICAgICAgICAgY29uc3QgaW1nUGF0aCA9IGAke3AubWFuaWZlc3QuZGlyfS9jb21wYW5pb25zLyR7cC5kYXRhLmNvbXBhbmlvbklkfS9zcHJpdGVzLyR7ZW1vdGlvbi5pY29uX2ltZ31gO1xyXG5cclxuICAgICAgICAgICAgLy8gXHUwNDE3XHUwNDMwXHUwNDQwXHUwNDMwXHUwNDNEXHUwNDM1XHUwNDM1IFx1MDQzRlx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzNVx1MDQ0MFx1MDQ0Rlx1MDQzNVx1MDQzQywgXHUwNDQxXHUwNDQzXHUwNDQ5XHUwNDM1XHUwNDQxXHUwNDQyXHUwNDMyXHUwNDQzXHUwNDM1XHUwNDQyIFx1MDQzQlx1MDQzOCBcdTA0M0FcdTA0MzBcdTA0NDBcdTA0NDJcdTA0MzhcdTA0M0RcdTA0M0FcdTA0MzAsIFx1MDQ0N1x1MDQ0Mlx1MDQzRVx1MDQzMVx1MDQ0QiBcdTA0M0RcdTA0MzUgXHUwNDQxXHUwNDNGXHUwNDMwXHUwNDNDXHUwNDM4XHUwNDQyXHUwNDRDIFx1MDQzMiBcdTA0M0FcdTA0M0VcdTA0M0RcdTA0NDFcdTA0M0VcdTA0M0JcdTA0NEMgNDA0XHJcbiAgICAgICAgICAgIGlmIChhd2FpdCBwLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhpbWdQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3JjID0gcC5hcHAudmF1bHQuYWRhcHRlci5nZXRSZXNvdXJjZVBhdGgoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgICAgIGltZy5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgICAgICBpbWcuY2xhc3NOYW1lID0gJ2pycGctc3ByaXRlLWltZyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUZXh0QXZhdGFyKGVtb3Rpb24uYXZhdGFyX3RleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJUZXh0QXZhdGFyKGVtb3Rpb24uYXZhdGFyX3RleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gMi4gXHUwNDFFXHUwNDMxXHUwNDNEXHUwNDNFXHUwNDMyXHUwNDNCXHUwNDRGXHUwNDM1XHUwNDNDIFx1MDQzRlx1MDQzQlx1MDQzMFx1MDQ0OFx1MDQzQVx1MDQ0MyBcdTA0MURcdTA0MzBcdTA0NDFcdTA0NDJcdTA0NDBcdTA0M0VcdTA0MzVcdTA0M0RcdTA0MzhcdTA0NEZcclxuICAgICAgICB0aGlzLm1vb2RMYWJlbC5pbm5lclRleHQgPSBlbW90aW9uLm1vb2RfbmFtZSB8fCBcIlx1MDQxRFx1MDQzNVx1MDQzOVx1MDQ0Mlx1MDQ0MFx1MDQzMFx1MDQzQlx1MDQ0Q1x1MDQzRFx1MDQzRVwiO1xyXG5cclxuICAgICAgICAvLyAzLiBcdTA0MUVcdTA0MzFcdTA0M0RcdTA0M0VcdTA0MzJcdTA0M0JcdTA0NEZcdTA0MzVcdTA0M0MgXHUwNDNGXHUwNDNFXHUwNDNCXHUwNDNFXHUwNDQxXHUwNDNBXHUwNDM4XHJcbiAgICAgICAgY29uc3QgeHBQZXJjZW50ID0gKHAuc3RhdGUueHAgLyBwLnN0YXRlLnhwVG9OZXh0TGV2ZWwpICogMTAwO1xyXG4gICAgICAgIGNvbnN0IGhwUGVyY2VudCA9IChwLnN0YXRlLmhwIC8gcC5zdGF0ZS5tYXhIcCkgKiAxMDA7XHJcbiAgICAgICAgY29uc3QgbW9vZFBlcmNlbnQgPSBwLnN0YXRlLm1vb2QgfHwgMDtcclxuXHJcbiAgICAgICAgdGhpcy54cEZpbGwuc3R5bGUud2lkdGggPSBgJHtNYXRoLm1pbigxMDAsIHhwUGVyY2VudCl9JWA7XHJcbiAgICAgICAgdGhpcy5ocEZpbGwuc3R5bGUud2lkdGggPSBgJHtNYXRoLm1pbigxMDAsIGhwUGVyY2VudCl9JWA7XHJcbiAgICAgICAgdGhpcy5tb29kRmlsbC5zdHlsZS53aWR0aCA9IGAke01hdGgubWluKDEwMCwgbW9vZFBlcmNlbnQpfSVgO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ocFRleHQpIHRoaXMuaHBUZXh0LmlubmVyVGV4dCA9IGAke3QuaHB9OiAke3Auc3RhdGUuaHB9LyR7cC5zdGF0ZS5tYXhIcH1gO1xyXG4gICAgICAgIGlmICh0aGlzLnhwVGV4dCkgdGhpcy54cFRleHQuaW5uZXJUZXh0ID0gYCR7dC54cH06ICR7cC5zdGF0ZS5sZXZlbH0gXHUwNDIzXHUwNDQwLmA7XHJcbiAgICAgICAgaWYgKHRoaXMubW9vZFRleHQpIHRoaXMubW9vZFRleHQuaW5uZXJUZXh0ID0gYCR7dC5tb29kfTogJHtwLnN0YXRlLm1vb2R9JWA7XHJcbiAgICAgICAgaWYgKHRoaXMuZ29sZFRleHQpIHRoaXMuZ29sZFRleHQuaW5uZXJUZXh0ID0gYCR7dWkuY29pbl9pY29ufSAke3Auc3RhdGUuY29pbnN9YDtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXJUZXh0QXZhdGFyKHRleHQpIHtcclxuICAgICAgICAvLyBcdTA0MUVcdTA0MzFcdTA0M0VcdTA0NDBcdTA0MzBcdTA0NDdcdTA0MzhcdTA0MzJcdTA0MzBcdTA0MzVcdTA0M0MgXHUwNDREXHUwNDNDXHUwNDNFXHUwNDM0XHUwNDM3XHUwNDM4IFx1MDQzMiBzcGFuIFx1MDQzNFx1MDQzQlx1MDQ0RiBcdTA0NDJcdTA0M0VcdTA0NDdcdTA0M0RcdTA0M0VcdTA0MzNcdTA0M0UgXHUwNDNBXHUwNDNFXHUwNDNEXHUwNDQyXHUwNDQwXHUwNDNFXHUwNDNCXHUwNDRGIFx1MDQzMiBDU1NcclxuICAgICAgICB0aGlzLnNwcml0ZUNvbnRhaW5lci5pbm5lckhUTUwgPSBgPHNwYW4gY2xhc3M9XCJqcnBnLXRleHQtYXZhdGFyXCI+JHt0ZXh0IHx8ICdcdUQ4M0RcdURDNjQnfTwvc3Bhbj5gO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFx1MDQxRVx1MDQ0N1x1MDQzOFx1MDQ0OVx1MDQzMFx1MDQzNVx1MDQzQyBcdTA0NDFcdTA0NDJcdTA0MzBcdTA0NDBcdTA0NEJcdTA0MzUgXHUwNDM4XHUwNDNEXHUwNDNCXHUwNDMwXHUwNDM5XHUwNDNELVx1MDQ0MVx1MDQ0Mlx1MDQzOFx1MDQzQlx1MDQzOCAoXHUwNDNEXHUwNDMwIFx1MDQ0MVx1MDQzQlx1MDQ0M1x1MDQ0N1x1MDQzMFx1MDQzOSBcdTA0MzVcdTA0NDFcdTA0M0JcdTA0MzggXHUwNDNGXHUwNDM1XHUwNDQwXHUwNDM1XHUwNDNBXHUwNDNCXHUwNDRFXHUwNDQ3XHUwNDM4XHUwNDNCXHUwNDM4XHUwNDQxXHUwNDRDIFx1MDQ0MSBcdTA0M0FcdTA0MzBcdTA0NDBcdTA0NDJcdTA0MzhcdTA0M0RcdTA0M0FcdTA0MzggXHUwNDNEXHUwNDMwIFx1MDQ0Mlx1MDQzNVx1MDQzQVx1MDQ0MVx1MDQ0MiBcdTA0MzggXHUwNDNFXHUwNDMxXHUwNDQwXHUwNDMwXHUwNDQyXHUwNDNEXHUwNDNFKVxyXG4gICAgICAgIHRoaXMuc3ByaXRlQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICB0aGlzLnNwcml0ZUNvbnRhaW5lci5zdHlsZS5hbGlnbkl0ZW1zID0gJyc7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVDb250YWluZXIuc3R5bGUuanVzdGlmeUNvbnRlbnQgPSAnJztcclxuICAgICAgICB0aGlzLnNwcml0ZUNvbnRhaW5lci5zdHlsZS5mb250U2l6ZSA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZSgpIHsgaWYgKHRoaXMuY29udGFpbmVyKSB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTsgfVxyXG59IiwgImltcG9ydCB7IEl0ZW1WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGNvbnN0IFZJRVdfVFlQRV9RVUVTVF9MT0cgPSBcImNocm9uaWNsZS1tZC1xdWVzdC1sb2dcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXN0TG9nVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcclxuICAgIGNvbnN0cnVjdG9yKGxlYWYsIHBsdWdpbikge1xyXG4gICAgICAgIHN1cGVyKGxlYWYpO1xyXG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gICAgICAgIHRoaXMuaXNQcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52aWV3TW9kZSA9ICdsb2NhbCc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Vmlld1R5cGUoKSB7IHJldHVybiBWSUVXX1RZUEVfUVVFU1RfTE9HOyB9XHJcbiAgICBnZXREaXNwbGF5VGV4dCgpIHsgcmV0dXJuIFwiXHUwNDE2XHUwNDQzXHUwNDQwXHUwNDNEXHUwNDMwXHUwNDNCIFx1MDQxQVx1MDQzMlx1MDQzNVx1MDQ0MVx1MDQ0Mlx1MDQzRVx1MDQzMlwiOyB9XHJcbiAgICBnZXRJY29uKCkgeyByZXR1cm4gXCJjbGlwYm9hcmQtbGlzdFwiOyB9XHJcblxyXG4gICAgYXN5bmMgb25PcGVuKCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMucmVuZGVyVGFza3MoKTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAud29ya3NwYWNlLm9uKCdmaWxlLW9wZW4nLCAoKSA9PiB0aGlzLnJlbmRlclRhc2tzKCkpKTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnZhdWx0Lm9uKCdtb2RpZnknLCAoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aWV3TW9kZSA9PT0gJ2xvY2FsJyAmJiBhY3RpdmVGaWxlICYmIGZpbGUucGF0aCA9PT0gYWN0aXZlRmlsZS5wYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUYXNrcygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdNb2RlICE9PSAnbG9jYWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlbmRlclRhc2tzKCksIDIwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5kZXJUYXNrcygpIHtcclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdO1xyXG4gICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcygncnBnLXF1ZXN0LWxvZy1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgY29uc3QgdWlUZXh0ID0gdGhpcy5wbHVnaW4uY3VycmVudFVuaXZlcnNlPy51aSB8fCB7XHJcbiAgICAgICAgICAgIHF1ZXN0X2JvYXJkOiBcIlx1RDgzRFx1RENEQyBcdTA0MTRcdTA0M0VcdTA0NDFcdTA0M0FcdTA0MzAgXHUwNDFBXHUwNDNFXHUwNDNEXHUwNDQyXHUwNDQwXHUwNDMwXHUwNDNBXHUwNDQyXHUwNDNFXHUwNDMyXCIsIGN1cnJlbnRfbG9jYXRpb246IFwiXHUwNDIyXHUwNDM1XHUwNDNBXHUwNDQzXHUwNDQ5XHUwNDMwXHUwNDRGIFx1MDQzQlx1MDQzRVx1MDQzQVx1MDQzMFx1MDQ0Nlx1MDQzOFx1MDQ0RlwiLFxyXG4gICAgICAgICAgICBnbG9iYWxfbWFwOiBcIlx1MDQxQVx1MDQzMFx1MDQ0MFx1MDQ0Mlx1MDQzMCBcdTA0M0NcdTA0MzhcdTA0NDBcdTA0MzBcIiwgY29tcGxldGVkX3F1ZXN0czogXCJcdTA0MTBcdTA0NDBcdTA0NDVcdTA0MzhcdTA0MzJcIiwgbm9fcXVlc3RzOiBcIlx1MDQxRlx1MDQ0M1x1MDQ0MVx1MDQ0Mlx1MDQzRS5cIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctcXVlc3QtYm9hcmQtdGl0bGUnLCB0ZXh0OiB1aVRleHQucXVlc3RfYm9hcmQgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRvZ2dsZURpdiA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctcXVlc3QtdG9nZ2xlJyB9KTtcclxuICAgICAgICBjb25zdCBidG5Mb2NhbCA9IHRvZ2dsZURpdi5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiB1aVRleHQuY3VycmVudF9sb2NhdGlvbiB9KTtcclxuICAgICAgICBjb25zdCBidG5HbG9iYWwgPSB0b2dnbGVEaXYuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogdWlUZXh0Lmdsb2JhbF9tYXAgfSk7XHJcbiAgICAgICAgY29uc3QgYnRuQ29tcGxldGVkID0gdG9nZ2xlRGl2LmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6IHVpVGV4dC5jb21wbGV0ZWRfcXVlc3RzIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy52aWV3TW9kZSA9PT0gJ2xvY2FsJykgYnRuTG9jYWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudmlld01vZGUgPT09ICdnbG9iYWwnKSBidG5HbG9iYWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIGVsc2UgYnRuQ29tcGxldGVkLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgYnRuTG9jYWwub25jbGljayA9ICgpID0+IHsgdGhpcy52aWV3TW9kZSA9ICdsb2NhbCc7IHRoaXMucmVuZGVyVGFza3MoKTsgfTtcclxuICAgICAgICBidG5HbG9iYWwub25jbGljayA9ICgpID0+IHsgdGhpcy52aWV3TW9kZSA9ICdnbG9iYWwnOyB0aGlzLnJlbmRlclRhc2tzKCk7IH07XHJcbiAgICAgICAgYnRuQ29tcGxldGVkLm9uY2xpY2sgPSAoKSA9PiB7IHRoaXMudmlld01vZGUgPSAnY29tcGxldGVkJzsgdGhpcy5yZW5kZXJUYXNrcygpOyB9O1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy52aWV3TW9kZSA9PT0gJ2xvY2FsJykgYXdhaXQgdGhpcy5yZW5kZXJMb2NhbE1vZGUodWlUZXh0KTtcclxuICAgICAgICBlbHNlIGlmICh0aGlzLnZpZXdNb2RlID09PSAnZ2xvYmFsJykgYXdhaXQgdGhpcy5yZW5kZXJHbG9iYWxNb2RlKHVpVGV4dCwgJ3VuZmluaXNoZWQnKTtcclxuICAgICAgICBlbHNlIGF3YWl0IHRoaXMucmVuZGVyR2xvYmFsTW9kZSh1aVRleHQsICdjb21wbGV0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5kZXJMb2NhbE1vZGUodWlUZXh0KSB7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcbiAgICAgICAgaWYgKCFhY3RpdmVGaWxlIHx8IGFjdGl2ZUZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5jcmVhdGVFbCgncCcsIHsgdGV4dDogdWlUZXh0Lm5vX3F1ZXN0cywgc3R5bGU6ICd0ZXh0LWFsaWduOiBjZW50ZXI7IGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTsnIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc0ZpbGVUYXNrcyhhY3RpdmVGaWxlLCB1aVRleHQubm9fcXVlc3RzLCAnYWxsJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVuZGVyR2xvYmFsTW9kZSh1aVRleHQsIGZpbHRlclR5cGUpIHtcclxuICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuICAgICAgICBsZXQgZm91bmRBbnkgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBzb3J0ZWRGaWxlcyA9IGZpbGVzLnNvcnQoKGEsIGIpID0+IGIuc3RhdC5tdGltZSAtIGEuc3RhdC5tdGltZSkuc2xpY2UoMCwgMzApO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2Ygc29ydGVkRmlsZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFzVGFza3MgPSBhd2FpdCB0aGlzLnByb2Nlc3NGaWxlVGFza3MoZmlsZSwgbnVsbCwgZmlsdGVyVHlwZSk7XHJcbiAgICAgICAgICAgIGlmIChoYXNUYXNrcykgZm91bmRBbnkgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFmb3VuZEFueSkgdGhpcy5saXN0Q29udGFpbmVyLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiB1aVRleHQubm9fcXVlc3RzLCBzdHlsZTogJ3RleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOycgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcHJvY2Vzc0ZpbGVUYXNrcyhmaWxlLCBlbXB0eU1lc3NhZ2UsIGZpbHRlclR5cGUpIHtcclxuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xyXG4gICAgICAgIGNvbnN0IHRhc2tzID0gW107XHJcbiAgICAgICAgY29uc3QgdGFza1JlZ2V4ID0gL14oWyBcXHRdKiktIFxcWyguKVxcXSAoLiopLztcclxuXHJcbiAgICAgICAgbGluZXMuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKHRhc2tSZWdleCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBtYXRjaFsyXS50b0xvd2VyQ2FzZSgpID09PSAneCc7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyVHlwZSA9PT0gJ3VuZmluaXNoZWQnICYmIGlzQ29tcGxldGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyVHlwZSA9PT0gJ2NvbXBsZXRlZCcgJiYgIWlzQ29tcGxldGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKHsgbGluZUluZGV4OiBpbmRleCwgaXNDb21wbGV0ZWQ6IGlzQ29tcGxldGVkLCB0ZXh0OiBtYXRjaFszXSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGFza3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChlbXB0eU1lc3NhZ2UpIHRoaXMubGlzdENvbnRhaW5lci5jcmVhdGVFbCgncCcsIHsgdGV4dDogZW1wdHlNZXNzYWdlLCBzdHlsZTogJ3RleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOycgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhcmQgPSB0aGlzLmxpc3RDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLXF1ZXN0LWRheS1jYXJkJyB9KTtcclxuICAgICAgICBjb25zdCBoZWFkZXIgPSBjYXJkLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1xdWVzdC1kYXktaGVhZGVyJyB9KTtcclxuICAgICAgICBoZWFkZXIuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IGZpbGUuYmFzZW5hbWUgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpc3QgPSBjYXJkLmNyZWF0ZUVsKCd1bCcsIHsgY2xzOiAncnBnLXF1ZXN0LWxpc3QnIH0pO1xyXG5cclxuICAgICAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsaSA9IGxpc3QuY3JlYXRlRWwoJ2xpJywgeyB0ZXh0OiB0YXNrLnRleHQgfSk7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmlzQ29tcGxldGVkKSBsaS5hZGRDbGFzcygnY29tcGxldGVkJyk7XHJcblxyXG4gICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzUHJvY2Vzc2luZykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Byb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy50b2dnbGVUYXNrSW5GaWxlKGZpbGUsIHRhc2subGluZUluZGV4LCAhdGFzay5pc0NvbXBsZXRlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gXHUwNDFGXHUwNDM1XHUwNDQwXHUwNDM1XHUwNDM0XHUwNDMwXHUwNDM1XHUwNDNDIFx1MDQ0Mlx1MDQzNVx1MDQzQVx1MDQ0MVx1MDQ0MiBcdTA0MzdcdTA0MzBcdTA0MzRcdTA0MzBcdTA0NDdcdTA0MzggKHRhc2sudGV4dCkgXHUwNDMyIFx1MDQyRlx1MDQzNFx1MDQ0MFx1MDQzRSFcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnJlY29yZFRhc2tDb21wbGV0aW9uKCF0YXNrLmlzQ29tcGxldGVkLCB0YXNrLnRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmlzUHJvY2Vzc2luZyA9IGZhbHNlOyB9LCA1MDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB0b2dnbGVUYXNrSW5GaWxlKGZpbGUsIGxpbmVJbmRleCwgbWFrZUNvbXBsZXRlZCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoZmlsZSwgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBkYXRhLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2xpbmVJbmRleF07XHJcbiAgICAgICAgICAgIGlmIChtYWtlQ29tcGxldGVkKSBsaW5lc1tsaW5lSW5kZXhdID0gbGluZS5yZXBsYWNlKC8tIFxcWyguKVxcXS8sICctIFt4XScpO1xyXG4gICAgICAgICAgICBlbHNlIGxpbmVzW2xpbmVJbmRleF0gPSBsaW5lLnJlcGxhY2UoLy0gXFxbKC4pXFxdLywgJy0gWyBdJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIG9uQ2xvc2UoKSB7IH1cclxufSIsICJpbXBvcnQgeyBNb2RhbCwgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvcE1vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gICAgY29uc3RydWN0b3IoYXBwLCBwbHVnaW4pIHtcclxuICAgICAgICBzdXBlcihhcHApO1xyXG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gICAgfVxyXG5cclxuICAgIG9uT3BlbigpIHsgdGhpcy5yZW5kZXIoKTsgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgICAgICBjb250ZW50RWwuZW1wdHkoKTtcclxuICAgICAgICBjb250ZW50RWwuYWRkQ2xhc3MoJ3JwZy1zaG9wLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICBjb25zdCB1aVRleHQgPSB0aGlzLnBsdWdpbi5jdXJyZW50VW5pdmVyc2U/LnVpIHx8IHt9O1xyXG4gICAgICAgIGNvbnN0IHNob3BUaXRsZSA9IHVpVGV4dC5zaG9wX3RpdGxlIHx8IFwiXHVEODNEXHVERUQyIFx1MDQxQlx1MDQzMFx1MDQzMlx1MDQzQVx1MDQzMFwiO1xyXG4gICAgICAgIGNvbnN0IGNvaW5JY29uID0gdWlUZXh0LmNvaW5faWNvbiB8fCBcIlx1RDgzRVx1REU5OVwiO1xyXG5cclxuICAgICAgICBjb25zdCBoZWFkZXIgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLXNob3AtaGVhZGVyJyB9KTtcclxuICAgICAgICBoZWFkZXIuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiBzaG9wVGl0bGUsIHN0eWxlOiAnbWFyZ2luOiAwOyBjb2xvcjogdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KTsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtdGV4dCk7JyB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgZWZmU3RhdHMgPSB0aGlzLnBsdWdpbi5nYW1lLmdldEVmZmVjdGl2ZVN0YXRzKCkuZWZmZWN0aXZlO1xyXG4gICAgICAgIGNvbnN0IGRpc2NvdW50UGN0ID0gTWF0aC5taW4oNTAsIChlZmZTdGF0c1snQyddIHx8IDApICogMik7XHJcblxyXG4gICAgICAgIGhlYWRlci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctc2hvcC1iYWxhbmNlJywgdGV4dDogYCR7Y29pbkljb259ICR7dGhpcy5wbHVnaW4uc3RhdGUuY29pbnN9IChcdTA0MjFcdTA0M0FcdTA0MzhcdTA0MzRcdTA0M0FcdTA0MzAgJHtkaXNjb3VudFBjdH0lKWAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLXNob3AtZ3JpZCcgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5wbHVnaW4uY3VycmVudFVuaXZlcnNlPy5pdGVtcyB8fCBbXTtcclxuICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGdyaWQuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IFwiXHUwNDIyXHUwNDNFXHUwNDQwXHUwNDMzXHUwNDNFXHUwNDMyXHUwNDM1XHUwNDQ2IFx1MDQ0M1x1MDQ0OFx1MDQzNVx1MDQzQiBcdTA0M0RcdTA0MzAgXHUwNDNFXHUwNDMxXHUwNDM1XHUwNDM0LiBcdTA0MTIgXHUwNDREXHUwNDQyXHUwNDNFXHUwNDM5IFx1MDQzMlx1MDQ0MVx1MDQzNVx1MDQzQlx1MDQzNVx1MDQzRFx1MDQzRFx1MDQzRVx1MDQzOSBcdTA0NDJcdTA0M0VcdTA0MzJcdTA0MzBcdTA0NDBcdTA0M0VcdTA0MzIgXHUwNDNEXHUwNDM1XHUwNDQyLlwiLCBzdHlsZTogXCJjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IGdyaWQtY29sdW1uOiAxIC8gLTE7IHRleHQtYWxpZ246IGNlbnRlcjtcIiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbVJhcml0eSA9IGl0ZW0ucmFyaXR5IHx8ICdjb21tb24nO1xyXG4gICAgICAgICAgICAvLyBcdTA0MTRcdTA0MUVcdTA0MTFcdTA0MTBcdTA0MTJcdTA0MUJcdTA0MTVcdTA0MUQgXHUwNDFBXHUwNDFCXHUwNDEwXHUwNDIxXHUwNDIxIFx1MDQyMFx1MDQxNVx1MDQxNFx1MDQxQVx1MDQxRVx1MDQyMVx1MDQyMlx1MDQxOFxyXG4gICAgICAgICAgICBjb25zdCBjYXJkID0gZ3JpZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6IGBycGctaXRlbS1jYXJkIHJwZy1yYXJpdHktJHtpdGVtUmFyaXR5fWAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0b3AgPSBjYXJkLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1pdGVtLWhlYWRlcicgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpY29uRWwgPSB0b3AuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWl0ZW0taWNvbicgfSk7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmljb25faW1nKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdQYXRoID0gYCR7dGhpcy5wbHVnaW4ubWFuaWZlc3QuZGlyfS91bml2ZXJzZXMvJHt0aGlzLnBsdWdpbi5kYXRhLnVuaXZlcnNlSWR9L2l0ZW1zX2ljb24vJHtpdGVtLmljb25faW1nfWA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzcmMgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuYWRhcHRlci5nZXRSZXNvdXJjZVBhdGgoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWcgPSBpY29uRWwuY3JlYXRlRWwoJ2ltZycsIHsgYXR0cjogeyBzcmM6IHNyYyB9IH0pO1xyXG4gICAgICAgICAgICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiB7IGltZy5yZW1vdmUoKTsgaWNvbkVsLmlubmVyVGV4dCA9IGl0ZW0uaWNvbl90ZXh0IHx8ICdcdUQ4M0RcdURDRTYnOyB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWNvbkVsLmlubmVyVGV4dCA9IGl0ZW0uaWNvbl90ZXh0IHx8IGl0ZW0uaWNvbiB8fCAnXHVEODNEXHVEQ0U2JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRvcC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctaXRlbS1pbmZvJyB9KTtcclxuICAgICAgICAgICAgaW5mby5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctaXRlbS1uYW1lJywgdGV4dDogaXRlbS5uYW1lIH0pO1xyXG4gICAgICAgICAgICBpbmZvLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1pdGVtLWRlc2MnLCB0ZXh0OiBpdGVtLmRlc2NyaXB0aW9uIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZmluYWxQcmljZSA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoaXRlbS5wcmljZSAqICgxIC0gKGRpc2NvdW50UGN0IC8gMTAwKSkpKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJ0biA9IGNhcmQuY3JlYXRlRWwoJ2J1dHRvbicsIHsgY2xzOiAncnBnLWl0ZW0tYWN0aW9uJyB9KTtcclxuICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9IGRpc2NvdW50UGN0ID4gMCA/IGBcdTA0MUFcdTA0NDNcdTA0M0ZcdTA0MzhcdTA0NDJcdTA0NEMgKCR7Y29pbkljb259ICR7ZmluYWxQcmljZX0pYCA6IGBcdTA0MUFcdTA0NDNcdTA0M0ZcdTA0MzhcdTA0NDJcdTA0NEMgKCR7Y29pbkljb259ICR7aXRlbS5wcmljZX0pYDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi5zdGF0ZS5jb2lucyA8IGZpbmFsUHJpY2UpIGJ0bi5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBidG4ub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi5zdGF0ZS5jb2lucyA+PSBmaW5hbFByaWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4ubG9zZUNvaW5zKGZpbmFsUHJpY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmludmVudG9yeS5hZGRUb0ludmVudG9yeShpdGVtLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBcdTA0MUFcdTA0NDNcdTA0M0ZcdTA0M0JcdTA0MzVcdTA0M0RcdTA0M0U6ICR7aXRlbS5uYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbG9zZSgpIHsgdGhpcy5jb250ZW50RWwuZW1wdHkoKTsgfVxyXG59IiwgImltcG9ydCB7IE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW52ZW50b3J5TW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihhcHAsIHBsdWdpbikgeyBzdXBlcihhcHApOyB0aGlzLnBsdWdpbiA9IHBsdWdpbjsgdGhpcy5zZWxlY3RlZEl0ZW1JZCA9IG51bGw7IH1cclxuICAgIG9uT3BlbigpIHsgdGhpcy5yZW5kZXIoKTsgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpczsgY29udGVudEVsLmVtcHR5KCk7IGNvbnRlbnRFbC5hZGRDbGFzcygncnBnLXNob3AtY29udGFpbmVyJyk7XHJcbiAgICAgICAgY29uc3QgdWlUZXh0ID0gdGhpcy5wbHVnaW4uY3VycmVudFVuaXZlcnNlPy51aSB8fCB7fTsgY29uc3QgaW52VGl0bGUgPSB1aVRleHQuaW52ZW50b3J5X3RpdGxlIHx8IFwiXHVEODNDXHVERjkyIFx1MDQyMFx1MDQ0RVx1MDQzQVx1MDQzN1x1MDQzMFx1MDQzQVwiO1xyXG5cclxuICAgICAgICBjb25zdCBtYXhTbG90cyA9IDIwICsgKCh0aGlzLnBsdWdpbi5zdGF0ZS5sZXZlbCAtIDEpICogMik7XHJcblxyXG4gICAgICAgIGNvbnN0IGhlYWRlciA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctc2hvcC1oZWFkZXInIH0pO1xyXG4gICAgICAgIGhlYWRlci5jcmVhdGVFbCgnaDInLCB7IHRleHQ6IGludlRpdGxlLCBzdHlsZTogJ21hcmdpbjogMDsgY29sb3I6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXRleHQpOycgfSk7XHJcbiAgICAgICAgaGVhZGVyLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6IGBcdTA0MjNcdTA0NDAuICR7dGhpcy5wbHVnaW4uc3RhdGUubGV2ZWx9IHwgXHUwNDIxXHUwNDNCXHUwNDNFXHUwNDQyXHUwNDNFXHUwNDMyOiAke21heFNsb3RzfWAsIHN0eWxlOiAnY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOyBmb250LXdlaWdodDogYm9sZDsnIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBsYXlvdXQgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWludi1sYXlvdXQnIH0pO1xyXG4gICAgICAgIGNvbnN0IGdyaWRDb250YWluZXIgPSBsYXlvdXQuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWludi1ncmlkLWNvbnRhaW5lcicgfSk7XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGdyaWRDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWludi1ncmlkJyB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgaW52ZW50b3J5ID0gdGhpcy5wbHVnaW4uc3RhdGUuaW52ZW50b3J5IHx8IFtdO1xyXG4gICAgICAgIGNvbnN0IGVxdWlwcGVkSXRlbXMgPSBPYmplY3QudmFsdWVzKHRoaXMucGx1Z2luLnN0YXRlLmVxdWlwbWVudCB8fCB7fSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4U2xvdHM7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBzbG90ID0gZ3JpZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctaW52LXNsb3QnIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGkgPCBpbnZlbnRvcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnZJdGVtID0gaW52ZW50b3J5W2ldOyBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1EYXRhID0gdGhpcy5wbHVnaW4uaXRlbXNEYXRhYmFzZS5nZXQoaW52SXRlbS5pZCk7IC8vIFx1MDQxOFx1MDQxN1x1MDQxQ1x1MDQxNVx1MDQxRFx1MDQxNVx1MDQxRFx1MDQxRVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbURhdGEuaWNvbl9pbWcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gXHUwNDE4XHUwNDE3XHUwNDFDXHUwNDE1XHUwNDFEXHUwNDE1XHUwNDFEXHUwNDFFOiBcdTA0MTFcdTA0MzVcdTA0NDBcdTA0MzVcdTA0M0MgXHUwNDNGXHUwNDMwXHUwNDNGXHUwNDNBXHUwNDQzIFx1MDQzOFx1MDQzNyBpdGVtRGF0YS51bml2ZXJzZV9pZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdQYXRoID0gYCR7dGhpcy5wbHVnaW4ubWFuaWZlc3QuZGlyfS91bml2ZXJzZXMvJHtpdGVtRGF0YS51bml2ZXJzZV9pZH0vaXRlbXNfaWNvbi8ke2l0ZW1EYXRhLmljb25faW1nfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNyYyA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5hZGFwdGVyLmdldFJlc291cmNlUGF0aChpbWdQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nID0gc2xvdC5jcmVhdGVFbCgnaW1nJywgeyBhdHRyOiB7IHNyYzogc3JjIH0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4geyBpbWcucmVtb3ZlKCk7IHNsb3QuaW5uZXJUZXh0ID0gaXRlbURhdGEuaWNvbl90ZXh0IHx8ICdcdUQ4M0RcdURDRTYnOyB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IHNsb3QuaW5uZXJUZXh0ID0gaXRlbURhdGEuaWNvbl90ZXh0IHx8IGl0ZW1EYXRhLmljb24gfHwgJ1x1RDgzRFx1RENFNic7IH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGludkl0ZW0ucXVhbnRpdHkgPiAxKSBzbG90LmNyZWF0ZUVsKCdzcGFuJywgeyBjbHM6ICdycGctc2xvdC1xdHknLCB0ZXh0OiBgeCR7aW52SXRlbS5xdWFudGl0eX1gIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbUlkID09PSBpbnZJdGVtLmlkKSBzbG90LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcXVpcHBlZEl0ZW1zLmluY2x1ZGVzKGludkl0ZW0uaWQpKSBzbG90LmFkZENsYXNzKCdlcXVpcHBlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzbG90Lm9uY2xpY2sgPSAoKSA9PiB7IHRoaXMuc2VsZWN0ZWRJdGVtSWQgPSBpbnZJdGVtLmlkOyB0aGlzLnJlbmRlcigpOyB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgeyBzbG90LmFkZENsYXNzKCdlbXB0eScpOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzaWRlYmFyID0gbGF5b3V0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1pbnYtc2lkZWJhcicgfSk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZEl0ZW1JZCkgeyBzaWRlYmFyLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6IFwiXHUwNDEyXHUwNDRCXHUwNDMxXHUwNDM1XHUwNDQwXHUwNDM4IFx1MDQzRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzQ1x1MDQzNVx1MDQ0MlwiLCBzdHlsZTogXCJ0ZXh0LWFsaWduOiBjZW50ZXI7IGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTsgbWFyZ2luLXRvcDogYXV0bzsgbWFyZ2luLWJvdHRvbTogYXV0bztcIiB9KTsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkSW52SXRlbSA9IGludmVudG9yeS5maW5kKGkgPT4gaS5pZCA9PT0gdGhpcy5zZWxlY3RlZEl0ZW1JZCk7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWREYXRhID0gdGhpcy5wbHVnaW4uaXRlbXNEYXRhYmFzZS5nZXQodGhpcy5zZWxlY3RlZEl0ZW1JZCk7IC8vIFx1MDQxOFx1MDQxN1x1MDQxQ1x1MDQxNVx1MDQxRFx1MDQxNVx1MDQxRFx1MDQxRVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghc2VsZWN0ZWRJbnZJdGVtIHx8ICFzZWxlY3RlZERhdGEpIHsgdGhpcy5zZWxlY3RlZEl0ZW1JZCA9IG51bGw7IHRoaXMucmVuZGVyKCk7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBjb25zdCBpdGVtUmFyaXR5ID0gc2VsZWN0ZWREYXRhLnJhcml0eSB8fCAnY29tbW9uJztcclxuICAgICAgICBzaWRlYmFyLmFkZENsYXNzKGBycGctcmFyaXR5LSR7aXRlbVJhcml0eX1gKTtcclxuXHJcbiAgICAgICAgY29uc3QgaWNvbkVsID0gc2lkZWJhci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctc2lkZWJhci1pY29uJyB9KTtcclxuICAgICAgICBpZiAoc2VsZWN0ZWREYXRhLmljb25faW1nKSB7XHJcbiAgICAgICAgICAgIC8vIFx1MDQxOFx1MDQxN1x1MDQxQ1x1MDQxNVx1MDQxRFx1MDQxNVx1MDQxRFx1MDQxRTogXHUwNDExXHUwNDM1XHUwNDQwXHUwNDM1XHUwNDNDIFx1MDQzRlx1MDQzMFx1MDQzRlx1MDQzQVx1MDQ0MyBcdTA0MzhcdTA0Mzcgc2VsZWN0ZWREYXRhLnVuaXZlcnNlX2lkXHJcbiAgICAgICAgICAgIGNvbnN0IGltZ1BhdGggPSBgJHt0aGlzLnBsdWdpbi5tYW5pZmVzdC5kaXJ9L3VuaXZlcnNlcy8ke3NlbGVjdGVkRGF0YS51bml2ZXJzZV9pZH0vaXRlbXNfaWNvbi8ke3NlbGVjdGVkRGF0YS5pY29uX2ltZ31gO1xyXG4gICAgICAgICAgICBjb25zdCBzcmMgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuYWRhcHRlci5nZXRSZXNvdXJjZVBhdGgoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGljb25FbC5jcmVhdGVFbCgnaW1nJywgeyBhdHRyOiB7IHNyYzogc3JjIH0sIHN0eWxlOiBcIndpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7IG9iamVjdC1maXQ6IGNvbnRhaW47XCIgfSk7XHJcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4geyBpbWcucmVtb3ZlKCk7IGljb25FbC5pbm5lclRleHQgPSBzZWxlY3RlZERhdGEuaWNvbl90ZXh0IHx8ICdcdUQ4M0RcdURDRTYnOyB9O1xyXG4gICAgICAgIH0gZWxzZSB7IGljb25FbC5pbm5lclRleHQgPSBzZWxlY3RlZERhdGEuaWNvbl90ZXh0IHx8IHNlbGVjdGVkRGF0YS5pY29uIHx8ICdcdUQ4M0RcdURDRTYnOyB9XHJcblxyXG4gICAgICAgIHNpZGViYXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWl0ZW0tbmFtZScsIHRleHQ6IGAke3NlbGVjdGVkRGF0YS5uYW1lfSAoeCR7c2VsZWN0ZWRJbnZJdGVtLnF1YW50aXR5fSlgLCBzdHlsZTogXCJ0ZXh0LWFsaWduOiBjZW50ZXI7IG1hcmdpbi1ib3R0b206IDEwcHg7IGZvbnQtc2l6ZTogMS4yZW07XCIgfSk7XHJcbiAgICAgICAgc2lkZWJhci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctc2lkZWJhci1kZXNjJywgdGV4dDogc2VsZWN0ZWREYXRhLmRlc2NyaXB0aW9uIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBhY3Rpb25zID0gc2lkZWJhci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctc2lkZWJhci1hY3Rpb25zJyB9KTtcclxuICAgICAgICBjb25zdCBpc0VxdWlwcGVkID0gZXF1aXBwZWRJdGVtcy5pbmNsdWRlcyhzZWxlY3RlZEludkl0ZW0uaWQpO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0ZWREYXRhLnR5cGUgPT09ICdlcXVpcG1lbnQnKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0VxdWlwcGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidG5VbmVxdWlwID0gYWN0aW9ucy5jcmVhdGVFbCgnYnV0dG9uJywgeyBjbHM6ICdidG4tdXNlJywgdGV4dDogJ1x1MDQyMVx1MDQzRFx1MDQ0Rlx1MDQ0Mlx1MDQ0QycgfSk7XHJcbiAgICAgICAgICAgICAgICBidG5VbmVxdWlwLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7IGF3YWl0IHRoaXMucGx1Z2luLmludmVudG9yeS51bmVxdWlwSXRlbShzZWxlY3RlZERhdGEuZXF1aXBTbG90KTsgdGhpcy5yZW5kZXIoKTsgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ0bkVxdWlwID0gYWN0aW9ucy5jcmVhdGVFbCgnYnV0dG9uJywgeyBjbHM6ICdidG4tdXNlJywgdGV4dDogJ1x1MDQxRFx1MDQzMFx1MDQzNFx1MDQzNVx1MDQ0Mlx1MDQ0QycgfSk7XHJcbiAgICAgICAgICAgICAgICBidG5FcXVpcC5vbmNsaWNrID0gYXN5bmMgKCkgPT4geyBhd2FpdCB0aGlzLnBsdWdpbi5pbnZlbnRvcnkuZXF1aXBJdGVtKHNlbGVjdGVkRGF0YS5lcXVpcFNsb3QsIHNlbGVjdGVkSW52SXRlbS5pZCk7IHRoaXMucmVuZGVyKCk7IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBidG5Vc2UgPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IGNsczogJ2J0bi11c2UnLCB0ZXh0OiB1aVRleHQuYnRuX3VzZSB8fCBcIlx1MDQxOFx1MDQ0MVx1MDQzRlx1MDQzRVx1MDQzQlx1MDQ0Q1x1MDQzN1x1MDQzRVx1MDQzMlx1MDQzMFx1MDQ0Mlx1MDQ0Q1wiIH0pO1xyXG4gICAgICAgICAgICBidG5Vc2Uub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmludmVudG9yeS51c2VJdGVtKHNlbGVjdGVkSW52SXRlbS5pZCwgc2VsZWN0ZWREYXRhKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrID0gdGhpcy5wbHVnaW4uc3RhdGUuaW52ZW50b3J5LmZpbmQoaSA9PiBpLmlkID09PSB0aGlzLnNlbGVjdGVkSXRlbUlkKTtcclxuICAgICAgICAgICAgICAgIGlmICghY2hlY2spIHRoaXMuc2VsZWN0ZWRJdGVtSWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaXNFcXVpcHBlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBidG5Ecm9wID0gYWN0aW9ucy5jcmVhdGVFbCgnYnV0dG9uJywgeyBjbHM6ICdidG4tZHJvcCcsIHRleHQ6IHVpVGV4dC5idG5fZHJvcCB8fCBcIlx1MDQxMlx1MDQ0Qlx1MDQzMVx1MDQ0MFx1MDQzRVx1MDQ0MVx1MDQzOFx1MDQ0Mlx1MDQ0Q1wiIH0pO1xyXG4gICAgICAgICAgICBidG5Ecm9wLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5pbnZlbnRvcnkuZHJvcEl0ZW0oc2VsZWN0ZWRJbnZJdGVtLmlkKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrID0gdGhpcy5wbHVnaW4uc3RhdGUuaW52ZW50b3J5LmZpbmQoaSA9PiBpLmlkID09PSB0aGlzLnNlbGVjdGVkSXRlbUlkKTtcclxuICAgICAgICAgICAgICAgIGlmICghY2hlY2spIHRoaXMuc2VsZWN0ZWRJdGVtSWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvbkNsb3NlKCkgeyB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpOyB9XHJcbn0iLCAiaW1wb3J0IHsgTW9kYWwgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFyYWN0ZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICAgIGNvbnN0cnVjdG9yKGFwcCwgcGx1Z2luKSB7IHN1cGVyKGFwcCk7IHRoaXMucGx1Z2luID0gcGx1Z2luOyB9XHJcbiAgICBvbk9wZW4oKSB7IHRoaXMucmVuZGVyKCk7IH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7IGNvbnRlbnRFbC5lbXB0eSgpOyBjb250ZW50RWwuYWRkQ2xhc3MoJ3JwZy1zaG9wLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLnBsdWdpbjsgY29uc3QgYyA9IHAuY3VycmVudENvbXBhbmlvbjsgY29uc3QgdWkgPSBwLmN1cnJlbnRVbml2ZXJzZT8udWkgfHwgeyBjb2luX2ljb246IFwiXHVEODNFXHVERTk5XCIgfTsgY29uc3QgdCA9IHAuY3VycmVudFVuaXZlcnNlPy50ZXJtaW5vbG9neSB8fCB7fTtcclxuXHJcbiAgICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogXCJcdUQ4M0VcdURFQUEgXHUwNDFCXHUwNDM4XHUwNDQ3XHUwNDNEXHUwNDNFXHUwNDM1IFx1MDQxNFx1MDQzNVx1MDQzQlx1MDQzRVwiLCBzdHlsZTogJ3RleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7IG1hcmdpbjogMDsnIH0pO1xyXG4gICAgICAgIGNvbnN0IGxheW91dCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctY2hhci1sYXlvdXQnIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBsZWZ0ID0gbGF5b3V0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1jaGFyLWxlZnQnIH0pO1xyXG4gICAgICAgIGNvbnN0IGF2YXRhckNvbnRhaW5lciA9IGxlZnQuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWNoYXItYXZhdGFyJyB9KTtcclxuXHJcbiAgICAgICAgaWYgKHAuY3VycmVudFNwcml0ZVVybCkge1xyXG4gICAgICAgICAgICBjb25zdCBpbWcgPSBhdmF0YXJDb250YWluZXIuY3JlYXRlRWwoJ2ltZycsIHsgYXR0cjogeyBzcmM6IHAuY3VycmVudFNwcml0ZVVybCB9IH0pO1xyXG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGltZy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIGF2YXRhckNvbnRhaW5lci5pbm5lclRleHQgPSBjLmF2YXRhcl90ZXh0IHx8ICdcdUQ4M0RcdURDNjQnO1xyXG4gICAgICAgICAgICAgICAgYXZhdGFyQ29udGFpbmVyLnN0eWxlLmZvbnRTaXplID0gJzRlbSc7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXZhdGFyQ29udGFpbmVyLmlubmVyVGV4dCA9IGMuYXZhdGFyX3RleHQgfHwgJ1x1RDgzRFx1REM2NCc7XHJcbiAgICAgICAgICAgIGF2YXRhckNvbnRhaW5lci5zdHlsZS5mb250U2l6ZSA9ICc0ZW0nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGVmdC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctY2hhci1uYW1lJywgdGV4dDogYz8ubmFtZSB8fCBcIlx1MDQxRFx1MDQzNVx1MDQzOFx1MDQzN1x1MDQzMlx1MDQzNVx1MDQ0MVx1MDQ0Mlx1MDQzRFx1MDQ0Qlx1MDQzOVwiIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0c1N1bW1hcnkgPSBsZWZ0LmNyZWF0ZUVsKCdkaXYnLCB7IHN0eWxlOiAndGV4dC1hbGlnbjogY2VudGVyOyB3aWR0aDogMTAwJTsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZm9udC1zaXplOiAxLjFlbTsgbGluZS1oZWlnaHQ6IDEuNTsgY29sb3I6IHZhcigtLXRleHQtbm9ybWFsKTsnIH0pO1xyXG4gICAgICAgIHN0YXRzU3VtbWFyeS5jcmVhdGVFbCgnZGl2JywgeyB0ZXh0OiBgJHt0LmxldmVsfSAke3Auc3RhdGUubGV2ZWx9ICgke01hdGguZmxvb3IocC5zdGF0ZS54cCl9LyR7cC5zdGF0ZS54cFRvTmV4dExldmVsfSBYUClgIH0pO1xyXG4gICAgICAgIHN0YXRzU3VtbWFyeS5jcmVhdGVFbCgnZGl2JywgeyB0ZXh0OiBgJHt0LmhwfTogJHtwLnN0YXRlLmhwfS8ke3Auc3RhdGUubWF4SHB9YCwgc3R5bGU6ICdjb2xvcjogI2U3NGMzYzsnIH0pO1xyXG4gICAgICAgIHN0YXRzU3VtbWFyeS5jcmVhdGVFbCgnZGl2JywgeyB0ZXh0OiBgXHUwNDExXHUwNDMwXHUwNDNCXHUwNDMwXHUwNDNEXHUwNDQxOiAke3VpLmNvaW5faWNvbn0gJHtwLnN0YXRlLmNvaW5zfWAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVxdWlwID0gbGVmdC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdycGctY2hhci1lcXVpcCcgfSk7XHJcbiAgICAgICAgY29uc3QgZXFTdGF0ZSA9IHAuc3RhdGUuZXF1aXBtZW50IHx8IHt9O1xyXG5cclxuICAgICAgICBjb25zdCByZW5kZXJTbG90ID0gKHNsb3ROYW1lLCBzbG90TGFiZWwpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbUlkID0gZXFTdGF0ZVtzbG90TmFtZV07XHJcbiAgICAgICAgICAgIGNvbnN0IHNsb3RFbCA9IGVxdWlwLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1lcXVpcC1zbG90JyB9KTtcclxuICAgICAgICAgICAgaWYgKGl0ZW1JZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbURhdGEgPSBwLml0ZW1zRGF0YWJhc2UuZ2V0KGl0ZW1JZCk7IC8vIFx1MDQxOFx1MDQxN1x1MDQxQ1x1MDQxNVx1MDQxRFx1MDQxNVx1MDQxRFx1MDQxRTogXHUwNDEzXHUwNDNCXHUwNDNFXHUwNDMxXHUwNDMwXHUwNDNCXHUwNDRDXHUwNDNEXHUwNDMwXHUwNDRGIFx1MDQxMVx1MDQxNFxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1EYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1EYXRhLmljb25faW1nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1MDQxOFx1MDQxN1x1MDQxQ1x1MDQxNVx1MDQxRFx1MDQxNVx1MDQxRFx1MDQxRTogXHUwNDExXHUwNDM1XHUwNDQwXHUwNDM1XHUwNDNDIFx1MDQzRlx1MDQzMFx1MDQzRlx1MDQzQVx1MDQ0MyBcdTA0MzhcdTA0MzcgaXRlbURhdGEudW5pdmVyc2VfaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nUGF0aCA9IGAke3RoaXMucGx1Z2luLm1hbmlmZXN0LmRpcn0vdW5pdmVyc2VzLyR7aXRlbURhdGEudW5pdmVyc2VfaWR9L2l0ZW1zX2ljb24vJHtpdGVtRGF0YS5pY29uX2ltZ31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcmMgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuYWRhcHRlci5nZXRSZXNvdXJjZVBhdGgoaW1nUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZyA9IHNsb3RFbC5jcmVhdGVFbCgnaW1nJywgeyBhdHRyOiB7IHNyYzogc3JjIH0sIHN0eWxlOiAnd2lkdGg6MjRweDsgaGVpZ2h0OjI0cHg7IG9iamVjdC1maXQ6Y29udGFpbjsnIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHsgaW1nLnJlbW92ZSgpOyBzbG90RWwuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IGl0ZW1EYXRhLmljb25fdGV4dCB8fCAnXHVEODNEXHVEQ0U2JyB9KTsgfTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyBzbG90RWwuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IGl0ZW1EYXRhLmljb25fdGV4dCB8fCBpdGVtRGF0YS5pY29uIHx8ICdcdUQ4M0RcdURDRTYnIH0pOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdEVsLmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiBpdGVtRGF0YS5uYW1lIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzbG90RWwuaW5uZXJUZXh0ID0gYCR7c2xvdExhYmVsfSAoXHUwNDFGXHUwNDQzXHUwNDQxXHUwNDQyXHUwNDNFKWA7XHJcbiAgICAgICAgICAgIHNsb3RFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS10ZXh0LW11dGVkKSc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVuZGVyU2xvdCgnaGVhZCcsICdcdTA0MTNcdTA0M0VcdTA0M0JcdTA0M0VcdTA0MzJcdTA0MzAnKTsgcmVuZGVyU2xvdCgnYm9keScsICdcdTA0MTFcdTA0NDBcdTA0M0VcdTA0M0RcdTA0NEYnKTsgcmVuZGVyU2xvdCgnd2VhcG9uJywgJ1x1MDQxRVx1MDQ0MFx1MDQ0M1x1MDQzNlx1MDQzOFx1MDQzNScpOyByZW5kZXJTbG90KCdhY2Nlc3NvcnknLCAnXHUwNDEwXHUwNDNBXHUwNDQxXHUwNDM1XHUwNDQxXHUwNDQxXHUwNDQzXHUwNDMwXHUwNDQwJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gbGF5b3V0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1jaGFyLXJpZ2h0JyB9KTtcclxuICAgICAgICBjb25zdCBzdGF0c0RhdGEgPSBwLmdhbWUuZ2V0RWZmZWN0aXZlU3RhdHMoKTtcclxuICAgICAgICBjb25zdCBiYXNlU3RhdHMgPSBzdGF0c0RhdGEuYmFzZTtcclxuICAgICAgICBjb25zdCBlZmZTdGF0cyA9IHN0YXRzRGF0YS5lZmZlY3RpdmU7XHJcblxyXG4gICAgICAgIGNvbnN0IHNwZWNpYWxEZWZzID0gW1xyXG4gICAgICAgICAgICB7IGtleTogJ1MnLCBuYW1lOiAnXHUwNDIxXHUwNDM4XHUwNDNCXHUwNDMwIChTdHJlbmd0aCknLCBkZXNjOiAnKzUgXHUwNDFDXHUwNDMwXHUwNDNBXHUwNDQxLiBIUCBcdTA0MzdcdTA0MzAgXHUwNDNBXHUwNDMwXHUwNDM2XHUwNDM0XHUwNDNFXHUwNDM1IFx1MDQzRVx1MDQ0N1x1MDQzQVx1MDQzRScgfSxcclxuICAgICAgICAgICAgeyBrZXk6ICdQJywgbmFtZTogJ1x1MDQxMlx1MDQzRVx1MDQ0MVx1MDQzRlx1MDQ0MFx1MDQzOFx1MDQ0Rlx1MDQ0Mlx1MDQzOFx1MDQzNSAoUGVyY2VwdGlvbiknLCBkZXNjOiAnKzIlIFx1MDQzQSBcdTA0M0ZcdTA0M0VcdTA0M0JcdTA0NDNcdTA0NDdcdTA0MzBcdTA0MzVcdTA0M0NcdTA0M0VcdTA0M0NcdTA0NDMgXHUwNDE3XHUwNDNFXHUwNDNCXHUwNDNFXHUwNDQyXHUwNDQzJyB9LFxyXG4gICAgICAgICAgICB7IGtleTogJ0UnLCBuYW1lOiAnXHUwNDEyXHUwNDRCXHUwNDNEXHUwNDNFXHUwNDQxXHUwNDNCXHUwNDM4XHUwNDMyXHUwNDNFXHUwNDQxXHUwNDQyXHUwNDRDIChFbmR1cmFuY2UpJywgZGVzYzogJy0xIFx1MDQzNVx1MDQzNlx1MDQzNVx1MDQzNFx1MDQzRFx1MDQzNVx1MDQzMlx1MDQzRFx1MDQzRVx1MDQzM1x1MDQzRSBcdTA0NDNcdTA0NDBcdTA0M0VcdTA0M0RcdTA0MzAgXHUwNDM3XHUwNDMwIFx1MDQzRlx1MDQ0MFx1MDQzRVx1MDQzRlx1MDQ0M1x1MDQ0MVx1MDQzQVx1MDQzOCcgfSxcclxuICAgICAgICAgICAgeyBrZXk6ICdDJywgbmFtZTogJ1x1MDQyNVx1MDQzMFx1MDQ0MFx1MDQzOFx1MDQzN1x1MDQzQ1x1MDQzMCAoQ2hhcmlzbWEpJywgZGVzYzogJy0yJSBcdTA0NDZcdTA0MzVcdTA0M0RcdTA0NEIgXHUwNDMyIFx1MDQxQ1x1MDQzMFx1MDQzM1x1MDQzMFx1MDQzN1x1MDQzOFx1MDQzRFx1MDQzNSAoXHUwNDNDXHUwNDMwXHUwNDNBXHUwNDQxLiAtNTAlKScgfSxcclxuICAgICAgICAgICAgeyBrZXk6ICdJJywgbmFtZTogJ1x1MDQxOFx1MDQzRFx1MDQ0Mlx1MDQzNVx1MDQzQlx1MDQzQlx1MDQzNVx1MDQzQVx1MDQ0MiAoSW50ZWxsaWdlbmNlKScsIGRlc2M6ICcrMiUgXHUwNDNBIFx1MDQzRlx1MDQzRVx1MDQzQlx1MDQ0M1x1MDQ0N1x1MDQzMFx1MDQzNVx1MDQzQ1x1MDQzRVx1MDQzQ1x1MDQ0MyBcdTA0MUVcdTA0M0ZcdTA0NEJcdTA0NDJcdTA0NDMnIH0sXHJcbiAgICAgICAgICAgIHsga2V5OiAnQScsIG5hbWU6ICdcdTA0MUJcdTA0M0VcdTA0MzJcdTA0M0FcdTA0M0VcdTA0NDFcdTA0NDJcdTA0NEMgKEFnaWxpdHkpJywgZGVzYzogJysyJSBcdTA0NDhcdTA0MzBcdTA0M0RcdTA0NDEgXHUwNDQzXHUwNDNBXHUwNDNCXHUwNDNFXHUwNDNEXHUwNDM4XHUwNDQyXHUwNDRDXHUwNDQxXHUwNDRGIFx1MDQzRVx1MDQ0MiBcdTA0NDNcdTA0NDBcdTA0M0VcdTA0M0RcdTA0MzAgKFx1MDQzQ1x1MDQzMFx1MDQzQVx1MDQ0MSA3MCUpJyB9LFxyXG4gICAgICAgICAgICB7IGtleTogJ0wnLCBuYW1lOiAnXHUwNDIzXHUwNDM0XHUwNDMwXHUwNDQ3XHUwNDMwIChMdWNrKScsIGRlc2M6ICcxJSBcdTA0NDhcdTA0MzBcdTA0M0RcdTA0NDEgXHUwNDNEXHUwNDMwXHUwNDM5XHUwNDQyXHUwNDM4IFx1MDQzRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzQ1x1MDQzNVx1MDQ0MiBcdTA0MzdcdTA0MzAgXHUwNDNBXHUwNDMyXHUwNDM1XHUwNDQxXHUwNDQyJyB9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgc3BlY2lhbERlZnMuZm9yRWFjaChzdGF0ID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgcm93ID0gcmlnaHQuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWNoYXItc3RhdC1yb3cnIH0pO1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gcm93LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1jaGFyLXN0YXQtaW5mbycgfSk7XHJcbiAgICAgICAgICAgIGluZm8uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncnBnLWNoYXItc3RhdC1uYW1lJywgdGV4dDogc3RhdC5uYW1lIH0pO1xyXG4gICAgICAgICAgICBpbmZvLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1jaGFyLXN0YXQtZGVzYycsIHRleHQ6IHN0YXQuZGVzYyB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbENvbnRhaW5lciA9IHJvdy5jcmVhdGVFbCgnZGl2JywgeyBzdHlsZTogJ3RleHQtYWxpZ246IHJpZ2h0OycgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJhc2VWYWwgPSBiYXNlU3RhdHNbc3RhdC5rZXldIHx8IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGVmZlZhbCA9IGVmZlN0YXRzW3N0YXQua2V5XSB8fCAwO1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmID0gZWZmVmFsIC0gYmFzZVZhbDtcclxuXHJcbiAgICAgICAgICAgIHZhbENvbnRhaW5lci5jcmVhdGVFbCgnc3BhbicsIHsgY2xzOiAncnBnLWNoYXItc3RhdC12YWwnLCB0ZXh0OiBiYXNlVmFsLnRvU3RyaW5nKCkgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhbENvbnRhaW5lci5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogYCAoKyR7ZGlmZn0pYCwgc3R5bGU6ICdjb2xvcjogIzJlY2M3MTsgZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMC45ZW07JyB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaWZmIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdmFsQ29udGFpbmVyLmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiBgICgke2RpZmZ9KWAsIHN0eWxlOiAnY29sb3I6ICNlNzRjM2M7IGZvbnQtd2VpZ2h0OiBib2xkOyBmb250LXNpemU6IDAuOWVtOycgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3JwZy1jaGFyLWZvb3RlcicsIHRleHQ6IFwiXHUyMTM5XHVGRTBGIFx1MDQxRlx1MDQzRVx1MDQzNFx1MDQ0MVx1MDQzQVx1MDQzMFx1MDQzN1x1MDQzQVx1MDQzMDogXHUwNDE4XHUwNDQxXHUwNDNGXHUwNDNFXHUwNDNCXHUwNDRDXHUwNDM3XHUwNDQzXHUwNDM5XHUwNDQyXHUwNDM1IFx1MDQ0Mlx1MDQzNVx1MDQzM1x1MDQzOCBcdTA0NDEgXHUwNDM3XHUwNDMwXHUwNDMzXHUwNDNCXHUwNDMwXHUwNDMyXHUwNDNEXHUwNDNFXHUwNDM5IFx1MDQzMVx1MDQ0M1x1MDQzQVx1MDQzMlx1MDQ0QiAoXHUwNDNEXHUwNDMwXHUwNDNGXHUwNDQwXHUwNDM4XHUwNDNDXHUwNDM1XHUwNDQwLCAjU3BvcnQsICNDb2RlLCAjRW5nbGlzaCkgXHUwNDMyIFx1MDQzMlx1MDQzMFx1MDQ0OFx1MDQzOFx1MDQ0NSBcdTA0MzdcdTA0MzBcdTA0MzRcdTA0MzBcdTA0NDdcdTA0MzBcdTA0NDUsIFx1MDQ0N1x1MDQ0Mlx1MDQzRVx1MDQzMVx1MDQ0QiBcdTA0M0ZcdTA0NDBcdTA0M0VcdTA0M0FcdTA0MzBcdTA0NDdcdTA0MzhcdTA0MzJcdTA0MzBcdTA0NDJcdTA0NEMgXHUwNDQxXHUwNDNFXHUwNDNFXHUwNDQyXHUwNDMyXHUwNDM1XHUwNDQyXHUwNDQxXHUwNDQyXHUwNDMyXHUwNDQzXHUwNDRFXHUwNDQ5XHUwNDM4XHUwNDM1IFx1MDQ0NVx1MDQzMFx1MDQ0MFx1MDQzMFx1MDQzQVx1MDQ0Mlx1MDQzNVx1MDQ0MFx1MDQzOFx1MDQ0MVx1MDQ0Mlx1MDQzOFx1MDQzQVx1MDQzOCBTLlAuRS5DLkkuQS5MLlwiIH0pO1xyXG4gICAgfVxyXG4gICAgb25DbG9zZSgpIHsgdGhpcy5jb250ZW50RWwuZW1wdHkoKTsgfVxyXG59IiwgImltcG9ydCB7IE1vZGFsLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmNvdW50ZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICAgIGNvbnN0cnVjdG9yKGFwcCwgcGx1Z2luLCBlbmNvdW50ZXJEYXRhKSB7XHJcbiAgICAgICAgc3VwZXIoYXBwKTtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICAgICAgICB0aGlzLmVuY291bnRlciA9IGVuY291bnRlckRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgb25PcGVuKCkge1xyXG4gICAgICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gICAgICAgIGNvbnRlbnRFbC5hZGRDbGFzcygncnBnLXNob3AtY29udGFpbmVyJyk7IC8vIFx1MDQxOFx1MDQ0MVx1MDQzRlx1MDQzRVx1MDQzQlx1MDQ0Q1x1MDQzN1x1MDQ0M1x1MDQzNVx1MDQzQyBcdTA0MzFcdTA0MzBcdTA0MzdcdTA0M0VcdTA0MzJcdTA0NEJcdTA0MzUgXHUwNDNFXHUwNDQyXHUwNDQxXHUwNDQyXHUwNDQzXHUwNDNGXHUwNDRCXHJcblxyXG4gICAgICAgIC8vIFx1MDQxN1x1MDQzMFx1MDQzM1x1MDQzRVx1MDQzQlx1MDQzRVx1MDQzMlx1MDQzRVx1MDQzQSBcdTA0MzggXHUwNDE4XHUwNDNBXHUwNDNFXHUwNDNEXHUwNDNBXHUwNDMwXHJcbiAgICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHRleHQ6IHRoaXMuZW5jb3VudGVyLmljb24gfHwgXCJcdUQ4M0NcdURGQjJcIixcclxuICAgICAgICAgICAgc3R5bGU6ICdmb250LXNpemU6IDRlbTsgdGV4dC1hbGlnbjogY2VudGVyOyBtYXJnaW4tYm90dG9tOiAxMHB4OydcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHtcclxuICAgICAgICAgICAgdGV4dDogdGhpcy5lbmNvdW50ZXIudGl0bGUsXHJcbiAgICAgICAgICAgIHN0eWxlOiAndGV4dC1hbGlnbjogY2VudGVyOyBjb2xvcjogdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KTsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtdGV4dCk7IG1hcmdpbi10b3A6IDA7J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBcdTA0MUVcdTA0M0ZcdTA0MzhcdTA0NDFcdTA0MzBcdTA0M0RcdTA0MzhcdTA0MzUgXHUwNDQxXHUwNDM4XHUwNDQyXHUwNDQzXHUwNDMwXHUwNDQ2XHUwNDM4XHUwNDM4XHJcbiAgICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xyXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLmVuY291bnRlci5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgc3R5bGU6ICdmb250LXNpemU6IDEuMWVtOyBsaW5lLWhlaWdodDogMS41OyBjb2xvcjogdmFyKC0tdGV4dC1ub3JtYWwpOyB0ZXh0LWFsaWduOiBjZW50ZXI7IG1hcmdpbi1ib3R0b206IDI1cHg7IHBhZGRpbmc6IDAgMTVweDsnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFx1MDQxQVx1MDQzRVx1MDQzRFx1MDQ0Mlx1MDQzNVx1MDQzOVx1MDQzRFx1MDQzNVx1MDQ0MCBcdTA0MzRcdTA0M0JcdTA0NEYgXHUwNDNBXHUwNDNEXHUwNDNFXHUwNDNGXHUwNDNFXHUwNDNBIFx1MDQzMlx1MDQ0Qlx1MDQzMVx1MDQzRVx1MDQ0MFx1MDQzMFxyXG4gICAgICAgIGNvbnN0IGFjdGlvbnNEaXYgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgc3R5bGU6ICdkaXNwbGF5OiBmbGV4OyBnYXA6IDE1cHg7IGp1c3RpZnktY29udGVudDogY2VudGVyOycgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZW5jb3VudGVyLmNob2ljZXMuZm9yRWFjaChjaG9pY2UgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidG4gPSBhY3Rpb25zRGl2LmNyZWF0ZUVsKCdidXR0b24nLCB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBjaG9pY2UudGV4dCxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiAncGFkZGluZzogMTBweCAyMHB4OyBmb250LXdlaWdodDogYm9sZDsgYm9yZGVyLXJhZGl1czogOHB4OyBjdXJzb3I6IHBvaW50ZXI7IGZsZXg6IDE7IGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTsgYm9yZGVyOiAycHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpOyBjb2xvcjogdmFyKC0tdGV4dC1ub3JtYWwpOyB0cmFuc2l0aW9uOiAwLjJzOydcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBidG4ub25tb3VzZW92ZXIgPSAoKSA9PiB7IGJ0bi5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpJzsgfTtcclxuICAgICAgICAgICAgYnRuLm9ubW91c2VvdXQgPSAoKSA9PiB7IGJ0bi5zdHlsZS5ib3JkZXJDb2xvciA9ICd2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlciknOyB9O1xyXG5cclxuICAgICAgICAgICAgYnRuLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnByb2Nlc3NPdXRjb21lcyhjaG9pY2Uub3V0Y29tZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpOyAvLyBcdTA0MTdcdTA0MzBcdTA0M0FcdTA0NDBcdTA0NEJcdTA0MzJcdTA0MzBcdTA0MzVcdTA0M0MgXHUwNDNFXHUwNDNBXHUwNDNEXHUwNDNFIFx1MDQzRlx1MDQzRVx1MDQ0MVx1MDQzQlx1MDQzNSBcdTA0MzJcdTA0NEJcdTA0MzFcdTA0M0VcdTA0NDBcdTA0MzBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwcm9jZXNzT3V0Y29tZXMob3V0Y29tZXMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IG91dGNvbWUgb2Ygb3V0Y29tZXMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChvdXRjb21lLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2dhaW5feHAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmdhbWUuZ2FpblhQKG91dGNvbWUudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbG9zZV94cCc6XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uZ2FtZS5sb3NlWFAob3V0Y29tZS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdnYWluX2NvaW5zJzpcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmdhaW5Db2lucyhvdXRjb21lLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xvc2VfY29pbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmdhbWUubG9zZUNvaW5zKG91dGNvbWUudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZ2Fpbl9ocCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc3RhdGUuaHAgPSBNYXRoLm1pbih0aGlzLnBsdWdpbi5zdGF0ZS5tYXhIcCwgdGhpcy5wbHVnaW4uc3RhdGUuaHAgKyBvdXRjb21lLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xvc2VfaHAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnN0YXRlLmhwIC09IG91dGNvbWUudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLnN0YXRlLmhwIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVuYWx0aWVzID0gdGhpcy5wbHVnaW4uY3VycmVudFVuaXZlcnNlPy5wZW5hbHRpZXMgfHwgeyBkZWF0aF94cF9sb3NzX3BjdDogMTAsIGRlYXRoX2dvbGRfbG9zc19wY3Q6IDEwIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmdhbWUuZGllKHBlbmFsdGllcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZ2Fpbl9tb29kJzpcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmdhaW5Nb29kKG91dGNvbWUudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbG9zZV9tb29kJzpcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmxvc2VNb29kKG91dGNvbWUudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbWVzc2FnZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHVEODNEXHVEQ0RDICR7b3V0Y29tZS50ZXh0fWAsIDYwMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi51aSkgdGhpcy5wbHVnaW4udWkuc2V0Q2hhdFRleHQob3V0Y29tZS50ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUHJvZ3Jlc3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkNsb3NlKCkgeyB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpOyB9XHJcbn0iLCAiaW1wb3J0IHsgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZUVuZ2luZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihwbHVnaW4pIHtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKSB7IHJldHVybiB0aGlzLnBsdWdpbi5zdGF0ZTsgfVxyXG5cclxuICAgIGdldEVmZmVjdGl2ZVN0YXRzKCkge1xyXG4gICAgICAgIGNvbnN0IGJhc2VTdGF0cyA9IHRoaXMuc3RhdGUuc3RhdHMgfHwgeyBTOiAwLCBQOiAwLCBFOiAwLCBDOiAwLCBJOiAwLCBBOiAwLCBMOiAwIH07XHJcbiAgICAgICAgY29uc3QgZWZmZWN0aXZlU3RhdHMgPSB7IC4uLmJhc2VTdGF0cyB9O1xyXG4gICAgICAgIGNvbnN0IGVxdWlwbWVudCA9IHRoaXMuc3RhdGUuZXF1aXBtZW50IHx8IHt9O1xyXG5cclxuICAgICAgICAvLyBcdTA0MjJcdTA0MzVcdTA0M0ZcdTA0MzVcdTA0NDBcdTA0NEMgXHUwNDMxXHUwNDM1XHUwNDQwXHUwNDM1XHUwNDNDIFx1MDQ0MVx1MDQ0Mlx1MDQzMFx1MDQ0Mlx1MDQ0QiBcdTA0M0ZcdTA0NDBcdTA0MzVcdTA0MzRcdTA0M0NcdTA0MzVcdTA0NDJcdTA0M0VcdTA0MzIgXHUwNDM4XHUwNDM3IFx1MDQzM1x1MDQzQlx1MDQzRVx1MDQzMVx1MDQzMFx1MDQzQlx1MDQ0Q1x1MDQzRFx1MDQzRVx1MDQzOSBcdTA0MzFcdTA0MzBcdTA0MzdcdTA0NEIhXHJcbiAgICAgICAgZm9yIChjb25zdCBzbG90SWQgaW4gZXF1aXBtZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1JZCA9IGVxdWlwbWVudFtzbG90SWRdO1xyXG4gICAgICAgICAgICBpZiAoaXRlbUlkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtRGF0YSA9IHRoaXMucGx1Z2luLml0ZW1zRGF0YWJhc2UuZ2V0KGl0ZW1JZCk7IC8vIFx1MDQxOFx1MDQxN1x1MDQxQ1x1MDQxNVx1MDQxRFx1MDQxNVx1MDQxRFx1MDQxRVxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1EYXRhICYmIGl0ZW1EYXRhLmJvbnVzX3N0YXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbc3RhdCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGl0ZW1EYXRhLmJvbnVzX3N0YXRzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3RpdmVTdGF0c1tzdGF0XSA9IChlZmZlY3RpdmVTdGF0c1tzdGF0XSB8fCAwKSArIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyBiYXNlOiBiYXNlU3RhdHMsIGVmZmVjdGl2ZTogZWZmZWN0aXZlU3RhdHMgfTtcclxuICAgIH1cclxuICAgIC8vIFx1MDQxNFx1MDQzOFx1MDQzRFx1MDQzMFx1MDQzQ1x1MDQzOFx1MDQ0N1x1MDQzNVx1MDQ0MVx1MDQzQVx1MDQzOFx1MDQzOSBcdTA0M0ZcdTA0MzVcdTA0NDBcdTA0MzVcdTA0NDFcdTA0NDdcdTA0MzVcdTA0NDIgXHUwNDI1XHUwNDFGIChcdTA0MzJcdTA0NEJcdTA0MzdcdTA0NEJcdTA0MzJcdTA0MzBcdTA0MzVcdTA0NDJcdTA0NDFcdTA0NEYgXHUwNDNGXHUwNDQwXHUwNDM4IFx1MDQ0MVx1MDQzQ1x1MDQzNVx1MDQzRFx1MDQzNSBcdTA0NDFcdTA0NDJcdTA0MzBcdTA0NDJcdTA0M0VcdTA0MzIgXHUwNDM4XHUwNDNCXHUwNDM4IFx1MDQ0RFx1MDQzQVx1MDQzOFx1MDQzRlx1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzQVx1MDQzOClcclxuICAgIHJlY2FsY3VsYXRlTWF4SHAoKSB7XHJcbiAgICAgICAgY29uc3QgYmFzZUhwID0gdGhpcy5wbHVnaW4uY3VycmVudENvbXBhbmlvbj8ubWF4SHAgfHwgMTAwO1xyXG4gICAgICAgIGNvbnN0IGVmZlN0YXRzID0gdGhpcy5nZXRFZmZlY3RpdmVTdGF0cygpLmVmZmVjdGl2ZTtcclxuICAgICAgICBjb25zdCBzdHJlbmd0aEJvbnVzID0gKGVmZlN0YXRzWydTJ10gfHwgMCkgKiA1O1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlLm1heEhwID0gYmFzZUhwICsgc3RyZW5ndGhCb251cztcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ocCA+IHRoaXMuc3RhdGUubWF4SHApIHRoaXMuc3RhdGUuaHAgPSB0aGlzLnN0YXRlLm1heEhwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVtb3Rpb24oKSB7XHJcbiAgICAgICAgY29uc3QgYyA9IHRoaXMucGx1Z2luLmN1cnJlbnRDb21wYW5pb247XHJcbiAgICAgICAgY29uc3QgY3VycmVudE1vb2QgPSB0aGlzLnN0YXRlLm1vb2QgfHwgMDtcclxuICAgICAgICBjb25zdCBkZWZhdWx0UGhyYXNlcyA9IGM/LnBocmFzZXMgfHwgeyB0YXNrX2RvbmU6IFtcIlx1MDQxMlx1MDQ0Qlx1MDQzRlx1MDQzRVx1MDQzQlx1MDQzRFx1MDQzNVx1MDQzRFx1MDQzRSFcIl0sIHRhc2tfdW5kb25lOiBcIlx1MDQxRVx1MDQ0Mlx1MDQzQ1x1MDQzNVx1MDQzRFx1MDQzNVx1MDQzRFx1MDQzRS5cIiwgbGV2ZWxfdXA6IFwiXHUwNDFEXHUwNDNFXHUwNDMyXHUwNDRCXHUwNDM5IFx1MDQ0M1x1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzNVx1MDQzRFx1MDQ0QyFcIiwgZGVhdGg6IFwiXHUwNDEyXHUwNDRCIFx1MDQzRlx1MDQzRVx1MDQzM1x1MDQzOFx1MDQzMVx1MDQzQlx1MDQzOC5cIiB9O1xyXG4gICAgICAgIGlmICghYyB8fCAhYy5lbW90aW9ucyB8fCBjLmVtb3Rpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHsgcGhyYXNlczogZGVmYXVsdFBocmFzZXMsIGF2YXRhcl90ZXh0OiBjPy5hdmF0YXJfdGV4dCB8fCBcIlx1RDgzRFx1REM2NFwiIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHNvcnRlZCA9IFsuLi5jLmVtb3Rpb25zXS5zb3J0KChhLCBiKSA9PiBiLnRocmVzaG9sZCAtIGEudGhyZXNob2xkKTtcclxuICAgICAgICBmb3IgKGxldCBlbW90aW9uIG9mIHNvcnRlZCkge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudE1vb2QgPj0gZW1vdGlvbi50aHJlc2hvbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghZW1vdGlvbi5waHJhc2VzKSBlbW90aW9uLnBocmFzZXMgPSBkZWZhdWx0UGhyYXNlcztcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbW90aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxhc3QgPSBzb3J0ZWRbc29ydGVkLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGlmICghbGFzdC5waHJhc2VzKSBsYXN0LnBocmFzZXMgPSBkZWZhdWx0UGhyYXNlcztcclxuICAgICAgICByZXR1cm4gbGFzdDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnYWluTW9vZChhbW91bnQpIHsgdGhpcy5zdGF0ZS5tb29kID0gTWF0aC5taW4oMTAwLCAodGhpcy5zdGF0ZS5tb29kIHx8IDApICsgYW1vdW50KTsgfVxyXG4gICAgYXN5bmMgbG9zZU1vb2QoYW1vdW50KSB7IHRoaXMuc3RhdGUubW9vZCA9IE1hdGgubWF4KDAsICh0aGlzLnN0YXRlLm1vb2QgfHwgMCkgLSBhbW91bnQpOyB9XHJcblxyXG4gICAgYXN5bmMgcmVjb3JkVGFza0NvbXBsZXRpb24oaXNDb21wbGV0ZWQsIHRhc2tUZXh0ID0gXCJcIikge1xyXG4gICAgICAgIGNvbnN0IHRvZGF5ID0gd2luZG93Lm1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xyXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW4uZGF0YS5oaXN0b3J5W3RvZGF5XSkgdGhpcy5wbHVnaW4uZGF0YS5oaXN0b3J5W3RvZGF5XSA9IDA7XHJcblxyXG4gICAgICAgIGxldCB4cFJld2FyZCA9IDI1OyBsZXQgY29pblJld2FyZCA9IDU7XHJcbiAgICAgICAgY29uc3QgbW9kaWZpZXJzID0gdGhpcy5wbHVnaW4uY3VycmVudFVuaXZlcnNlPy5tb2RpZmllcnMgfHwge307XHJcbiAgICAgICAgZm9yIChjb25zdCBbdGFnLCBtdWx0c10gb2YgT2JqZWN0LmVudHJpZXMobW9kaWZpZXJzKSkge1xyXG4gICAgICAgICAgICBpZiAodGFza1RleHQuaW5jbHVkZXModGFnKSkgeyB4cFJld2FyZCA9IE1hdGgucm91bmQoeHBSZXdhcmQgKiBtdWx0cy54cCk7IGNvaW5SZXdhcmQgPSBNYXRoLnJvdW5kKGNvaW5SZXdhcmQgKiBtdWx0cy5jb2lucyk7IGJyZWFrOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZ2FpbmVkU3RhdCA9IG51bGw7XHJcbiAgICAgICAgY29uc3QgdGFncyA9IHRhc2tUZXh0Lm1hdGNoKC8jW2EtekEtWlx1MDQzMC1cdTA0NEZcdTA0MTAtXHUwNDJGXHUwNDUxXHUwNDAxXzAtOV0rL2cpIHx8IFtdO1xyXG4gICAgICAgIGNvbnN0IHNwZWNpYWxLZXlzID0gWydTJywgJ1AnLCAnRScsICdDJywgJ0knLCAnQScsICdMJ107XHJcblxyXG4gICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0YWcgb2YgdGFncykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RMZXR0ZXIgPSB0YWcuY2hhckF0KDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNwZWNpYWxLZXlzLmluY2x1ZGVzKGZpcnN0TGV0dGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFx1MDQxQVx1MDQzMFx1MDQzRlx1MDQ0QiBcdTA0NDJcdTA0MzVcdTA0M0ZcdTA0MzVcdTA0NDBcdTA0NEMgXHUwNDQwXHUwNDMwXHUwNDMxXHUwNDNFXHUwNDQyXHUwNDMwXHUwNDRFXHUwNDQyIFx1MDQ0Mlx1MDQzRVx1MDQzQlx1MDQ0Q1x1MDQzQVx1MDQzRSBcdTA0MzRcdTA0M0JcdTA0NEYgXHUwNDExXHUwNDEwXHUwNDE3XHUwNDFFXHUwNDEyXHUwNDJCXHUwNDI1IFx1MDQ0MVx1MDQ0Mlx1MDQzMFx1MDQ0Mlx1MDQzRVx1MDQzMiAoXHUwNDMyXHUwNDM1XHUwNDQ5XHUwNDMwXHUwNDNDXHUwNDM4IFx1MDQzQ1x1MDQzRVx1MDQzNlx1MDQzRFx1MDQzRSBcdTA0M0ZcdTA0NDBcdTA0M0VcdTA0MzFcdTA0MzhcdTA0NDJcdTA0NEMgXHUwNDNCXHUwNDM4XHUwNDNDXHUwNDM4XHUwNDQyISlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RMZXR0ZXIgPT09ICdDJyAmJiB0aGlzLnN0YXRlLnN0YXRzWydDJ10gPj0gMjUpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdExldHRlciA9PT0gJ0EnICYmIHRoaXMuc3RhdGUuc3RhdHNbJ0EnXSA+PSAzNSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5zdGF0c1tmaXJzdExldHRlcl0rKzsgZ2FpbmVkU3RhdCA9IGZpcnN0TGV0dGVyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRhZyBvZiB0YWdzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdExldHRlciA9IHRhZy5jaGFyQXQoMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BlY2lhbEtleXMuaW5jbHVkZXMoZmlyc3RMZXR0ZXIpKSB7IHRoaXMuc3RhdGUuc3RhdHNbZmlyc3RMZXR0ZXJdID0gTWF0aC5tYXgoMCwgdGhpcy5zdGF0ZS5zdGF0c1tmaXJzdExldHRlcl0gLSAxKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZU1heEhwKCk7IC8vIFx1MDQxRVx1MDQzMVx1MDQzRFx1MDQzRVx1MDQzMlx1MDQzQlx1MDQ0Rlx1MDQzNVx1MDQzQyBcdTA0MjVcdTA0MUYgXHUwNDNGXHUwNDNFXHUwNDQxXHUwNDNCXHUwNDM1IFx1MDQzOFx1MDQzN1x1MDQzQ1x1MDQzNVx1MDQzRFx1MDQzNVx1MDQzRFx1MDQzOFx1MDQ0RiBcdTA0NDFcdTA0NDJcdTA0MzBcdTA0NDJcdTA0M0VcdTA0MzJcclxuICAgICAgICBjb25zdCBlZmZTdGF0cyA9IHRoaXMuZ2V0RWZmZWN0aXZlU3RhdHMoKS5lZmZlY3RpdmU7IC8vIFx1MDQxMVx1MDQzNVx1MDQ0MFx1MDQzNVx1MDQzQyBcdTA0NDFcdTA0NDJcdTA0MzBcdTA0NDJcdTA0NEIgXHUwNDQxIFx1MDQ0M1x1MDQ0N1x1MDQzNVx1MDQ0Mlx1MDQzRVx1MDQzQyBcdTA0MzJcdTA0MzVcdTA0NDlcdTA0MzVcdTA0MzkhXHJcblxyXG4gICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLmhpc3RvcnlbdG9kYXldKys7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZ2Fpbk1vb2QoMik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpQm9udXMgPSAxICsgKChlZmZTdGF0c1snSSddIHx8IDApICogMC4wMik7XHJcbiAgICAgICAgICAgIGNvbnN0IHBCb251cyA9IDEgKyAoKGVmZlN0YXRzWydQJ10gfHwgMCkgKiAwLjAyKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5nYWluWFAoTWF0aC5yb3VuZCh4cFJld2FyZCAqIGlCb251cykpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmdhaW5Db2lucyhNYXRoLnJvdW5kKGNvaW5SZXdhcmQgKiBwQm9udXMpKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsdWNrQ2hhbmNlID0gZWZmU3RhdHNbJ0wnXSB8fCAwOyBsZXQgaXRlbXNUb0dpdmUgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gLS0tIFx1MDQyMVx1MDQxQlx1MDQyM1x1MDQyN1x1MDQxMFx1MDQxOVx1MDQxRFx1MDQyQlx1MDQxNSBcdTA0MjFcdTA0MUVcdTA0MTFcdTA0MkJcdTA0MjJcdTA0MThcdTA0MkYgKFJBTkRPTSBFTkNPVU5URVJTKSAtLS1cclxuICAgICAgICAgICAgY29uc3QgZW5jb3VudGVycyA9IHRoaXMucGx1Z2luLmN1cnJlbnRVbml2ZXJzZT8uZW5jb3VudGVycyB8fCBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFx1MDQyOFx1MDQzMFx1MDQzRFx1MDQ0MSBcdTA0NDFcdTA0M0VcdTA0MzFcdTA0NEJcdTA0NDJcdTA0MzhcdTA0NEY6IFx1MDQzMVx1MDQzMFx1MDQzN1x1MDQzRVx1MDQzMlx1MDQ0Qlx1MDQzNSA1JVxyXG4gICAgICAgICAgICBjb25zdCBFTkNPVU5URVJfQ0hBTkNFID0gNTtcclxuXHJcbiAgICAgICAgICAgIGlmIChlbmNvdW50ZXJzLmxlbmd0aCA+IDAgJiYgTWF0aC5yYW5kb20oKSAqIDEwMCA8IEVOQ09VTlRFUl9DSEFOQ0UpIHtcclxuICAgICAgICAgICAgICAgIC8vIFx1MDQxMlx1MDQ0Qlx1MDQzMVx1MDQzOFx1MDQ0MFx1MDQzMFx1MDQzNVx1MDQzQyBcdTA0NDFcdTA0M0JcdTA0NDNcdTA0NDdcdTA0MzBcdTA0MzlcdTA0M0RcdTA0M0VcdTA0MzUgXHUwNDQxXHUwNDNFXHUwNDMxXHUwNDRCXHUwNDQyXHUwNDM4XHUwNDM1XHJcbiAgICAgICAgICAgICAgICBjb25zdCByYW5kb21FbmNvdW50ZXIgPSBlbmNvdW50ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGVuY291bnRlcnMubGVuZ3RoKV07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gXHUwNDFGXHUwNDQwXHUwNDNFXHUwNDQxXHUwNDM4XHUwNDNDIFx1MDQyRlx1MDQzNFx1MDQ0MFx1MDQzRSBcdTA0M0ZcdTA0M0VcdTA0M0FcdTA0MzBcdTA0MzdcdTA0MzBcdTA0NDJcdTA0NEMgXHUwNDNDXHUwNDNFXHUwNDM0XHUwNDMwXHUwNDNCXHUwNDNBXHUwNDQzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi50cmlnZ2VyRW5jb3VudGVyKHJhbmRvbUVuY291bnRlcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChsdWNrQ2hhbmNlID49IDEwMCkgeyBpdGVtc1RvR2l2ZSsrOyBsdWNrQ2hhbmNlIC09IDEwMDsgfVxyXG4gICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSAqIDEwMCA8IGx1Y2tDaGFuY2UpIGl0ZW1zVG9HaXZlKys7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzaG9wSXRlbXMgPSB0aGlzLnBsdWdpbi5jdXJyZW50VW5pdmVyc2U/Lml0ZW1zIHx8IFtdO1xyXG4gICAgICAgICAgICBpZiAoaXRlbXNUb0dpdmUgPiAwICYmIHNob3BJdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zVG9HaXZlOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5kb21JdGVtID0gc2hvcEl0ZW1zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNob3BJdGVtcy5sZW5ndGgpXTtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5pbnZlbnRvcnkuYWRkVG9JbnZlbnRvcnkocmFuZG9tSXRlbS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHVEODNDXHVERjQwIFx1MDQyM1x1MDQzNFx1MDQzMFx1MDQ0N1x1MDQzMCEgXHUwNDEyXHUwNDRCIFx1MDQzRFx1MDQzMFx1MDQ0OFx1MDQzQlx1MDQzODogJHtyYW5kb21JdGVtLm5hbWV9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGVtb3Rpb24gPSB0aGlzLmdldEVtb3Rpb24oKTtcclxuICAgICAgICAgICAgaWYgKGdhaW5lZFN0YXQgJiYgdGhpcy5wbHVnaW4udWkpIHRoaXMucGx1Z2luLnVpLnNldENoYXRUZXh0KGBcdTA0MjJcdTA0MzJcdTA0M0VcdTA0NEYgXHUwNDQ1XHUwNDMwXHUwNDQwXHUwNDMwXHUwNDNBXHUwNDQyXHUwNDM1XHUwNDQwXHUwNDM4XHUwNDQxXHUwNDQyXHUwNDM4XHUwNDNBXHUwNDMwIFske2dhaW5lZFN0YXR9XSBcdTA0MzJcdTA0M0VcdTA0MzdcdTA0NDBcdTA0MzBcdTA0NDFcdTA0NDJcdTA0MzBcdTA0MzVcdTA0NDIhYCk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRhc2tUZXh0LmluY2x1ZGVzKCcjYm9zcycpICYmIHRoaXMucGx1Z2luLnVpKSB0aGlzLnBsdWdpbi51aS5zZXRDaGF0VGV4dChcIlx1MDQyRFx1MDQzRlx1MDQzOFx1MDQ0N1x1MDQzRFx1MDQzMFx1MDQ0RiBcdTA0MzFcdTA0MzhcdTA0NDJcdTA0MzJcdTA0MzAhIFx1MDQxMlx1MDQ0MFx1MDQzMFx1MDQzMyBcdTA0M0ZcdTA0M0VcdTA0MzJcdTA0MzVcdTA0NDBcdTA0MzZcdTA0MzVcdTA0M0QhXCIpO1xyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLnBsdWdpbi51aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGhyYXNlc0xpc3QgPSBlbW90aW9uLnBocmFzZXM/LnRhc2tfZG9uZSB8fCBbXCJcdTA0MTJcdTA0NEJcdTA0M0ZcdTA0M0VcdTA0M0JcdTA0M0RcdTA0MzVcdTA0M0RcdTA0M0UhXCJdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4udWkuc2V0Q2hhdFRleHQocGhyYXNlc0xpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGhyYXNlc0xpc3QubGVuZ3RoKV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5oaXN0b3J5W3RvZGF5XSA9IE1hdGgubWF4KDAsIHRoaXMucGx1Z2luLmRhdGEuaGlzdG9yeVt0b2RheV0gLSAxKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5sb3NlWFAoeHBSZXdhcmQpOyBhd2FpdCB0aGlzLmxvc2VDb2lucyhjb2luUmV3YXJkKTsgYXdhaXQgdGhpcy5sb3NlTW9vZCgxMCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi51aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZW1vdGlvbiA9IHRoaXMuZ2V0RW1vdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4udWkuc2V0Q2hhdFRleHQoZW1vdGlvbi5waHJhc2VzPy50YXNrX3VuZG9uZSB8fCBcIlx1MDQxRVx1MDQ0Mlx1MDQzQ1x1MDQzNVx1MDQzRFx1MDQzNVx1MDQzRFx1MDQzRS5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVByb2dyZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY2hlY2tEYWlseURhbWFnZSgpIHtcclxuICAgICAgICBjb25zdCB0b2RheVN0ciA9IHdpbmRvdy5tb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sYXN0Q2hlY2tlZERhdGUgPT09IHRvZGF5U3RyKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBwZW5hbHRpZXMgPSB0aGlzLnBsdWdpbi5jdXJyZW50VW5pdmVyc2U/LnBlbmFsdGllcyB8fCB7IGRhaWx5X2hwX2xvc3M6IDUsIGRlYXRoX3hwX2xvc3NfcGN0OiAxMCwgZGVhdGhfZ29sZF9sb3NzX3BjdDogMTAgfTtcclxuICAgICAgICBsZXQgY2hlY2tEYXRlID0gd2luZG93Lm1vbWVudCh0aGlzLnN0YXRlLmxhc3RDaGVja2VkRGF0ZSkuYWRkKDEsICdkYXlzJyk7XHJcbiAgICAgICAgbGV0IGRhbWFnZVRvVGFrZSA9IDA7IGxldCBtaXNzZWREYXlzID0gMDtcclxuXHJcbiAgICAgICAgY29uc3QgZWZmU3RhdHMgPSB0aGlzLmdldEVmZmVjdGl2ZVN0YXRzKCkuZWZmZWN0aXZlOyAvLyBcdTA0MjFcdTA0NDdcdTA0MzhcdTA0NDJcdTA0MzBcdTA0MzVcdTA0M0MgXHUwNDEyXHUwNDRCXHUwNDNEXHUwNDNFXHUwNDQxXHUwNDNCXHUwNDM4XHUwNDMyXHUwNDNFXHUwNDQxXHUwNDQyXHUwNDRDIFx1MDQ0MSBcdTA0NDNcdTA0NDdcdTA0MzVcdTA0NDJcdTA0M0VcdTA0M0MgXHUwNDQ4XHUwNDNDXHUwNDNFXHUwNDQyXHUwNDMwXHJcbiAgICAgICAgbGV0IGRhaWx5TG9zcyA9IE1hdGgubWF4KDEsIHBlbmFsdGllcy5kYWlseV9ocF9sb3NzIC0gKGVmZlN0YXRzWydFJ10gfHwgMCkpO1xyXG5cclxuICAgICAgICB3aGlsZSAoY2hlY2tEYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpIDwgdG9kYXlTdHIpIHtcclxuICAgICAgICAgICAgY29uc3QgZFN0ciA9IGNoZWNrRGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsdWdpbi5kYXRhLmhpc3Rvcnk/LltkU3RyXSB8fCB0aGlzLnBsdWdpbi5kYXRhLmhpc3RvcnlbZFN0cl0gPT09IDApIHsgZGFtYWdlVG9UYWtlICs9IGRhaWx5TG9zczsgbWlzc2VkRGF5cysrOyBhd2FpdCB0aGlzLmxvc2VNb29kKDIwKTsgfVxyXG4gICAgICAgICAgICBjaGVja0RhdGUuYWRkKDEsICdkYXlzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhdGUubGFzdENoZWNrZWREYXRlID0gdG9kYXlTdHI7XHJcblxyXG4gICAgICAgIGlmIChkYW1hZ2VUb1Rha2UgPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRvZGdlQ2hhbmNlID0gTWF0aC5taW4oNzAsIChlZmZTdGF0c1snQSddIHx8IDApICogMik7IC8vIFx1MDQyMVx1MDQ0N1x1MDQzOFx1MDQ0Mlx1MDQzMFx1MDQzNVx1MDQzQyBcdTA0MUJcdTA0M0VcdTA0MzJcdTA0M0FcdTA0M0VcdTA0NDFcdTA0NDJcdTA0NEMgXHUwNDNFXHUwNDQyIFx1MDQ0OFx1MDQzQ1x1MDQzRVx1MDQ0Mlx1MDQzMFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSAqIDEwMCA8IGRvZGdlQ2hhbmNlKSBuZXcgTm90aWNlKGBcdUQ4M0NcdURGQzMgXHUwNDEyXHUwNDRCIFx1MDQzRlx1MDQ0MFx1MDQzRVx1MDQzRlx1MDQ0M1x1MDQ0MVx1MDQ0Mlx1MDQzOFx1MDQzQlx1MDQzOCAke21pc3NlZERheXN9IFx1MDQzNFx1MDQzRFx1MDQzNVx1MDQzOSwgXHUwNDNEXHUwNDNFIFx1MDQxQlx1MDQzRVx1MDQzMlx1MDQzQVx1MDQzRVx1MDQ0MVx1MDQ0Mlx1MDQ0QyBcdTA0M0ZcdTA0M0VcdTA0M0NcdTA0M0VcdTA0MzNcdTA0M0JcdTA0MzAgXHUwNDM4XHUwNDM3XHUwNDMxXHUwNDM1XHUwNDM2XHUwNDMwXHUwNDQyXHUwNDRDIFx1MDQ0M1x1MDQ0MFx1MDQzRVx1MDQzRFx1MDQzMCFgKTtcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmhwIC09IGRhbWFnZVRvVGFrZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmhwIDw9IDApIGF3YWl0IHRoaXMuZGllKHBlbmFsdGllcyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIG5ldyBOb3RpY2UoYFx1MDQxMlx1MDQ0QiBcdTA0M0ZcdTA0NDBcdTA0M0VcdTA0M0ZcdTA0NDNcdTA0NDFcdTA0NDJcdTA0MzhcdTA0M0JcdTA0MzggJHttaXNzZWREYXlzfSBcdTA0MzRcdTA0M0RcdTA0MzVcdTA0MzkuIFx1MDQxRlx1MDQzRVx1MDQ0Mlx1MDQzNVx1MDQ0MFx1MDQ0Rlx1MDQzRFx1MDQzRSAke2RhbWFnZVRvVGFrZX0gSFAhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVByb2dyZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGllKHBlbmFsdGllcykge1xyXG4gICAgICAgIGNvbnN0IHhwTG9zcyA9IE1hdGguZmxvb3IodGhpcy5zdGF0ZS54cCAqIChwZW5hbHRpZXMuZGVhdGhfeHBfbG9zc19wY3QgLyAxMDApKTsgY29uc3QgZ29sZExvc3MgPSBNYXRoLmZsb29yKHRoaXMuc3RhdGUuY29pbnMgKiAocGVuYWx0aWVzLmRlYXRoX2dvbGRfbG9zc19wY3QgLyAxMDApKTtcclxuICAgICAgICB0aGlzLnN0YXRlLnhwID0gTWF0aC5tYXgoMCwgdGhpcy5zdGF0ZS54cCAtIHhwTG9zcyk7IHRoaXMuc3RhdGUuY29pbnMgPSBNYXRoLm1heCgwLCB0aGlzLnN0YXRlLmNvaW5zIC0gZ29sZExvc3MpOyB0aGlzLnN0YXRlLmhwID0gdGhpcy5zdGF0ZS5tYXhIcDtcclxuICAgICAgICBjb25zdCBlbW90aW9uID0gdGhpcy5nZXRFbW90aW9uKCk7IGNvbnN0IGRlYXRoTXNnID0gZW1vdGlvbi5waHJhc2VzPy5kZWF0aCB8fCBcIlx1MDQxMlx1MDQ0QiBcdTA0M0ZcdTA0M0VcdTA0MzNcdTA0MzhcdTA0MzFcdTA0M0JcdTA0MzggXHUwNDNFXHUwNDQyIFx1MDQzOFx1MDQ0MVx1MDQ0Mlx1MDQzRVx1MDQ0OVx1MDQzNVx1MDQzRFx1MDQzOFx1MDQ0RiBcdTA0NDFcdTA0MzhcdTA0M0IuXCI7XHJcbiAgICAgICAgbmV3IE5vdGljZShgXHVEODNEXHVEQzgwIFx1MDQxMlx1MDQyQiBcdTA0MjNcdTA0MUNcdTA0MTVcdTA0MjBcdTA0MUJcdTA0MTghXFxuXHUwNDFGXHUwNDNFXHUwNDQyXHUwNDM1XHUwNDQwXHUwNDRGXHUwNDNEXHUwNDNFIFhQOiAke3hwTG9zc30sIFx1MDQxN1x1MDQzRVx1MDQzQlx1MDQzRVx1MDQ0Mlx1MDQzMDogJHtnb2xkTG9zc31gKTtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW4udWkpIHRoaXMucGx1Z2luLnVpLnNldENoYXRUZXh0KGRlYXRoTXNnKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnYWluWFAoYW1vdW50KSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZS54cCArPSBhbW91bnQ7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUueHAgPj0gdGhpcy5zdGF0ZS54cFRvTmV4dExldmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubGV2ZWwrKzsgdGhpcy5zdGF0ZS54cCAtPSB0aGlzLnN0YXRlLnhwVG9OZXh0TGV2ZWw7IHRoaXMuc3RhdGUueHBUb05leHRMZXZlbCArPSA1MDA7IHRoaXMuc3RhdGUuaHAgPSB0aGlzLnN0YXRlLm1heEhwO1xyXG4gICAgICAgICAgICBjb25zdCBlbW90aW9uID0gdGhpcy5nZXRFbW90aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi51aSAmJiBlbW90aW9uLnBocmFzZXM/LmxldmVsX3VwKSB0aGlzLnBsdWdpbi51aS5zZXRDaGF0VGV4dChlbW90aW9uLnBocmFzZXMubGV2ZWxfdXAucmVwbGFjZSgne2xldmVsfScsIHRoaXMuc3RhdGUubGV2ZWwpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3luYyBnYWluQ29pbnMoYW1vdW50KSB7IHRoaXMuc3RhdGUuY29pbnMgKz0gYW1vdW50OyB9XHJcbiAgICBhc3luYyBsb3NlWFAoYW1vdW50KSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZS54cCAtPSBhbW91bnQ7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUueHAgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmxldmVsID4gMSkgeyB0aGlzLnN0YXRlLmxldmVsLS07IHRoaXMuc3RhdGUueHBUb05leHRMZXZlbCA9IE1hdGgubWF4KDEwMDAsIHRoaXMuc3RhdGUueHBUb05leHRMZXZlbCAtIDUwMCk7IHRoaXMuc3RhdGUueHAgPSB0aGlzLnN0YXRlLnhwVG9OZXh0TGV2ZWwgKyB0aGlzLnN0YXRlLnhwOyB9XHJcbiAgICAgICAgICAgIGVsc2UgeyB0aGlzLnN0YXRlLnhwID0gMDsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIGxvc2VDb2lucyhhbW91bnQpIHsgdGhpcy5zdGF0ZS5jb2lucyA9IE1hdGgubWF4KDAsIHRoaXMuc3RhdGUuY29pbnMgLSBhbW91bnQpOyB9XHJcbn0iLCAiaW1wb3J0IHsgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW52ZW50b3J5TWFuYWdlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihwbHVnaW4pIHtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKSB7IHJldHVybiB0aGlzLnBsdWdpbi5zdGF0ZTsgfVxyXG5cclxuICAgIGFzeW5jIGVxdWlwSXRlbShzbG90SWQsIGl0ZW1JZCkge1xyXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5lcXVpcG1lbnQpIHRoaXMuc3RhdGUuZXF1aXBtZW50ID0geyBoZWFkOiBudWxsLCBib2R5OiBudWxsLCB3ZWFwb246IG51bGwsIGFjY2Vzc29yeTogbnVsbCB9O1xyXG4gICAgICAgIHRoaXMuc3RhdGUuZXF1aXBtZW50W3Nsb3RJZF0gPSBpdGVtSWQ7XHJcbiAgICAgICAgdGhpcy5wbHVnaW4uZ2FtZS5yZWNhbGN1bGF0ZU1heEhwKCk7IFxyXG4gICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQcm9ncmVzcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFx1MDQxRlx1MDQzRVx1MDQzQlx1MDQ0M1x1MDQ0N1x1MDQzMFx1MDQzNVx1MDQzQyBcdTA0M0ZcdTA0NDBcdTA0MzVcdTA0MzRcdTA0M0NcdTA0MzVcdTA0NDIgXHUwNDM4XHUwNDM3IFx1MDQxMVx1MDQxNCBcdTA0MzggXHUwNDNGXHUwNDM4XHUwNDQ4XHUwNDM1XHUwNDNDIFx1MDQ0M1x1MDQzRFx1MDQzOFx1MDQzQVx1MDQzMFx1MDQzQlx1MDQ0Q1x1MDQzRFx1MDQ0M1x1MDQ0RSBcdTA0NDRcdTA0NDBcdTA0MzBcdTA0MzdcdTA0NDMsIFx1MDQzQlx1MDQzOFx1MDQzMVx1MDQzRSBcdTA0MzRcdTA0MzVcdTA0NDRcdTA0M0VcdTA0M0JcdTA0NDJcdTA0M0RcdTA0NDNcdTA0NEVcclxuICAgICAgICBjb25zdCBpdGVtRGF0YSA9IHRoaXMucGx1Z2luLml0ZW1zRGF0YWJhc2UuZ2V0KGl0ZW1JZCk7XHJcbiAgICAgICAgY29uc3QgcGhyYXNlID0gaXRlbURhdGE/LnVzZV9waHJhc2UgfHwgYFx1MDQyMlx1MDQ0QiBcdTA0M0RcdTA0MzBcdTA0MzRcdTA0MzVcdTA0M0I6ICR7aXRlbURhdGE/Lm5hbWUgfHwgJ1x1MDQxRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzQ1x1MDQzNVx1MDQ0Mid9YDtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW4udWkpIHRoaXMucGx1Z2luLnVpLnNldENoYXRUZXh0KHBocmFzZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbmV3IE5vdGljZShcIlx1MDQxRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzQ1x1MDQzNVx1MDQ0MiBcdTA0M0RcdTA0MzBcdTA0MzRcdTA0MzVcdTA0NDIhXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHVuZXF1aXBJdGVtKHNsb3RJZCkge1xyXG4gICAgICAgIGNvbnN0IGl0ZW1JZCA9IHRoaXMuc3RhdGUuZXF1aXBtZW50ID8gdGhpcy5zdGF0ZS5lcXVpcG1lbnRbc2xvdElkXSA6IG51bGw7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXF1aXBtZW50KSB0aGlzLnN0YXRlLmVxdWlwbWVudFtzbG90SWRdID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBsdWdpbi5nYW1lLnJlY2FsY3VsYXRlTWF4SHAoKTsgXHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gXHUwNDFDXHUwNDNFXHUwNDM2XHUwNDM1XHUwNDNDIFx1MDQzNFx1MDQzRVx1MDQzMVx1MDQzMFx1MDQzMlx1MDQzOFx1MDQ0Mlx1MDQ0QyBcdTA0NDRcdTA0NDBcdTA0MzBcdTA0MzdcdTA0NDMgXHUwNDNGXHUwNDQwXHUwNDM4IFx1MDQ0MVx1MDQzRFx1MDQ0Rlx1MDQ0Mlx1MDQzOFx1MDQzOCAoXHUwNDNGXHUwNDQwXHUwNDNFXHUwNDQxXHUwNDQyXHUwNDNFIFx1MDQzNFx1MDQzNVx1MDQ0NFx1MDQzRVx1MDQzQlx1MDQ0Mlx1MDQzRFx1MDQ0M1x1MDQ0RSlcclxuICAgICAgICBjb25zdCBpdGVtRGF0YSA9IGl0ZW1JZCA/IHRoaXMucGx1Z2luLml0ZW1zRGF0YWJhc2UuZ2V0KGl0ZW1JZCkgOiBudWxsO1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbi51aSAmJiBpdGVtRGF0YSkgdGhpcy5wbHVnaW4udWkuc2V0Q2hhdFRleHQoYFx1MDQyMlx1MDQ0QiBcdTA0NDFcdTA0M0RcdTA0NEZcdTA0M0I6ICR7aXRlbURhdGEubmFtZX0uYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbmV3IE5vdGljZShcIlx1MDQxRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzQ1x1MDQzNVx1MDQ0MiBcdTA0NDFcdTA0M0RcdTA0NEZcdTA0NDIhXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGFkZFRvSW52ZW50b3J5KGl0ZW1JZCkge1xyXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5pbnZlbnRvcnkpIHRoaXMuc3RhdGUuaW52ZW50b3J5ID0gW107XHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnN0YXRlLmludmVudG9yeS5maW5kKGkgPT4gaS5pZCA9PT0gaXRlbUlkKTtcclxuICAgICAgICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnF1YW50aXR5Kys7XHJcbiAgICAgICAgZWxzZSB0aGlzLnN0YXRlLmludmVudG9yeS5wdXNoKHsgaWQ6IGl0ZW1JZCwgcXVhbnRpdHk6IDEgfSk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVByb2dyZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdXNlSXRlbShpdGVtSWQsIGl0ZW1EYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmludmVudG9yeSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5zdGF0ZS5pbnZlbnRvcnkuZmluZChpID0+IGkuaWQgPT09IGl0ZW1JZCk7XHJcbiAgICAgICAgaWYgKCFleGlzdGluZyB8fCBleGlzdGluZy5xdWFudGl0eSA8PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFx1MDQxNVx1MDQ0MVx1MDQzQlx1MDQzOCBcdTA0NERcdTA0NDJcdTA0M0UgXHUwNDNCXHUwNDQzXHUwNDQyXHUwNDMxXHUwNDNFXHUwNDNBXHUwNDQxXHJcbiAgICAgICAgaWYgKGl0ZW1EYXRhLnR5cGUgPT09ICdsb290Ym94JyAmJiBpdGVtRGF0YS5sb290Ym94X2RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgcGhyYXNlID0gaXRlbURhdGEudXNlX3BocmFzZSB8fCBcIlx1MDQxRVx1MDQ0Mlx1MDQzQVx1MDQ0MFx1MDQ0Qlx1MDQzMlx1MDQzMFx1MDQ0RSBcdTA0NDFcdTA0NDNcdTA0M0RcdTA0MzRcdTA0NDNcdTA0M0EuLi4gXHUwNDI3XHUwNDQyXHUwNDNFIFx1MDQzNlx1MDQzNSBcdTA0MzJcdTA0M0RcdTA0NDNcdTA0NDJcdTA0NDBcdTA0Mzg/XCI7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi51aSkgdGhpcy5wbHVnaW4udWkuc2V0Q2hhdFRleHQocGhyYXNlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMub3Blbkxvb3Rib3goaXRlbURhdGEubG9vdGJveF9kYXRhKTtcclxuICAgICAgICAgICAgZXhpc3RpbmcucXVhbnRpdHktLTtcclxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nLnF1YW50aXR5IDw9IDApIHRoaXMuc3RhdGUuaW52ZW50b3J5ID0gdGhpcy5zdGF0ZS5pbnZlbnRvcnkuZmlsdGVyKGkgPT4gaS5pZCAhPT0gaXRlbUlkKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgICAgIHJldHVybjsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gXHUwNDE1XHUwNDQxXHUwNDNCXHUwNDM4IFx1MDQ0RFx1MDQ0Mlx1MDQzRSBcdTA0NDBcdTA0MzBcdTA0NDFcdTA0NDVcdTA0M0VcdTA0MzRcdTA0M0RcdTA0MzhcdTA0M0EgXHUwNDQxIFx1MDQzQ1x1MDQzMFx1MDQ0MVx1MDQ0MVx1MDQzOFx1MDQzMlx1MDQzRVx1MDQzQyBcdTA0NERcdTA0NDRcdTA0NDRcdTA0MzVcdTA0M0FcdTA0NDJcdTA0M0VcdTA0MzJcclxuICAgICAgICBpZiAoaXRlbURhdGEuZWZmZWN0cyAmJiBBcnJheS5pc0FycmF5KGl0ZW1EYXRhLmVmZmVjdHMpKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVmZmVjdCBvZiBpdGVtRGF0YS5lZmZlY3RzKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGVmZmVjdC50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2Fpbl9ocCc6IHRoaXMuc3RhdGUuaHAgPSBNYXRoLm1pbih0aGlzLnN0YXRlLm1heEhwLCB0aGlzLnN0YXRlLmhwICsgZWZmZWN0LnZhbHVlKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbG9zZV9ocCc6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmhwID0gTWF0aC5tYXgoMCwgdGhpcy5zdGF0ZS5ocCAtIGVmZmVjdC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmhwID09PSAwKSBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmRpZSh0aGlzLnBsdWdpbi5jdXJyZW50VW5pdmVyc2U/LnBlbmFsdGllcyB8fCB7IGRlYXRoX3hwX2xvc3NfcGN0OiAxMCwgZGVhdGhfZ29sZF9sb3NzX3BjdDogMTAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2dhaW5feHAnOiBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmdhaW5YUChlZmZlY3QudmFsdWUpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb3NlX3hwJzogYXdhaXQgdGhpcy5wbHVnaW4uZ2FtZS5sb3NlWFAoZWZmZWN0LnZhbHVlKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2Fpbl9jb2lucyc6IGF3YWl0IHRoaXMucGx1Z2luLmdhbWUuZ2FpbkNvaW5zKGVmZmVjdC52YWx1ZSk7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvc2VfY29pbnMnOiBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmxvc2VDb2lucyhlZmZlY3QudmFsdWUpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdnYWluX21vb2QnOiBhd2FpdCB0aGlzLnBsdWdpbi5nYW1lLmdhaW5Nb29kKGVmZmVjdC52YWx1ZSk7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvc2VfbW9vZCc6IGF3YWl0IHRoaXMucGx1Z2luLmdhbWUubG9zZU1vb2QoZWZmZWN0LnZhbHVlKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFx1MDQxOFx1MDQyMVx1MDQxRlx1MDQxRVx1MDQxQlx1MDQyQ1x1MDQxN1x1MDQyM1x1MDQxNVx1MDQxQyBcdTA0MjRcdTA0MjBcdTA0MTBcdTA0MTdcdTA0MjMgXHUwNDE4XHUwNDE3IFx1MDQxRlx1MDQyMFx1MDQxNVx1MDQxNFx1MDQxQ1x1MDQxNVx1MDQyMlx1MDQxMCFcclxuICAgICAgICAgICAgY29uc3QgcGhyYXNlID0gaXRlbURhdGEudXNlX3BocmFzZSB8fCBgXHUwNDIyXHUwNDRCIFx1MDQzOFx1MDQ0MVx1MDQzRlx1MDQzRVx1MDQzQlx1MDQ0Q1x1MDQzN1x1MDQzRVx1MDQzMlx1MDQzMFx1MDQzQiAke2l0ZW1EYXRhLm5hbWV9LmA7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi51aSkgdGhpcy5wbHVnaW4udWkuc2V0Q2hhdFRleHQocGhyYXNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGV4aXN0aW5nLnF1YW50aXR5LS07XHJcbiAgICAgICAgaWYgKGV4aXN0aW5nLnF1YW50aXR5IDw9IDApIHRoaXMuc3RhdGUuaW52ZW50b3J5ID0gdGhpcy5zdGF0ZS5pbnZlbnRvcnkuZmlsdGVyKGkgPT4gaS5pZCAhPT0gaXRlbUlkKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUHJvZ3Jlc3MoKTtcclxuICAgICAgICBuZXcgTm90aWNlKGBcdTA0MThcdTA0NDFcdTA0M0ZcdTA0M0VcdTA0M0JcdTA0NENcdTA0MzdcdTA0M0VcdTA0MzJcdTA0MzBcdTA0M0RcdTA0M0U6ICR7aXRlbURhdGEubmFtZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBcdTA0MURcdTA0MUVcdTA0MTJcdTA0MTBcdTA0MkYgXHUwNDI0XHUwNDIzXHUwNDFEXHUwNDFBXHUwNDI2XHUwNDE4XHUwNDJGIFx1MDQxNFx1MDQxQlx1MDQyRiBcdTA0MjBcdTA0MjNcdTA0MUJcdTA0MTVcdTA0MjJcdTA0MUFcdTA0MThcclxuICAgIGFzeW5jIG9wZW5Mb290Ym94KGxvb3Rib3hEYXRhKSB7XHJcbiAgICAgICAgY29uc3QgdW5pdmVyc2VJdGVtcyA9IHRoaXMucGx1Z2luLmN1cnJlbnRVbml2ZXJzZT8uaXRlbXMgfHwgW107XHJcbiAgICAgICAgY29uc3Qgcm9sbHMgPSBsb290Ym94RGF0YS5yb2xscyB8fCAxO1xyXG4gICAgICAgIGNvbnN0IGNoYW5jZXMgPSBsb290Ym94RGF0YS5jaGFuY2VzIHx8IHsgY29tbW9uOiAxMDAgfTtcclxuXHJcbiAgICAgICAgbGV0IHdvbkl0ZW1zID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm9sbHM7IGkrKykge1xyXG4gICAgICAgICAgICAvLyBcdTA0MUFcdTA0NDBcdTA0NDNcdTA0NDJcdTA0MzhcdTA0M0MgXHUwNDNBXHUwNDNFXHUwNDNCXHUwNDM1XHUwNDQxXHUwNDNFIChcdTA0M0VcdTA0NDIgMCBcdTA0MzRcdTA0M0UgMTAwKVxyXG4gICAgICAgICAgICBjb25zdCByb2xsID0gTWF0aC5yYW5kb20oKSAqIDEwMDtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRXZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgd29uUmFyaXR5ID0gXCJjb21tb25cIjtcclxuXHJcbiAgICAgICAgICAgIC8vIFx1MDQxRVx1MDQzRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzNVx1MDQzQlx1MDQ0Rlx1MDQzNVx1MDQzQyBcdTA0MzJcdTA0NEJcdTA0M0ZcdTA0MzBcdTA0MzJcdTA0NDhcdTA0NDNcdTA0NEUgXHUwNDQwXHUwNDM1XHUwNDM0XHUwNDNBXHUwNDNFXHUwNDQxXHUwNDQyXHUwNDRDXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgW3Jhcml0eSwgd2VpZ2h0XSBvZiBPYmplY3QuZW50cmllcyhjaGFuY2VzKSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFdlaWdodCArPSB3ZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocm9sbCA8PSBjdXJyZW50V2VpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29uUmFyaXR5ID0gcmFyaXR5O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBcdTA0MThcdTA0NDlcdTA0MzVcdTA0M0MgXHUwNDMyXHUwNDQxXHUwNDM1IFx1MDQzRlx1MDQ0MFx1MDQzNVx1MDQzNFx1MDQzQ1x1MDQzNVx1MDQ0Mlx1MDQ0QiBcdTA0NERcdTA0NDJcdTA0M0VcdTA0MzkgXHUwNDQwXHUwNDM1XHUwNDM0XHUwNDNBXHUwNDNFXHUwNDQxXHUwNDQyXHUwNDM4IFx1MDQzMiBcdTA0M0NcdTA0MzBcdTA0MzNcdTA0MzBcdTA0MzdcdTA0MzhcdTA0M0RcdTA0MzVcclxuICAgICAgICAgICAgY29uc3QgcG9zc2libGVJdGVtcyA9IHVuaXZlcnNlSXRlbXMuZmlsdGVyKGl0ZW0gPT4gKGl0ZW0ucmFyaXR5IHx8ICdjb21tb24nKSA9PT0gd29uUmFyaXR5ICYmIGl0ZW0udHlwZSAhPT0gJ2xvb3Rib3gnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwb3NzaWJsZUl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFx1MDQxMlx1MDQ0Qlx1MDQzMVx1MDQzOFx1MDQ0MFx1MDQzMFx1MDQzNVx1MDQzQyBcdTA0NDFcdTA0M0JcdTA0NDNcdTA0NDdcdTA0MzBcdTA0MzlcdTA0M0RcdTA0NEJcdTA0MzkgXHUwNDNGXHUwNDQwXHUwNDM1XHUwNDM0XHUwNDNDXHUwNDM1XHUwNDQyIFx1MDQzRFx1MDQ0M1x1MDQzNlx1MDQzRFx1MDQzRVx1MDQzOSBcdTA0NDBcdTA0MzVcdTA0MzRcdTA0M0FcdTA0M0VcdTA0NDFcdTA0NDJcdTA0MzhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRyb3AgPSBwb3NzaWJsZUl0ZW1zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlSXRlbXMubGVuZ3RoKV07XHJcbiAgICAgICAgICAgICAgICB3b25JdGVtcy5wdXNoKGRyb3ApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hZGRUb0ludmVudG9yeShkcm9wLmlkKTsgLy8gXHUwNDFBXHUwNDNCXHUwNDMwXHUwNDM0XHUwNDM1XHUwNDNDIFx1MDQzMiBcdTA0NDBcdTA0NEVcdTA0M0FcdTA0MzdcdTA0MzBcdTA0M0FcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gXHUwNDFGXHUwNDNFXHUwNDNBXHUwNDMwXHUwNDM3XHUwNDRCXHUwNDMyXHUwNDMwXHUwNDM1XHUwNDNDIFx1MDQzQVx1MDQ0MFx1MDQzMFx1MDQ0MVx1MDQzOFx1MDQzMlx1MDQ0Qlx1MDQzNSBcdTA0NDNcdTA0MzJcdTA0MzVcdTA0MzRcdTA0M0VcdTA0M0NcdTA0M0JcdTA0MzVcdTA0M0RcdTA0MzhcdTA0NEYgXHUwNDNFIFx1MDQzQlx1MDQ0M1x1MDQ0Mlx1MDQzNVxyXG4gICAgICAgIGlmICh3b25JdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1OYW1lcyA9IHdvbkl0ZW1zLm1hcChpdGVtID0+IGAke2l0ZW0uaWNvbl90ZXh0IHx8ICdcdUQ4M0RcdURDRTYnfSAke2l0ZW0ubmFtZX1gKS5qb2luKCdcXG4nKTtcclxuICAgICAgICAgICAgbmV3IE5vdGljZShgXHVEODNDXHVERjgxIFx1MDQxOFx1MDQxNyBcdTA0MjFcdTA0MjNcdTA0MURcdTA0MTRcdTA0MjNcdTA0MUFcdTA0MTAgXHUwNDEyXHUwNDJCXHUwNDFGXHUwNDEwXHUwNDFCXHUwNDFFOlxcbiR7aXRlbU5hbWVzfWAsIDUwMDApOyAvLyBcdTA0MTJcdTA0MzhcdTA0NDFcdTA0MzhcdTA0NDIgNSBcdTA0NDFcdTA0MzVcdTA0M0FcdTA0NDNcdTA0M0RcdTA0MzRcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLnVpKSB0aGlzLnBsdWdpbi51aS5zZXRDaGF0VGV4dChcIlx1MDQxRVx1MDQzM1x1MDQzRSEgXHUwNDFEXHUwNDM1XHUwNDNGXHUwNDNCXHUwNDNFXHUwNDQ1XHUwNDNFXHUwNDM5IFx1MDQ0M1x1MDQzQlx1MDQzRVx1MDQzMiFcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV3IE5vdGljZShcIlx1MDQyMVx1MDQ0M1x1MDQzRFx1MDQzNFx1MDQ0M1x1MDQzQSBcdTA0M0VcdTA0M0FcdTA0MzBcdTA0MzdcdTA0MzBcdTA0M0JcdTA0NDFcdTA0NEYgXHUwNDNGXHUwNDQzXHUwNDQxXHUwNDQyLi4uXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkcm9wSXRlbShpdGVtSWQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaW52ZW50b3J5KSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnN0YXRlLmludmVudG9yeS5maW5kKGkgPT4gaS5pZCA9PT0gaXRlbUlkKTtcclxuICAgICAgICBpZiAoIWV4aXN0aW5nKSByZXR1cm47XHJcblxyXG4gICAgICAgIGV4aXN0aW5nLnF1YW50aXR5LS07XHJcbiAgICAgICAgaWYgKGV4aXN0aW5nLnF1YW50aXR5IDw9IDApIHRoaXMuc3RhdGUuaW52ZW50b3J5ID0gdGhpcy5zdGF0ZS5pbnZlbnRvcnkuZmlsdGVyKGkgPT4gaS5pZCAhPT0gaXRlbUlkKTtcclxuXHJcbiAgICAgICAgLy8gXHUwNDIxXHUwNDNEXHUwNDM4XHUwNDNDXHUwNDMwXHUwNDM1XHUwNDNDIFx1MDQzMlx1MDQzNVx1MDQ0OVx1MDQ0QywgXHUwNDM1XHUwNDQxXHUwNDNCXHUwNDM4IFx1MDQzMlx1MDQ0Qlx1MDQzQVx1MDQzOFx1MDQzRFx1MDQ0M1x1MDQzQlx1MDQzOCBcdTA0M0ZcdTA0M0VcdTA0NDFcdTA0M0JcdTA0MzVcdTA0MzRcdTA0M0RcdTA0NEVcdTA0NEVcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcXVpcG1lbnQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc2xvdCBpbiB0aGlzLnN0YXRlLmVxdWlwbWVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXF1aXBtZW50W3Nsb3RdID09PSBpdGVtSWQgJiYgZXhpc3RpbmcucXVhbnRpdHkgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZXF1aXBtZW50W3Nsb3RdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUHJvZ3Jlc3MoKTtcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NHZW5lcmF0b3Ige1xyXG4gICAgY29uc3RydWN0b3IocGx1Z2luKSB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2VuZXJhdGUoKSB7XHJcbiAgICAgICAgY29uc3QgZm9sZGVyTmFtZSA9IFwiQ2hyb25pY2xlLm1kXCI7XHJcbiAgICAgICAgY29uc3QgdmF1bHQgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQ7XHJcbiAgICAgICAgY29uc3QgYWRhcHRlciA9IHZhdWx0LmFkYXB0ZXI7XHJcblxyXG4gICAgICAgIC8vIFx1MDQyMVx1MDQzRlx1MDQzOFx1MDQ0MVx1MDQzRVx1MDQzQSBcdTA0NDRcdTA0MzBcdTA0MzlcdTA0M0JcdTA0M0VcdTA0MzIgXHUwNDM0XHUwNDNCXHUwNDRGIFx1MDQzQVx1MDQzRVx1MDQzRlx1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzMFx1MDQzRFx1MDQzOFx1MDQ0RiBcdTA0MzhcdTA0MzcgYXNzZXRzIFx1MDQzMiBcdTA0NDVcdTA0NDBcdTA0MzBcdTA0M0RcdTA0MzhcdTA0M0JcdTA0MzhcdTA0NDlcdTA0MzVcclxuICAgICAgICBjb25zdCBmaWxlcyA9IFtcclxuICAgICAgICAgICAgXCJcdUQ4M0RcdURDRDYgXHUwNDIwXHUwNDQzXHUwNDNBXHUwNDNFXHUwNDMyXHUwNDNFXHUwNDM0XHUwNDQxXHUwNDQyXHUwNDMyXHUwNDNFIFx1MDQxQ1x1MDQzRVx1MDQzNFx1MDQzRVx1MDQzNFx1MDQzNVx1MDQzQlx1MDQzMC5tZFwiLFxyXG4gICAgICAgICAgICBcIlx1RDgzRFx1REVFMFx1RkUwRiBcdTA0MUFcdTA0NDNcdTA0MzdcdTA0M0RcdTA0MzhcdTA0NDZcdTA0MzAgXHUwNDFDXHUwNDM4XHUwNDQwXHUwNDNFXHUwNDMyLmh0bWxcIlxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIDEuIFx1MDQyMVx1MDQzRVx1MDQzN1x1MDQzNFx1MDQzMFx1MDQzNVx1MDQzQyBcdTA0M0ZcdTA0MzBcdTA0M0ZcdTA0M0FcdTA0NDMsIFx1MDQzNVx1MDQ0MVx1MDQzQlx1MDQzOCBcdTA0MzVcdTA0NTEgXHUwNDNEXHUwNDM1XHUwNDQyXHJcbiAgICAgICAgICAgIGlmICghdmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZvbGRlck5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB2YXVsdC5jcmVhdGVGb2xkZXIoZm9sZGVyTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpc0NvcGllZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gMi4gXHUwNDFGXHUwNDQwXHUwNDNFXHUwNDQ1XHUwNDNFXHUwNDM0XHUwNDM4XHUwNDNDIFx1MDQzRlx1MDQzRSBcdTA0M0FcdTA0MzBcdTA0MzZcdTA0MzRcdTA0M0VcdTA0M0NcdTA0NDMgXHUwNDQ0XHUwNDMwXHUwNDM5XHUwNDNCXHUwNDQzIFx1MDQzOCBcdTA0M0FcdTA0M0VcdTA0M0ZcdTA0MzhcdTA0NDBcdTA0NDNcdTA0MzVcdTA0M0MgXHUwNDM1XHUwNDMzXHUwNDNFXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBgJHtmb2xkZXJOYW1lfS8ke2ZpbGVOYW1lfWA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gYCR7dGhpcy5wbHVnaW4ubWFuaWZlc3QuZGlyfS9hc3NldHMvJHtmaWxlTmFtZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFx1MDQxNVx1MDQ0MVx1MDQzQlx1MDQzOCBcdTA0NDRcdTA0MzBcdTA0MzlcdTA0M0JcdTA0MzAgXHUwNDM1XHUwNDQ5XHUwNDM1IFx1MDQzRFx1MDQzNVx1MDQ0MiBcdTA0MzIgXHUwNDQ1XHUwNDQwXHUwNDMwXHUwNDNEXHUwNDM4XHUwNDNCXHUwNDM4XHUwNDQ5XHUwNDM1IFx1MDQzRlx1MDQzRVx1MDQzQlx1MDQ0Q1x1MDQzN1x1MDQzRVx1MDQzMlx1MDQzMFx1MDQ0Mlx1MDQzNVx1MDQzQlx1MDQ0RlxyXG4gICAgICAgICAgICAgICAgaWYgKCF2YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgodGFyZ2V0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdTA0MUZcdTA0NDBcdTA0M0VcdTA0MzJcdTA0MzVcdTA0NDBcdTA0NEZcdTA0MzVcdTA0M0MsIFx1MDQ0MVx1MDQ0M1x1MDQ0OVx1MDQzNVx1MDQ0MVx1MDQ0Mlx1MDQzMlx1MDQ0M1x1MDQzNVx1MDQ0MiBcdTA0M0JcdTA0MzggXHUwNDNFXHUwNDNEIFx1MDQzMiBcdTA0M0ZcdTA0MzBcdTA0M0ZcdTA0M0FcdTA0MzUgYXNzZXRzIFx1MDQzRlx1MDQzQlx1MDQzMFx1MDQzM1x1MDQzOFx1MDQzRFx1MDQzMFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhd2FpdCBhZGFwdGVyLmV4aXN0cyhzb3VyY2VQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYWRhcHRlci5yZWFkKHNvdXJjZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB2YXVsdC5jcmVhdGUodGFyZ2V0UGF0aCwgY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29waWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDaHJvbmljbGUubWQ6IFx1MDQyNFx1MDQzMFx1MDQzOVx1MDQzQiAke2ZpbGVOYW1lfSBcdTA0M0RcdTA0MzUgXHUwNDNEXHUwNDMwXHUwNDM5XHUwNDM0XHUwNDM1XHUwNDNEIFx1MDQzMiBcdTA0M0ZcdTA0MzBcdTA0M0ZcdTA0M0FcdTA0MzUgYXNzZXRzIWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gXHUwNDIzXHUwNDMyXHUwNDM1XHUwNDM0XHUwNDNFXHUwNDNDXHUwNDNCXHUwNDRGXHUwNDM1XHUwNDNDIFx1MDQzRlx1MDQzRVx1MDQzQlx1MDQ0Q1x1MDQzN1x1MDQzRVx1MDQzMlx1MDQzMFx1MDQ0Mlx1MDQzNVx1MDQzQlx1MDQ0RiBcdTA0NDJcdTA0M0VcdTA0M0JcdTA0NENcdTA0M0FcdTA0M0UgXHUwNDM1XHUwNDQxXHUwNDNCXHUwNDM4IFx1MDQ0N1x1MDQ0Mlx1MDQzRS1cdTA0NDJcdTA0M0UgXHUwNDQwXHUwNDM1XHUwNDMwXHUwNDNCXHUwNDRDXHUwNDNEXHUwNDNFIFx1MDQ0MVx1MDQzQVx1MDQzRVx1MDQzRlx1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzMFx1MDQzQlx1MDQzRVx1MDQ0MVx1MDQ0Q1xyXG4gICAgICAgICAgICBpZiAoaXNDb3BpZWQpIHtcclxuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJDaHJvbmljbGUubWQ6IFx1MDQyMFx1MDQ0M1x1MDQzQVx1MDQzRVx1MDQzMlx1MDQzRVx1MDQzNFx1MDQ0MVx1MDQ0Mlx1MDQzMlx1MDQzRSBcdTA0MzggXHUwNDFBXHUwNDQzXHUwNDM3XHUwNDNEXHUwNDM4XHUwNDQ2XHUwNDMwIFx1MDQxQ1x1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMiBcdTA0MzRcdTA0M0VcdTA0MzFcdTA0MzBcdTA0MzJcdTA0M0JcdTA0MzVcdTA0M0RcdTA0NEIgXHUwNDMyIFx1MDQzMlx1MDQzMFx1MDQ0OFx1MDQzNSBcdTA0NDVcdTA0NDBcdTA0MzBcdTA0M0RcdTA0MzhcdTA0M0JcdTA0MzhcdTA0NDlcdTA0MzUhXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJcdTA0MUVcdTA0NDhcdTA0MzhcdTA0MzFcdTA0M0FcdTA0MzAgXHUwNDNGXHUwNDQwXHUwNDM4IFx1MDQzQVx1MDQzRVx1MDQzRlx1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzMFx1MDQzRFx1MDQzOFx1MDQzOCBcdTA0NDRcdTA0MzBcdTA0MzlcdTA0M0JcdTA0M0VcdTA0MzIgQ2hyb25pY2xlLm1kOlwiLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsb0JBQXFDOzs7QUNBckMsc0JBQTZCO0FBRTdCLElBQXFCLGlCQUFyQixjQUE0Qyw2QkFBYTtBQUFBLEVBQ3JELFlBQVksS0FBSyxPQUFPLFVBQVU7QUFDOUIsVUFBTSxHQUFHO0FBQ1QsU0FBSyxRQUFRO0FBQ2IsU0FBSyxXQUFXO0FBQ2hCLFNBQUssZUFBZSwrSEFBMkI7QUFBQSxFQUNuRDtBQUFBLEVBQ0EsZUFBZSxPQUFPO0FBQUUsV0FBTyxLQUFLLE1BQU0sT0FBTyxVQUFRLEtBQUssWUFBWSxFQUFFLFNBQVMsTUFBTSxZQUFZLENBQUMsQ0FBQztBQUFBLEVBQUc7QUFBQSxFQUM1RyxpQkFBaUIsTUFBTSxJQUFJO0FBQUUsT0FBRyxTQUFTLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQUFBLEVBQUc7QUFBQSxFQUNqRSxtQkFBbUIsTUFBTSxLQUFLO0FBQUUsU0FBSyxTQUFTLElBQUk7QUFBQSxFQUFHO0FBQ3pEOzs7QUNaQSxJQUFBQyxtQkFBc0I7QUFFdEIsSUFBcUIsZ0JBQXJCLGNBQTJDLHVCQUFNO0FBQUEsRUFDN0MsWUFBWSxLQUFLLFFBQVE7QUFDckIsVUFBTSxHQUFHO0FBQ1QsU0FBSyxTQUFTO0FBQ2QsU0FBSyxjQUFjLE9BQU8sT0FBTztBQUFBLEVBQ3JDO0FBQUEsRUFDQSxTQUFTO0FBQUUsU0FBSyxlQUFlO0FBQUEsRUFBRztBQUFBLEVBQ2xDLGlCQUFpQjtBQVRyQjtBQVVRLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxNQUFNO0FBQ2hCLFVBQU0sV0FBUyxVQUFLLE9BQU8sb0JBQVosbUJBQTZCLE9BQU0sRUFBRSxnQkFBZ0Isd0RBQWMsWUFBWSxlQUFLO0FBRW5HLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxPQUFPLGdCQUFnQixPQUFPLHlLQUF5SyxDQUFDO0FBRXpPLFVBQU0sU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssc0JBQXNCLENBQUM7QUFDdkUsVUFBTSxVQUFVLE9BQU8sU0FBUyxVQUFVLEVBQUUsTUFBTSxTQUFJLENBQUM7QUFDdkQsVUFBTSxZQUFZLEtBQUssWUFBWSxPQUFPLFdBQVc7QUFDckQsV0FBTyxTQUFTLE1BQU0sRUFBRSxNQUFNLFVBQVUsT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUFJLFVBQVUsTUFBTSxDQUFDLEdBQUcsT0FBTyx1RUFBdUUsQ0FBQztBQUNySyxVQUFNLFVBQVUsT0FBTyxTQUFTLFVBQVUsRUFBRSxNQUFNLFNBQUksQ0FBQztBQUV2RCxZQUFRLFVBQVUsTUFBTTtBQUFFLFdBQUssWUFBWSxTQUFTLEdBQUcsT0FBTztBQUFHLFdBQUssZUFBZTtBQUFBLElBQUc7QUFDeEYsWUFBUSxVQUFVLE1BQU07QUFBRSxXQUFLLFlBQVksSUFBSSxHQUFHLE9BQU87QUFBRyxXQUFLLGVBQWU7QUFBQSxJQUFHO0FBRW5GLFVBQU0sT0FBTyxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDbkUsS0FBQyxnQkFBTSxnQkFBTSxnQkFBTSxnQkFBTSxnQkFBTSxnQkFBTSxjQUFJLEVBQUUsUUFBUSxPQUFLLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUVsSCxVQUFNLGVBQWUsS0FBSyxZQUFZLE1BQU0sRUFBRSxRQUFRLE9BQU87QUFDN0QsVUFBTSxhQUFhLEtBQUssWUFBWSxNQUFNLEVBQUUsTUFBTSxPQUFPO0FBRXpELFFBQUksaUJBQWlCLGFBQWEsSUFBSTtBQUN0QyxRQUFJLG1CQUFtQixFQUFHLGtCQUFpQjtBQUMzQztBQUVBLGFBQVMsSUFBSSxHQUFHLElBQUksZ0JBQWdCLElBQUssTUFBSyxTQUFTLE9BQU8sRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBRS9GLFVBQU0sVUFBVSxLQUFLLE9BQU8sS0FBSyxXQUFXLENBQUM7QUFDN0MsVUFBTSxXQUFXLE9BQU8sT0FBTyxFQUFFLE9BQU8sWUFBWTtBQUVwRCxhQUFTLE1BQU0sR0FBRyxPQUFPLFdBQVcsS0FBSyxHQUFHLE9BQU87QUFDL0MsWUFBTSxVQUFVLGFBQWEsTUFBTSxFQUFFLEtBQUssR0FBRyxFQUFFLE9BQU8sWUFBWTtBQUNsRSxZQUFNLGFBQWEsUUFBUSxPQUFPLEtBQUs7QUFFdkMsWUFBTSxVQUFVLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyxtQkFBbUIsQ0FBQztBQUNoRSxjQUFRLFNBQVMsUUFBUSxFQUFFLE1BQU0sSUFBSSxTQUFTLEdBQUcsT0FBTyw2QkFBNkIsQ0FBQztBQUV0RixVQUFJLFlBQVksU0FBVSxTQUFRLFNBQVMsT0FBTztBQUNsRCxVQUFJLGFBQWEsR0FBRztBQUNoQixnQkFBUSxTQUFTLFlBQVk7QUFDN0IsZ0JBQVEsU0FBUyxRQUFRLEVBQUUsS0FBSyxtQkFBbUIsTUFBTSxHQUFHLE9BQU8sVUFBVSxJQUFJLFVBQVUsR0FBRyxDQUFDO0FBQUEsTUFDbkc7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsVUFBVTtBQUFFLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFBRztBQUN4Qzs7O0FDdkRBLElBQXFCLGdCQUFyQixNQUFtQztBQUFBLEVBQy9CLFlBQVksUUFBUTtBQUFFLFNBQUssU0FBUztBQUFBLEVBQVE7QUFBQSxFQUU1QyxhQUFhO0FBQ1QsVUFBTSxJQUFJLEtBQUssT0FBTztBQUN0QixVQUFNLGNBQWMsS0FBSyxPQUFPLE1BQU0sUUFBUTtBQUM5QyxVQUFNLGtCQUFpQix1QkFBRyxZQUFXLEVBQUUsV0FBVyxDQUFDLGVBQUssR0FBRyxhQUFhLGlCQUFPLFVBQVUsK0NBQVksT0FBTyx3Q0FBVTtBQUV0SCxRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQVMsV0FBVyxHQUFHO0FBQzlDLGFBQU8sRUFBRSxXQUFXLGdFQUFjLGNBQWEsdUJBQUcsZ0JBQWUsYUFBTSxTQUFTLGVBQWU7QUFBQSxJQUNuRztBQUVBLFVBQU0sU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTO0FBQ3ZFLGFBQVMsV0FBVyxRQUFRO0FBQ3hCLFVBQUksZUFBZSxRQUFRLFdBQVc7QUFDbEMsWUFBSSxDQUFDLFFBQVEsUUFBUyxTQUFRLFVBQVU7QUFDeEMsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBRUEsVUFBTSxPQUFPLE9BQU8sT0FBTyxTQUFTLENBQUM7QUFDckMsUUFBSSxDQUFDLEtBQUssUUFBUyxNQUFLLFVBQVU7QUFDbEMsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGVBQWU7QUF6Qm5CO0FBMEJRLFVBQU0sSUFBSSxLQUFLO0FBQVEsVUFBTSxJQUFJLEVBQUU7QUFBa0IsVUFBTSxJQUFJLEVBQUU7QUFFakUsVUFBTSxLQUFJLHVCQUFHLGdCQUFlLEVBQUUsSUFBSSxNQUFNLElBQUksNEJBQVEsTUFBTSwrREFBYTtBQUN2RSxVQUFNLFVBQVMsdUJBQUcsV0FBVSxFQUFFLElBQUksV0FBVyxJQUFJLFdBQVcsTUFBTSxVQUFVO0FBQzVFLFVBQU0sTUFBSyx1QkFBRyxPQUFNLEVBQUUsV0FBVyxZQUFLO0FBRXRDLFVBQU0sVUFBVSxLQUFLLFdBQVc7QUFFaEMsU0FBSyxZQUFZLFNBQVMsY0FBYyxLQUFLO0FBQzdDLFNBQUssVUFBVSxZQUFZO0FBRTNCLFNBQUssVUFBVSxNQUFNLFlBQVksa0JBQWtCLE9BQU8sRUFBRTtBQUM1RCxTQUFLLFVBQVUsTUFBTSxZQUFZLGtCQUFrQixPQUFPLEVBQUU7QUFDNUQsU0FBSyxVQUFVLE1BQU0sWUFBWSxvQkFBb0IsT0FBTyxJQUFJO0FBRWhFLFVBQU0sZ0JBQWdCLFNBQVMsY0FBYyxLQUFLO0FBQ2xELGtCQUFjLFlBQVk7QUFFMUIsU0FBSyxrQkFBa0IsU0FBUyxjQUFjLEtBQUs7QUFDbkQsU0FBSyxnQkFBZ0IsWUFBWTtBQUNqQyxrQkFBYyxZQUFZLEtBQUssZUFBZTtBQUU5QyxTQUFLLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDN0MsU0FBSyxVQUFVLFlBQVk7QUFDM0Isa0JBQWMsWUFBWSxLQUFLLFNBQVM7QUFFeEMsVUFBTSxhQUFhLFNBQVMsY0FBYyxLQUFLO0FBQy9DLGVBQVcsWUFBWTtBQUV2QixVQUFNLGNBQWMsU0FBUyxjQUFjLEtBQUs7QUFDaEQsZ0JBQVksWUFBWTtBQUV4QixnQkFBWSxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU94QixVQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsY0FBVSxZQUFZO0FBQXVCLGNBQVUsYUFBWSx1QkFBRyxTQUFRO0FBRTlFLFNBQUssYUFBYSxTQUFTLGNBQWMsS0FBSztBQUM5QyxTQUFLLFdBQVcsWUFBWTtBQUU1QixlQUFXLFlBQVksV0FBVztBQUFHLGVBQVcsWUFBWSxTQUFTO0FBQUcsZUFBVyxZQUFZLEtBQUssVUFBVTtBQUU5RyxTQUFLLFVBQVUsWUFBWSxhQUFhO0FBQ3hDLFNBQUssVUFBVSxZQUFZLFVBQVU7QUFDckMsYUFBUyxLQUFLLFlBQVksS0FBSyxTQUFTO0FBRXhDLFNBQUssU0FBUyxTQUFTLGVBQWUsY0FBYztBQUNwRCxTQUFLLFNBQVMsU0FBUyxlQUFlLGNBQWM7QUFDcEQsU0FBSyxXQUFXLFNBQVMsZUFBZSxnQkFBZ0I7QUFDeEQsU0FBSyxXQUFXLFNBQVMsZUFBZSxnQkFBZ0I7QUFFeEQsU0FBSyxTQUFTLFNBQVMsZUFBZSxjQUFjO0FBQ3BELFNBQUssU0FBUyxTQUFTLGVBQWUsY0FBYztBQUNwRCxTQUFLLFdBQVcsU0FBUyxlQUFlLGdCQUFnQjtBQUV4RCxTQUFLLGNBQVksYUFBUSxZQUFSLG1CQUFpQixhQUFZLHFFQUFjO0FBQzVELFNBQUssY0FBYztBQUFBLEVBQ3ZCO0FBQUEsRUFFQSxZQUFZLE1BQU07QUFBRSxRQUFJLEtBQUssV0FBWSxNQUFLLFdBQVcsWUFBWSxPQUFJLElBQUk7QUFBQSxFQUFLO0FBQUE7QUFBQSxFQUdsRixNQUFNLGdCQUFnQjtBQUNsQixVQUFNLElBQUksS0FBSztBQUFRLFVBQU0sSUFBSSxFQUFFO0FBQWtCLFVBQU0sSUFBSSxFQUFFO0FBQ2pFLFFBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssT0FBUTtBQUU5QixVQUFNLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxNQUFNLElBQUksNEJBQVEsTUFBTSwrREFBYTtBQUN0RSxVQUFNLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxZQUFLO0FBQ3JDLFVBQU0sVUFBVSxLQUFLLFdBQVc7QUFHaEMsU0FBSyxnQkFBZ0IsWUFBWTtBQUNqQyxRQUFJLFFBQVEsVUFBVTtBQUNsQixZQUFNLFVBQVUsR0FBRyxFQUFFLFNBQVMsR0FBRyxlQUFlLEVBQUUsS0FBSyxXQUFXLFlBQVksUUFBUSxRQUFRO0FBRzlGLFVBQUksTUFBTSxFQUFFLElBQUksTUFBTSxRQUFRLE9BQU8sT0FBTyxHQUFHO0FBQzNDLGNBQU0sTUFBTSxFQUFFLElBQUksTUFBTSxRQUFRLGdCQUFnQixPQUFPO0FBQ3ZELGNBQU0sTUFBTSxTQUFTLGNBQWMsS0FBSztBQUN4QyxZQUFJLE1BQU07QUFDVixZQUFJLFlBQVk7QUFDaEIsYUFBSyxnQkFBZ0IsWUFBWSxHQUFHO0FBQUEsTUFDeEMsT0FBTztBQUNILGFBQUssaUJBQWlCLFFBQVEsV0FBVztBQUFBLE1BQzdDO0FBQUEsSUFDSixPQUFPO0FBQ0gsV0FBSyxpQkFBaUIsUUFBUSxXQUFXO0FBQUEsSUFDN0M7QUFHQSxTQUFLLFVBQVUsWUFBWSxRQUFRLGFBQWE7QUFHaEQsVUFBTSxZQUFhLEVBQUUsTUFBTSxLQUFLLEVBQUUsTUFBTSxnQkFBaUI7QUFDekQsVUFBTSxZQUFhLEVBQUUsTUFBTSxLQUFLLEVBQUUsTUFBTSxRQUFTO0FBQ2pELFVBQU0sY0FBYyxFQUFFLE1BQU0sUUFBUTtBQUVwQyxTQUFLLE9BQU8sTUFBTSxRQUFRLEdBQUcsS0FBSyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQ3JELFNBQUssT0FBTyxNQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsU0FBSyxTQUFTLE1BQU0sUUFBUSxHQUFHLEtBQUssSUFBSSxLQUFLLFdBQVcsQ0FBQztBQUV6RCxRQUFJLEtBQUssT0FBUSxNQUFLLE9BQU8sWUFBWSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEtBQUs7QUFDaEYsUUFBSSxLQUFLLE9BQVEsTUFBSyxPQUFPLFlBQVksR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sS0FBSztBQUNsRSxRQUFJLEtBQUssU0FBVSxNQUFLLFNBQVMsWUFBWSxHQUFHLEVBQUUsSUFBSSxLQUFLLEVBQUUsTUFBTSxJQUFJO0FBQ3ZFLFFBQUksS0FBSyxTQUFVLE1BQUssU0FBUyxZQUFZLEdBQUcsR0FBRyxTQUFTLElBQUksRUFBRSxNQUFNLEtBQUs7QUFBQSxFQUNqRjtBQUFBLEVBRUEsaUJBQWlCLE1BQU07QUFFbkIsU0FBSyxnQkFBZ0IsWUFBWSxrQ0FBa0MsUUFBUSxXQUFJO0FBRy9FLFNBQUssZ0JBQWdCLE1BQU0sVUFBVTtBQUNyQyxTQUFLLGdCQUFnQixNQUFNLGFBQWE7QUFDeEMsU0FBSyxnQkFBZ0IsTUFBTSxpQkFBaUI7QUFDNUMsU0FBSyxnQkFBZ0IsTUFBTSxXQUFXO0FBQUEsRUFDMUM7QUFBQSxFQUVBLFNBQVM7QUFBRSxRQUFJLEtBQUssVUFBVyxNQUFLLFVBQVUsT0FBTztBQUFBLEVBQUc7QUFDNUQ7OztBQ3RKQSxJQUFBQyxtQkFBeUI7QUFFbEIsSUFBTSxzQkFBc0I7QUFFbkMsSUFBcUIsZUFBckIsY0FBMEMsMEJBQVM7QUFBQSxFQUMvQyxZQUFZLE1BQU0sUUFBUTtBQUN0QixVQUFNLElBQUk7QUFDVixTQUFLLFNBQVM7QUFDZCxTQUFLLGVBQWU7QUFDcEIsU0FBSyxXQUFXO0FBQUEsRUFDcEI7QUFBQSxFQUVBLGNBQWM7QUFBRSxXQUFPO0FBQUEsRUFBcUI7QUFBQSxFQUM1QyxpQkFBaUI7QUFBRSxXQUFPO0FBQUEsRUFBa0I7QUFBQSxFQUM1QyxVQUFVO0FBQUUsV0FBTztBQUFBLEVBQWtCO0FBQUEsRUFFckMsTUFBTSxTQUFTO0FBQ1gsVUFBTSxLQUFLLFlBQVk7QUFDdkIsU0FBSyxjQUFjLEtBQUssSUFBSSxVQUFVLEdBQUcsYUFBYSxNQUFNLEtBQUssWUFBWSxDQUFDLENBQUM7QUFDL0UsU0FBSztBQUFBLE1BQ0QsS0FBSyxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUztBQUNsQyxjQUFNLGFBQWEsS0FBSyxJQUFJLFVBQVUsY0FBYztBQUNwRCxZQUFJLEtBQUssYUFBYSxXQUFXLGNBQWMsS0FBSyxTQUFTLFdBQVcsTUFBTTtBQUMxRSxlQUFLLFlBQVk7QUFBQSxRQUNyQixXQUFXLEtBQUssYUFBYSxTQUFTO0FBQ2xDLHFCQUFXLE1BQU0sS0FBSyxZQUFZLEdBQUcsR0FBRztBQUFBLFFBQzVDO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFBQSxFQUVBLE1BQU0sY0FBYztBQS9CeEI7QUFnQ1EsVUFBTSxZQUFZLEtBQUssWUFBWSxTQUFTLENBQUM7QUFDN0MsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyx5QkFBeUI7QUFFNUMsVUFBTSxXQUFTLFVBQUssT0FBTyxvQkFBWixtQkFBNkIsT0FBTTtBQUFBLE1BQzlDLGFBQWE7QUFBQSxNQUF1QixrQkFBa0I7QUFBQSxNQUN0RCxZQUFZO0FBQUEsTUFBYyxrQkFBa0I7QUFBQSxNQUFTLFdBQVc7QUFBQSxJQUNwRTtBQUVBLGNBQVUsU0FBUyxPQUFPLEVBQUUsS0FBSyx5QkFBeUIsTUFBTSxPQUFPLFlBQVksQ0FBQztBQUVwRixVQUFNLFlBQVksVUFBVSxTQUFTLE9BQU8sRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQ3ZFLFVBQU0sV0FBVyxVQUFVLFNBQVMsVUFBVSxFQUFFLE1BQU0sT0FBTyxpQkFBaUIsQ0FBQztBQUMvRSxVQUFNLFlBQVksVUFBVSxTQUFTLFVBQVUsRUFBRSxNQUFNLE9BQU8sV0FBVyxDQUFDO0FBQzFFLFVBQU0sZUFBZSxVQUFVLFNBQVMsVUFBVSxFQUFFLE1BQU0sT0FBTyxpQkFBaUIsQ0FBQztBQUVuRixRQUFJLEtBQUssYUFBYSxRQUFTLFVBQVMsU0FBUyxRQUFRO0FBQUEsYUFDaEQsS0FBSyxhQUFhLFNBQVUsV0FBVSxTQUFTLFFBQVE7QUFBQSxRQUMzRCxjQUFhLFNBQVMsUUFBUTtBQUVuQyxhQUFTLFVBQVUsTUFBTTtBQUFFLFdBQUssV0FBVztBQUFTLFdBQUssWUFBWTtBQUFBLElBQUc7QUFDeEUsY0FBVSxVQUFVLE1BQU07QUFBRSxXQUFLLFdBQVc7QUFBVSxXQUFLLFlBQVk7QUFBQSxJQUFHO0FBQzFFLGlCQUFhLFVBQVUsTUFBTTtBQUFFLFdBQUssV0FBVztBQUFhLFdBQUssWUFBWTtBQUFBLElBQUc7QUFFaEYsU0FBSyxnQkFBZ0IsVUFBVSxTQUFTLEtBQUs7QUFFN0MsUUFBSSxLQUFLLGFBQWEsUUFBUyxPQUFNLEtBQUssZ0JBQWdCLE1BQU07QUFBQSxhQUN2RCxLQUFLLGFBQWEsU0FBVSxPQUFNLEtBQUssaUJBQWlCLFFBQVEsWUFBWTtBQUFBLFFBQ2hGLE9BQU0sS0FBSyxpQkFBaUIsUUFBUSxXQUFXO0FBQUEsRUFDeEQ7QUFBQSxFQUVBLE1BQU0sZ0JBQWdCLFFBQVE7QUFDMUIsVUFBTSxhQUFhLEtBQUssSUFBSSxVQUFVLGNBQWM7QUFDcEQsUUFBSSxDQUFDLGNBQWMsV0FBVyxjQUFjLE1BQU07QUFDOUMsV0FBSyxjQUFjLFNBQVMsS0FBSyxFQUFFLE1BQU0sT0FBTyxXQUFXLE9BQU8sZ0RBQWdELENBQUM7QUFDbkg7QUFBQSxJQUNKO0FBQ0EsVUFBTSxLQUFLLGlCQUFpQixZQUFZLE9BQU8sV0FBVyxLQUFLO0FBQUEsRUFDbkU7QUFBQSxFQUVBLE1BQU0saUJBQWlCLFFBQVEsWUFBWTtBQUN2QyxVQUFNLFFBQVEsS0FBSyxJQUFJLE1BQU0saUJBQWlCO0FBQzlDLFFBQUksV0FBVztBQUNmLFVBQU0sY0FBYyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLFFBQVEsRUFBRSxLQUFLLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUVqRixlQUFXLFFBQVEsYUFBYTtBQUM1QixZQUFNLFdBQVcsTUFBTSxLQUFLLGlCQUFpQixNQUFNLE1BQU0sVUFBVTtBQUNuRSxVQUFJLFNBQVUsWUFBVztBQUFBLElBQzdCO0FBRUEsUUFBSSxDQUFDLFNBQVUsTUFBSyxjQUFjLFNBQVMsS0FBSyxFQUFFLE1BQU0sT0FBTyxXQUFXLE9BQU8sZ0RBQWdELENBQUM7QUFBQSxFQUN0STtBQUFBLEVBRUEsTUFBTSxpQkFBaUIsTUFBTSxjQUFjLFlBQVk7QUFDbkQsVUFBTSxVQUFVLE1BQU0sS0FBSyxJQUFJLE1BQU0sS0FBSyxJQUFJO0FBQzlDLFVBQU0sUUFBUSxRQUFRLE1BQU0sSUFBSTtBQUNoQyxVQUFNLFFBQVEsQ0FBQztBQUNmLFVBQU0sWUFBWTtBQUVsQixVQUFNLFFBQVEsQ0FBQyxNQUFNLFVBQVU7QUFDM0IsWUFBTSxRQUFRLEtBQUssTUFBTSxTQUFTO0FBQ2xDLFVBQUksT0FBTztBQUNQLGNBQU0sY0FBYyxNQUFNLENBQUMsRUFBRSxZQUFZLE1BQU07QUFDL0MsWUFBSSxlQUFlLGdCQUFnQixZQUFhO0FBQ2hELFlBQUksZUFBZSxlQUFlLENBQUMsWUFBYTtBQUNoRCxjQUFNLEtBQUssRUFBRSxXQUFXLE9BQU8sYUFBMEIsTUFBTSxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQUEsTUFDN0U7QUFBQSxJQUNKLENBQUM7QUFFRCxRQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3BCLFVBQUksYUFBYyxNQUFLLGNBQWMsU0FBUyxLQUFLLEVBQUUsTUFBTSxjQUFjLE9BQU8sZ0RBQWdELENBQUM7QUFDakksYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLE9BQU8sS0FBSyxjQUFjLFNBQVMsT0FBTyxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFDN0UsVUFBTSxTQUFTLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyx1QkFBdUIsQ0FBQztBQUNuRSxXQUFPLFNBQVMsUUFBUSxFQUFFLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFFL0MsVUFBTSxPQUFPLEtBQUssU0FBUyxNQUFNLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUUxRCxVQUFNLFFBQVEsVUFBUTtBQUNsQixZQUFNLEtBQUssS0FBSyxTQUFTLE1BQU0sRUFBRSxNQUFNLEtBQUssS0FBSyxDQUFDO0FBQ2xELFVBQUksS0FBSyxZQUFhLElBQUcsU0FBUyxXQUFXO0FBRTdDLFNBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUNyQyxZQUFJLEtBQUssYUFBYztBQUN2QixhQUFLLGVBQWU7QUFDcEIsY0FBTSxLQUFLLGlCQUFpQixNQUFNLEtBQUssV0FBVyxDQUFDLEtBQUssV0FBVztBQUduRSxjQUFNLEtBQUssT0FBTyxxQkFBcUIsQ0FBQyxLQUFLLGFBQWEsS0FBSyxJQUFJO0FBRW5FLG1CQUFXLE1BQU07QUFBRSxlQUFLLGVBQWU7QUFBQSxRQUFPLEdBQUcsR0FBRztBQUFBLE1BQ3hELENBQUM7QUFBQSxJQUNMLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsTUFBTSxpQkFBaUIsTUFBTSxXQUFXLGVBQWU7QUFDbkQsVUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sQ0FBQyxTQUFTO0FBQ3pDLFlBQU0sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUM3QixZQUFNLE9BQU8sTUFBTSxTQUFTO0FBQzVCLFVBQUksY0FBZSxPQUFNLFNBQVMsSUFBSSxLQUFLLFFBQVEsYUFBYSxPQUFPO0FBQUEsVUFDbEUsT0FBTSxTQUFTLElBQUksS0FBSyxRQUFRLGFBQWEsT0FBTztBQUN6RCxhQUFPLE1BQU0sS0FBSyxJQUFJO0FBQUEsSUFDMUIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLE1BQU0sVUFBVTtBQUFBLEVBQUU7QUFDdEI7OztBQzVJQSxJQUFBQyxtQkFBOEI7QUFFOUIsSUFBcUIsWUFBckIsY0FBdUMsdUJBQU07QUFBQSxFQUN6QyxZQUFZLEtBQUssUUFBUTtBQUNyQixVQUFNLEdBQUc7QUFDVCxTQUFLLFNBQVM7QUFBQSxFQUNsQjtBQUFBLEVBRUEsU0FBUztBQUFFLFNBQUssT0FBTztBQUFBLEVBQUc7QUFBQSxFQUUxQixTQUFTO0FBVmI7QUFXUSxVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsb0JBQW9CO0FBRXZDLFVBQU0sV0FBUyxVQUFLLE9BQU8sb0JBQVosbUJBQTZCLE9BQU0sQ0FBQztBQUNuRCxVQUFNLFlBQVksT0FBTyxjQUFjO0FBQ3ZDLFVBQU0sV0FBVyxPQUFPLGFBQWE7QUFFckMsVUFBTSxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUNuRSxXQUFPLFNBQVMsTUFBTSxFQUFFLE1BQU0sV0FBVyxPQUFPLDhFQUE4RSxDQUFDO0FBRS9ILFVBQU0sV0FBVyxLQUFLLE9BQU8sS0FBSyxrQkFBa0IsRUFBRTtBQUN0RCxVQUFNLGNBQWMsS0FBSyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUssS0FBSyxDQUFDO0FBRXpELFdBQU8sU0FBUyxPQUFPLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxHQUFHLFFBQVEsSUFBSSxLQUFLLE9BQU8sTUFBTSxLQUFLLDBDQUFZLFdBQVcsS0FBSyxDQUFDO0FBRTNILFVBQU0sT0FBTyxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssZ0JBQWdCLENBQUM7QUFFL0QsVUFBTSxVQUFRLFVBQUssT0FBTyxvQkFBWixtQkFBNkIsVUFBUyxDQUFDO0FBQ3JELFFBQUksTUFBTSxXQUFXLEdBQUc7QUFDcEIsV0FBSyxTQUFTLEtBQUssRUFBRSxNQUFNLDBRQUF3RCxPQUFPLHFFQUFxRSxDQUFDO0FBQ2hLO0FBQUEsSUFDSjtBQUVBLFVBQU0sUUFBUSxVQUFRO0FBQ2xCLFlBQU0sYUFBYSxLQUFLLFVBQVU7QUFFbEMsWUFBTSxPQUFPLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyw0QkFBNEIsVUFBVSxHQUFHLENBQUM7QUFFbkYsWUFBTSxNQUFNLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUUzRCxZQUFNLFNBQVMsSUFBSSxTQUFTLE9BQU8sRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQzNELFVBQUksS0FBSyxVQUFVO0FBQ2YsY0FBTSxVQUFVLEdBQUcsS0FBSyxPQUFPLFNBQVMsR0FBRyxjQUFjLEtBQUssT0FBTyxLQUFLLFVBQVUsZUFBZSxLQUFLLFFBQVE7QUFDaEgsY0FBTSxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sUUFBUSxnQkFBZ0IsT0FBTztBQUNqRSxjQUFNLE1BQU0sT0FBTyxTQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBUyxFQUFFLENBQUM7QUFDekQsWUFBSSxVQUFVLE1BQU07QUFBRSxjQUFJLE9BQU87QUFBRyxpQkFBTyxZQUFZLEtBQUssYUFBYTtBQUFBLFFBQU07QUFBQSxNQUNuRixPQUFPO0FBQ0gsZUFBTyxZQUFZLEtBQUssYUFBYSxLQUFLLFFBQVE7QUFBQSxNQUN0RDtBQUVBLFlBQU0sT0FBTyxJQUFJLFNBQVMsT0FBTyxFQUFFLEtBQUssZ0JBQWdCLENBQUM7QUFDekQsV0FBSyxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixNQUFNLEtBQUssS0FBSyxDQUFDO0FBQzlELFdBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsTUFBTSxLQUFLLFlBQVksQ0FBQztBQUVyRSxZQUFNLGFBQWEsS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLEtBQUssU0FBUyxJQUFLLGNBQWMsSUFBSyxDQUFDO0FBRWpGLFlBQU0sTUFBTSxLQUFLLFNBQVMsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDOUQsVUFBSSxZQUFZLGNBQWMsSUFBSSx5Q0FBVyxRQUFRLElBQUksVUFBVSxNQUFNLHlDQUFXLFFBQVEsSUFBSSxLQUFLLEtBQUs7QUFFMUcsVUFBSSxLQUFLLE9BQU8sTUFBTSxRQUFRLFdBQVksS0FBSSxXQUFXO0FBRXpELFVBQUksVUFBVSxZQUFZO0FBQ3RCLFlBQUksS0FBSyxPQUFPLE1BQU0sU0FBUyxZQUFZO0FBQ3ZDLGdCQUFNLEtBQUssT0FBTyxVQUFVLFVBQVU7QUFDdEMsZ0JBQU0sS0FBSyxPQUFPLFVBQVUsZUFBZSxLQUFLLEVBQUU7QUFDbEQsY0FBSSx3QkFBTywrQ0FBWSxLQUFLLElBQUksRUFBRTtBQUNsQyxlQUFLLE9BQU87QUFBQSxRQUNoQjtBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFFQSxVQUFVO0FBQUUsU0FBSyxVQUFVLE1BQU07QUFBQSxFQUFHO0FBQ3hDOzs7QUMzRUEsSUFBQUMsbUJBQXNCO0FBRXRCLElBQXFCLGlCQUFyQixjQUE0Qyx1QkFBTTtBQUFBLEVBQzlDLFlBQVksS0FBSyxRQUFRO0FBQUUsVUFBTSxHQUFHO0FBQUcsU0FBSyxTQUFTO0FBQVEsU0FBSyxpQkFBaUI7QUFBQSxFQUFNO0FBQUEsRUFDekYsU0FBUztBQUFFLFNBQUssT0FBTztBQUFBLEVBQUc7QUFBQSxFQUUxQixTQUFTO0FBTmI7QUFPUSxVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQU0sY0FBVSxNQUFNO0FBQUcsY0FBVSxTQUFTLG9CQUFvQjtBQUN0RixVQUFNLFdBQVMsVUFBSyxPQUFPLG9CQUFaLG1CQUE2QixPQUFNLENBQUM7QUFBRyxVQUFNLFdBQVcsT0FBTyxtQkFBbUI7QUFFakcsVUFBTSxXQUFXLE1BQU8sS0FBSyxPQUFPLE1BQU0sUUFBUSxLQUFLO0FBRXZELFVBQU0sU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDbkUsV0FBTyxTQUFTLE1BQU0sRUFBRSxNQUFNLFVBQVUsT0FBTyw4RUFBOEUsQ0FBQztBQUM5SCxXQUFPLFNBQVMsT0FBTyxFQUFFLE1BQU0saUJBQU8sS0FBSyxPQUFPLE1BQU0sS0FBSyw0Q0FBYyxRQUFRLElBQUksT0FBTywrQ0FBK0MsQ0FBQztBQUU5SSxVQUFNLFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQ2xFLFVBQU0sZ0JBQWdCLE9BQU8sU0FBUyxPQUFPLEVBQUUsS0FBSyx5QkFBeUIsQ0FBQztBQUM5RSxVQUFNLE9BQU8sY0FBYyxTQUFTLE9BQU8sRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUVsRSxVQUFNLFlBQVksS0FBSyxPQUFPLE1BQU0sYUFBYSxDQUFDO0FBQ2xELFVBQU0sZ0JBQWdCLE9BQU8sT0FBTyxLQUFLLE9BQU8sTUFBTSxhQUFhLENBQUMsQ0FBQztBQUVyRSxhQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsS0FBSztBQUMvQixZQUFNLE9BQU8sS0FBSyxTQUFTLE9BQU8sRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUV6RCxVQUFJLElBQUksVUFBVSxRQUFRO0FBQ3RCLGNBQU0sVUFBVSxVQUFVLENBQUM7QUFDM0IsY0FBTSxXQUFXLEtBQUssT0FBTyxjQUFjLElBQUksUUFBUSxFQUFFO0FBRXpELFlBQUksVUFBVTtBQUNWLGNBQUksU0FBUyxVQUFVO0FBRW5CLGtCQUFNLFVBQVUsR0FBRyxLQUFLLE9BQU8sU0FBUyxHQUFHLGNBQWMsU0FBUyxXQUFXLGVBQWUsU0FBUyxRQUFRO0FBQzdHLGtCQUFNLE1BQU0sS0FBSyxPQUFPLElBQUksTUFBTSxRQUFRLGdCQUFnQixPQUFPO0FBQ2pFLGtCQUFNLE1BQU0sS0FBSyxTQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBUyxFQUFFLENBQUM7QUFDdkQsZ0JBQUksVUFBVSxNQUFNO0FBQUUsa0JBQUksT0FBTztBQUFHLG1CQUFLLFlBQVksU0FBUyxhQUFhO0FBQUEsWUFBTTtBQUFBLFVBQ3JGLE9BQU87QUFBRSxpQkFBSyxZQUFZLFNBQVMsYUFBYSxTQUFTLFFBQVE7QUFBQSxVQUFNO0FBRXZFLGNBQUksUUFBUSxXQUFXLEVBQUcsTUFBSyxTQUFTLFFBQVEsRUFBRSxLQUFLLGdCQUFnQixNQUFNLElBQUksUUFBUSxRQUFRLEdBQUcsQ0FBQztBQUNyRyxjQUFJLEtBQUssbUJBQW1CLFFBQVEsR0FBSSxNQUFLLFNBQVMsVUFBVTtBQUNoRSxjQUFJLGNBQWMsU0FBUyxRQUFRLEVBQUUsRUFBRyxNQUFLLFNBQVMsVUFBVTtBQUVoRSxlQUFLLFVBQVUsTUFBTTtBQUFFLGlCQUFLLGlCQUFpQixRQUFRO0FBQUksaUJBQUssT0FBTztBQUFBLFVBQUc7QUFBQSxRQUM1RTtBQUFBLE1BQ0osT0FBTztBQUFFLGFBQUssU0FBUyxPQUFPO0FBQUEsTUFBRztBQUFBLElBQ3JDO0FBRUEsVUFBTSxVQUFVLE9BQU8sU0FBUyxPQUFPLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUVqRSxRQUFJLENBQUMsS0FBSyxnQkFBZ0I7QUFBRSxjQUFRLFNBQVMsT0FBTyxFQUFFLE1BQU0sbUZBQWtCLE9BQU8sdUZBQXVGLENBQUM7QUFBRztBQUFBLElBQVE7QUFFeEwsVUFBTSxrQkFBa0IsVUFBVSxLQUFLLE9BQUssRUFBRSxPQUFPLEtBQUssY0FBYztBQUN4RSxVQUFNLGVBQWUsS0FBSyxPQUFPLGNBQWMsSUFBSSxLQUFLLGNBQWM7QUFFdEUsUUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWM7QUFBRSxXQUFLLGlCQUFpQjtBQUFNLFdBQUssT0FBTztBQUFHO0FBQUEsSUFBUTtBQUU1RixVQUFNLGFBQWEsYUFBYSxVQUFVO0FBQzFDLFlBQVEsU0FBUyxjQUFjLFVBQVUsRUFBRTtBQUUzQyxVQUFNLFNBQVMsUUFBUSxTQUFTLE9BQU8sRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQ2xFLFFBQUksYUFBYSxVQUFVO0FBRXZCLFlBQU0sVUFBVSxHQUFHLEtBQUssT0FBTyxTQUFTLEdBQUcsY0FBYyxhQUFhLFdBQVcsZUFBZSxhQUFhLFFBQVE7QUFDckgsWUFBTSxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sUUFBUSxnQkFBZ0IsT0FBTztBQUNqRSxZQUFNLE1BQU0sT0FBTyxTQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBUyxHQUFHLE9BQU8sa0RBQWtELENBQUM7QUFDbkgsVUFBSSxVQUFVLE1BQU07QUFBRSxZQUFJLE9BQU87QUFBRyxlQUFPLFlBQVksYUFBYSxhQUFhO0FBQUEsTUFBTTtBQUFBLElBQzNGLE9BQU87QUFBRSxhQUFPLFlBQVksYUFBYSxhQUFhLGFBQWEsUUFBUTtBQUFBLElBQU07QUFFakYsWUFBUSxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixNQUFNLEdBQUcsYUFBYSxJQUFJLE1BQU0sZ0JBQWdCLFFBQVEsS0FBSyxPQUFPLDZEQUE2RCxDQUFDO0FBQ2xMLFlBQVEsU0FBUyxPQUFPLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxhQUFhLFlBQVksQ0FBQztBQUVuRixVQUFNLFVBQVUsUUFBUSxTQUFTLE9BQU8sRUFBRSxLQUFLLHNCQUFzQixDQUFDO0FBQ3RFLFVBQU0sYUFBYSxjQUFjLFNBQVMsZ0JBQWdCLEVBQUU7QUFFNUQsUUFBSSxhQUFhLFNBQVMsYUFBYTtBQUNuQyxVQUFJLFlBQVk7QUFDWixjQUFNLGFBQWEsUUFBUSxTQUFTLFVBQVUsRUFBRSxLQUFLLFdBQVcsTUFBTSxpQ0FBUSxDQUFDO0FBQy9FLG1CQUFXLFVBQVUsWUFBWTtBQUFFLGdCQUFNLEtBQUssT0FBTyxVQUFVLFlBQVksYUFBYSxTQUFTO0FBQUcsZUFBSyxPQUFPO0FBQUEsUUFBRztBQUFBLE1BQ3ZILE9BQU87QUFDSCxjQUFNLFdBQVcsUUFBUSxTQUFTLFVBQVUsRUFBRSxLQUFLLFdBQVcsTUFBTSx1Q0FBUyxDQUFDO0FBQzlFLGlCQUFTLFVBQVUsWUFBWTtBQUFFLGdCQUFNLEtBQUssT0FBTyxVQUFVLFVBQVUsYUFBYSxXQUFXLGdCQUFnQixFQUFFO0FBQUcsZUFBSyxPQUFPO0FBQUEsUUFBRztBQUFBLE1BQ3ZJO0FBQUEsSUFDSixPQUFPO0FBQ0gsWUFBTSxTQUFTLFFBQVEsU0FBUyxVQUFVLEVBQUUsS0FBSyxXQUFXLE1BQU0sT0FBTyxXQUFXLDJFQUFlLENBQUM7QUFDcEcsYUFBTyxVQUFVLFlBQVk7QUFDekIsY0FBTSxLQUFLLE9BQU8sVUFBVSxRQUFRLGdCQUFnQixJQUFJLFlBQVk7QUFDcEUsY0FBTSxRQUFRLEtBQUssT0FBTyxNQUFNLFVBQVUsS0FBSyxPQUFLLEVBQUUsT0FBTyxLQUFLLGNBQWM7QUFDaEYsWUFBSSxDQUFDLE1BQU8sTUFBSyxpQkFBaUI7QUFDbEMsYUFBSyxPQUFPO0FBQUEsTUFDaEI7QUFBQSxJQUNKO0FBRUEsUUFBSSxDQUFDLFlBQVk7QUFDYixZQUFNLFVBQVUsUUFBUSxTQUFTLFVBQVUsRUFBRSxLQUFLLFlBQVksTUFBTSxPQUFPLFlBQVkseURBQVksQ0FBQztBQUNwRyxjQUFRLFVBQVUsWUFBWTtBQUMxQixjQUFNLEtBQUssT0FBTyxVQUFVLFNBQVMsZ0JBQWdCLEVBQUU7QUFDdkQsY0FBTSxRQUFRLEtBQUssT0FBTyxNQUFNLFVBQVUsS0FBSyxPQUFLLEVBQUUsT0FBTyxLQUFLLGNBQWM7QUFDaEYsWUFBSSxDQUFDLE1BQU8sTUFBSyxpQkFBaUI7QUFDbEMsYUFBSyxPQUFPO0FBQUEsTUFDaEI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsVUFBVTtBQUFFLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFBRztBQUN4Qzs7O0FDeEdBLElBQUFDLG1CQUFzQjtBQUV0QixJQUFxQixpQkFBckIsY0FBNEMsdUJBQU07QUFBQSxFQUM5QyxZQUFZLEtBQUssUUFBUTtBQUFFLFVBQU0sR0FBRztBQUFHLFNBQUssU0FBUztBQUFBLEVBQVE7QUFBQSxFQUM3RCxTQUFTO0FBQUUsU0FBSyxPQUFPO0FBQUEsRUFBRztBQUFBLEVBRTFCLFNBQVM7QUFOYjtBQU9RLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFBTSxjQUFVLE1BQU07QUFBRyxjQUFVLFNBQVMsb0JBQW9CO0FBQ3RGLFVBQU0sSUFBSSxLQUFLO0FBQVEsVUFBTSxJQUFJLEVBQUU7QUFBa0IsVUFBTSxPQUFLLE9BQUUsb0JBQUYsbUJBQW1CLE9BQU0sRUFBRSxXQUFXLFlBQUs7QUFBRyxVQUFNLE1BQUksT0FBRSxvQkFBRixtQkFBbUIsZ0JBQWUsQ0FBQztBQUUzSixjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sMkVBQWtCLE9BQU8sbUVBQW1FLENBQUM7QUFDOUgsVUFBTSxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUVuRSxVQUFNLE9BQU8sT0FBTyxTQUFTLE9BQU8sRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQzVELFVBQU0sa0JBQWtCLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUV2RSxRQUFJLEVBQUUsa0JBQWtCO0FBQ3BCLFlBQU0sTUFBTSxnQkFBZ0IsU0FBUyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2pGLFVBQUksVUFBVSxNQUFNO0FBQ2hCLFlBQUksT0FBTztBQUNYLHdCQUFnQixZQUFZLEVBQUUsZUFBZTtBQUM3Qyx3QkFBZ0IsTUFBTSxXQUFXO0FBQUEsTUFDckM7QUFBQSxJQUNKLE9BQU87QUFDSCxzQkFBZ0IsWUFBWSxFQUFFLGVBQWU7QUFDN0Msc0JBQWdCLE1BQU0sV0FBVztBQUFBLElBQ3JDO0FBRUEsU0FBSyxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixPQUFNLHVCQUFHLFNBQVEscUVBQWMsQ0FBQztBQUU3RSxVQUFNLGVBQWUsS0FBSyxTQUFTLE9BQU8sRUFBRSxPQUFPLDBIQUEwSCxDQUFDO0FBQzlLLGlCQUFhLFNBQVMsT0FBTyxFQUFFLE1BQU0sR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFLE1BQU0sS0FBSyxLQUFLLEtBQUssTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLGFBQWEsT0FBTyxDQUFDO0FBQzVILGlCQUFhLFNBQVMsT0FBTyxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxLQUFLLElBQUksT0FBTyxrQkFBa0IsQ0FBQztBQUMxRyxpQkFBYSxTQUFTLE9BQU8sRUFBRSxNQUFNLHlDQUFXLEdBQUcsU0FBUyxJQUFJLEVBQUUsTUFBTSxLQUFLLEdBQUcsQ0FBQztBQUVqRixVQUFNLFFBQVEsS0FBSyxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQzVELFVBQU0sVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXRDLFVBQU0sYUFBYSxDQUFDLFVBQVUsY0FBYztBQUN4QyxZQUFNLFNBQVMsUUFBUSxRQUFRO0FBQy9CLFlBQU0sU0FBUyxNQUFNLFNBQVMsT0FBTyxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDOUQsVUFBSSxRQUFRO0FBQ1IsY0FBTSxXQUFXLEVBQUUsY0FBYyxJQUFJLE1BQU07QUFDM0MsWUFBSSxVQUFVO0FBQ1YsY0FBSSxTQUFTLFVBQVU7QUFFbkIsa0JBQU0sVUFBVSxHQUFHLEtBQUssT0FBTyxTQUFTLEdBQUcsY0FBYyxTQUFTLFdBQVcsZUFBZSxTQUFTLFFBQVE7QUFDN0csa0JBQU0sTUFBTSxLQUFLLE9BQU8sSUFBSSxNQUFNLFFBQVEsZ0JBQWdCLE9BQU87QUFDakUsa0JBQU0sTUFBTSxPQUFPLFNBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFTLEdBQUcsT0FBTywrQ0FBK0MsQ0FBQztBQUNoSCxnQkFBSSxVQUFVLE1BQU07QUFBRSxrQkFBSSxPQUFPO0FBQUcscUJBQU8sU0FBUyxRQUFRLEVBQUUsTUFBTSxTQUFTLGFBQWEsWUFBSyxDQUFDO0FBQUEsWUFBRztBQUFBLFVBQ3ZHLE9BQU87QUFBRSxtQkFBTyxTQUFTLFFBQVEsRUFBRSxNQUFNLFNBQVMsYUFBYSxTQUFTLFFBQVEsWUFBSyxDQUFDO0FBQUEsVUFBRztBQUN6RixpQkFBTyxTQUFTLFFBQVEsRUFBRSxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQy9DO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFDQSxhQUFPLFlBQVksR0FBRyxTQUFTO0FBQy9CLGFBQU8sTUFBTSxRQUFRO0FBQUEsSUFDekI7QUFFQSxlQUFXLFFBQVEsc0NBQVE7QUFBRyxlQUFXLFFBQVEsZ0NBQU87QUFBRyxlQUFXLFVBQVUsc0NBQVE7QUFBRyxlQUFXLGFBQWEsd0RBQVc7QUFFOUgsVUFBTSxRQUFRLE9BQU8sU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUM5RCxVQUFNLFlBQVksRUFBRSxLQUFLLGtCQUFrQjtBQUMzQyxVQUFNLFlBQVksVUFBVTtBQUM1QixVQUFNLFdBQVcsVUFBVTtBQUUzQixVQUFNLGNBQWM7QUFBQSxNQUNoQixFQUFFLEtBQUssS0FBSyxNQUFNLHVDQUFtQixNQUFNLDZHQUE2QjtBQUFBLE1BQ3hFLEVBQUUsS0FBSyxLQUFLLE1BQU0sNkVBQTJCLE1BQU0scUhBQTJCO0FBQUEsTUFDOUUsRUFBRSxLQUFLLEtBQUssTUFBTSx3RkFBNEIsTUFBTSxxS0FBbUM7QUFBQSxNQUN2RixFQUFFLEtBQUssS0FBSyxNQUFNLHlEQUFzQixNQUFNLHdIQUFtQztBQUFBLE1BQ2pGLEVBQUUsS0FBSyxLQUFLLE1BQU0seUVBQTRCLE1BQU0sK0dBQTBCO0FBQUEsTUFDOUUsRUFBRSxLQUFLLEtBQUssTUFBTSw4REFBc0IsTUFBTSx1S0FBMEM7QUFBQSxNQUN4RixFQUFFLEtBQUssS0FBSyxNQUFNLHlDQUFnQixNQUFNLG9KQUFpQztBQUFBLElBQzdFO0FBRUEsZ0JBQVksUUFBUSxVQUFRO0FBQ3hCLFlBQU0sTUFBTSxNQUFNLFNBQVMsT0FBTyxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDOUQsWUFBTSxPQUFPLElBQUksU0FBUyxPQUFPLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUM5RCxXQUFLLFNBQVMsT0FBTyxFQUFFLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxLQUFLLENBQUM7QUFDbkUsV0FBSyxTQUFTLE9BQU8sRUFBRSxLQUFLLHNCQUFzQixNQUFNLEtBQUssS0FBSyxDQUFDO0FBRW5FLFlBQU0sZUFBZSxJQUFJLFNBQVMsT0FBTyxFQUFFLE9BQU8scUJBQXFCLENBQUM7QUFDeEUsWUFBTSxVQUFVLFVBQVUsS0FBSyxHQUFHLEtBQUs7QUFDdkMsWUFBTSxTQUFTLFNBQVMsS0FBSyxHQUFHLEtBQUs7QUFDckMsWUFBTSxPQUFPLFNBQVM7QUFFdEIsbUJBQWEsU0FBUyxRQUFRLEVBQUUsS0FBSyxxQkFBcUIsTUFBTSxRQUFRLFNBQVMsRUFBRSxDQUFDO0FBRXBGLFVBQUksT0FBTyxHQUFHO0FBQ1YscUJBQWEsU0FBUyxRQUFRLEVBQUUsTUFBTSxNQUFNLElBQUksS0FBSyxPQUFPLHVEQUF1RCxDQUFDO0FBQUEsTUFDeEgsV0FBVyxPQUFPLEdBQUc7QUFDakIscUJBQWEsU0FBUyxRQUFRLEVBQUUsTUFBTSxLQUFLLElBQUksS0FBSyxPQUFPLHVEQUF1RCxDQUFDO0FBQUEsTUFDdkg7QUFBQSxJQUNKLENBQUM7QUFFRCxjQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssbUJBQW1CLE1BQU0sK3JCQUF3SyxDQUFDO0FBQUEsRUFDdk87QUFBQSxFQUNBLFVBQVU7QUFBRSxTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQUc7QUFDeEM7OztBQ25HQSxJQUFBQyxtQkFBOEI7QUFFOUIsSUFBcUIsaUJBQXJCLGNBQTRDLHVCQUFNO0FBQUEsRUFDOUMsWUFBWSxLQUFLLFFBQVEsZUFBZTtBQUNwQyxVQUFNLEdBQUc7QUFDVCxTQUFLLFNBQVM7QUFDZCxTQUFLLFlBQVk7QUFBQSxFQUNyQjtBQUFBLEVBRUEsU0FBUztBQUNMLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyxvQkFBb0I7QUFHdkMsY0FBVSxTQUFTLE9BQU87QUFBQSxNQUN0QixNQUFNLEtBQUssVUFBVSxRQUFRO0FBQUEsTUFDN0IsT0FBTztBQUFBLElBQ1gsQ0FBQztBQUVELGNBQVUsU0FBUyxNQUFNO0FBQUEsTUFDckIsTUFBTSxLQUFLLFVBQVU7QUFBQSxNQUNyQixPQUFPO0FBQUEsSUFDWCxDQUFDO0FBR0QsY0FBVSxTQUFTLEtBQUs7QUFBQSxNQUNwQixNQUFNLEtBQUssVUFBVTtBQUFBLE1BQ3JCLE9BQU87QUFBQSxJQUNYLENBQUM7QUFHRCxVQUFNLGFBQWEsVUFBVSxTQUFTLE9BQU8sRUFBRSxPQUFPLHFEQUFxRCxDQUFDO0FBRTVHLFNBQUssVUFBVSxRQUFRLFFBQVEsWUFBVTtBQUNyQyxZQUFNLE1BQU0sV0FBVyxTQUFTLFVBQVU7QUFBQSxRQUN0QyxNQUFNLE9BQU87QUFBQSxRQUNiLE9BQU87QUFBQSxNQUNYLENBQUM7QUFFRCxVQUFJLGNBQWMsTUFBTTtBQUFFLFlBQUksTUFBTSxjQUFjO0FBQUEsTUFBNkI7QUFDL0UsVUFBSSxhQUFhLE1BQU07QUFBRSxZQUFJLE1BQU0sY0FBYztBQUFBLE1BQXFDO0FBRXRGLFVBQUksVUFBVSxZQUFZO0FBQ3RCLGNBQU0sS0FBSyxnQkFBZ0IsT0FBTyxRQUFRO0FBQzFDLGFBQUssTUFBTTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFFQSxNQUFNLGdCQUFnQixVQUFVO0FBbERwQztBQW1EUSxlQUFXLFdBQVcsVUFBVTtBQUM1QixjQUFRLFFBQVEsTUFBTTtBQUFBLFFBQ2xCLEtBQUs7QUFDRCxnQkFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLFFBQVEsS0FBSztBQUMzQztBQUFBLFFBQ0osS0FBSztBQUNELGdCQUFNLEtBQUssT0FBTyxLQUFLLE9BQU8sUUFBUSxLQUFLO0FBQzNDO0FBQUEsUUFDSixLQUFLO0FBQ0QsZ0JBQU0sS0FBSyxPQUFPLEtBQUssVUFBVSxRQUFRLEtBQUs7QUFDOUM7QUFBQSxRQUNKLEtBQUs7QUFDRCxnQkFBTSxLQUFLLE9BQU8sS0FBSyxVQUFVLFFBQVEsS0FBSztBQUM5QztBQUFBLFFBQ0osS0FBSztBQUNELGVBQUssT0FBTyxNQUFNLEtBQUssS0FBSyxJQUFJLEtBQUssT0FBTyxNQUFNLE9BQU8sS0FBSyxPQUFPLE1BQU0sS0FBSyxRQUFRLEtBQUs7QUFDN0Y7QUFBQSxRQUNKLEtBQUs7QUFDRCxlQUFLLE9BQU8sTUFBTSxNQUFNLFFBQVE7QUFDaEMsY0FBSSxLQUFLLE9BQU8sTUFBTSxNQUFNLEdBQUc7QUFDM0Isa0JBQU0sY0FBWSxVQUFLLE9BQU8sb0JBQVosbUJBQTZCLGNBQWEsRUFBRSxtQkFBbUIsSUFBSSxxQkFBcUIsR0FBRztBQUM3RyxrQkFBTSxLQUFLLE9BQU8sS0FBSyxJQUFJLFNBQVM7QUFBQSxVQUN4QztBQUNBO0FBQUEsUUFDSixLQUFLO0FBQ0QsZ0JBQU0sS0FBSyxPQUFPLEtBQUssU0FBUyxRQUFRLEtBQUs7QUFDN0M7QUFBQSxRQUNKLEtBQUs7QUFDRCxnQkFBTSxLQUFLLE9BQU8sS0FBSyxTQUFTLFFBQVEsS0FBSztBQUM3QztBQUFBLFFBQ0osS0FBSztBQUNELGNBQUksd0JBQU8sYUFBTSxRQUFRLElBQUksSUFBSSxHQUFJO0FBQ3JDLGNBQUksS0FBSyxPQUFPLEdBQUksTUFBSyxPQUFPLEdBQUcsWUFBWSxRQUFRLElBQUk7QUFDM0Q7QUFBQSxNQUNSO0FBQUEsSUFDSjtBQUNBLFVBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxFQUNuQztBQUFBLEVBRUEsVUFBVTtBQUFFLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFBRztBQUN4Qzs7O0FDM0ZBLElBQUFDLG1CQUF1QjtBQUV2QixJQUFxQixhQUFyQixNQUFnQztBQUFBLEVBQzVCLFlBQVksUUFBUTtBQUNoQixTQUFLLFNBQVM7QUFBQSxFQUNsQjtBQUFBLEVBRUEsSUFBSSxRQUFRO0FBQUUsV0FBTyxLQUFLLE9BQU87QUFBQSxFQUFPO0FBQUEsRUFFeEMsb0JBQW9CO0FBQ2hCLFVBQU0sWUFBWSxLQUFLLE1BQU0sU0FBUyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUNqRixVQUFNLGlCQUFpQixFQUFFLEdBQUcsVUFBVTtBQUN0QyxVQUFNLFlBQVksS0FBSyxNQUFNLGFBQWEsQ0FBQztBQUczQyxlQUFXLFVBQVUsV0FBVztBQUM1QixZQUFNLFNBQVMsVUFBVSxNQUFNO0FBQy9CLFVBQUksUUFBUTtBQUNSLGNBQU0sV0FBVyxLQUFLLE9BQU8sY0FBYyxJQUFJLE1BQU07QUFDckQsWUFBSSxZQUFZLFNBQVMsYUFBYTtBQUNsQyxxQkFBVyxDQUFDLE1BQU0sS0FBSyxLQUFLLE9BQU8sUUFBUSxTQUFTLFdBQVcsR0FBRztBQUM5RCwyQkFBZSxJQUFJLEtBQUssZUFBZSxJQUFJLEtBQUssS0FBSztBQUFBLFVBQ3pEO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsV0FBTyxFQUFFLE1BQU0sV0FBVyxXQUFXLGVBQWU7QUFBQSxFQUN4RDtBQUFBO0FBQUEsRUFFQSxtQkFBbUI7QUE3QnZCO0FBOEJRLFVBQU0sV0FBUyxVQUFLLE9BQU8scUJBQVosbUJBQThCLFVBQVM7QUFDdEQsVUFBTSxXQUFXLEtBQUssa0JBQWtCLEVBQUU7QUFDMUMsVUFBTSxpQkFBaUIsU0FBUyxHQUFHLEtBQUssS0FBSztBQUU3QyxTQUFLLE1BQU0sUUFBUSxTQUFTO0FBQzVCLFFBQUksS0FBSyxNQUFNLEtBQUssS0FBSyxNQUFNLE1BQU8sTUFBSyxNQUFNLEtBQUssS0FBSyxNQUFNO0FBQUEsRUFDckU7QUFBQSxFQUVBLGFBQWE7QUFDVCxVQUFNLElBQUksS0FBSyxPQUFPO0FBQ3RCLFVBQU0sY0FBYyxLQUFLLE1BQU0sUUFBUTtBQUN2QyxVQUFNLGtCQUFpQix1QkFBRyxZQUFXLEVBQUUsV0FBVyxDQUFDLHlEQUFZLEdBQUcsYUFBYSxxREFBYSxVQUFVLDhFQUFrQixPQUFPLDJEQUFjO0FBQzdJLFFBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxZQUFZLEVBQUUsU0FBUyxXQUFXLEVBQUcsUUFBTyxFQUFFLFNBQVMsZ0JBQWdCLGNBQWEsdUJBQUcsZ0JBQWUsWUFBSztBQUV4SCxVQUFNLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxZQUFZLEVBQUUsU0FBUztBQUN2RSxhQUFTLFdBQVcsUUFBUTtBQUN4QixVQUFJLGVBQWUsUUFBUSxXQUFXO0FBQ2xDLFlBQUksQ0FBQyxRQUFRLFFBQVMsU0FBUSxVQUFVO0FBQ3hDLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFVBQU0sT0FBTyxPQUFPLE9BQU8sU0FBUyxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxLQUFLLFFBQVMsTUFBSyxVQUFVO0FBQ2xDLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxNQUFNLFNBQVMsUUFBUTtBQUFFLFNBQUssTUFBTSxPQUFPLEtBQUssSUFBSSxNQUFNLEtBQUssTUFBTSxRQUFRLEtBQUssTUFBTTtBQUFBLEVBQUc7QUFBQSxFQUMzRixNQUFNLFNBQVMsUUFBUTtBQUFFLFNBQUssTUFBTSxPQUFPLEtBQUssSUFBSSxJQUFJLEtBQUssTUFBTSxRQUFRLEtBQUssTUFBTTtBQUFBLEVBQUc7QUFBQSxFQUV6RixNQUFNLHFCQUFxQixhQUFhLFdBQVcsSUFBSTtBQTNEM0Q7QUE0RFEsVUFBTSxRQUFRLE9BQU8sT0FBTyxFQUFFLE9BQU8sWUFBWTtBQUNqRCxRQUFJLENBQUMsS0FBSyxPQUFPLEtBQUssUUFBUSxLQUFLLEVBQUcsTUFBSyxPQUFPLEtBQUssUUFBUSxLQUFLLElBQUk7QUFFeEUsUUFBSSxXQUFXO0FBQUksUUFBSSxhQUFhO0FBQ3BDLFVBQU0sY0FBWSxVQUFLLE9BQU8sb0JBQVosbUJBQTZCLGNBQWEsQ0FBQztBQUM3RCxlQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssT0FBTyxRQUFRLFNBQVMsR0FBRztBQUNsRCxVQUFJLFNBQVMsU0FBUyxHQUFHLEdBQUc7QUFBRSxtQkFBVyxLQUFLLE1BQU0sV0FBVyxNQUFNLEVBQUU7QUFBRyxxQkFBYSxLQUFLLE1BQU0sYUFBYSxNQUFNLEtBQUs7QUFBRztBQUFBLE1BQU87QUFBQSxJQUN4STtBQUVBLFFBQUksYUFBYTtBQUNqQixVQUFNLE9BQU8sU0FBUyxNQUFNLHlCQUF5QixLQUFLLENBQUM7QUFDM0QsVUFBTSxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRztBQUV0RCxRQUFJLGFBQWE7QUFDYixlQUFTLE9BQU8sTUFBTTtBQUNsQixjQUFNLGNBQWMsSUFBSSxPQUFPLENBQUM7QUFDaEMsWUFBSSxZQUFZLFNBQVMsV0FBVyxHQUFHO0FBRW5DLGNBQUksZ0JBQWdCLE9BQU8sS0FBSyxNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUk7QUFDeEQsY0FBSSxnQkFBZ0IsT0FBTyxLQUFLLE1BQU0sTUFBTSxHQUFHLEtBQUssR0FBSTtBQUN4RCxlQUFLLE1BQU0sTUFBTSxXQUFXO0FBQUssdUJBQWE7QUFBYTtBQUFBLFFBQy9EO0FBQUEsTUFDSjtBQUFBLElBQ0osT0FBTztBQUNILGVBQVMsT0FBTyxNQUFNO0FBQ2xCLGNBQU0sY0FBYyxJQUFJLE9BQU8sQ0FBQztBQUNoQyxZQUFJLFlBQVksU0FBUyxXQUFXLEdBQUc7QUFBRSxlQUFLLE1BQU0sTUFBTSxXQUFXLElBQUksS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLE1BQU0sV0FBVyxJQUFJLENBQUM7QUFBRztBQUFBLFFBQU87QUFBQSxNQUNwSTtBQUFBLElBQ0o7QUFFQSxTQUFLLGlCQUFpQjtBQUN0QixVQUFNLFdBQVcsS0FBSyxrQkFBa0IsRUFBRTtBQUUxQyxRQUFJLGFBQWE7QUFDYixXQUFLLE9BQU8sS0FBSyxRQUFRLEtBQUs7QUFDOUIsWUFBTSxLQUFLLFNBQVMsQ0FBQztBQUVyQixZQUFNLFNBQVMsS0FBTSxTQUFTLEdBQUcsS0FBSyxLQUFLO0FBQzNDLFlBQU0sU0FBUyxLQUFNLFNBQVMsR0FBRyxLQUFLLEtBQUs7QUFDM0MsWUFBTSxLQUFLLE9BQU8sS0FBSyxNQUFNLFdBQVcsTUFBTSxDQUFDO0FBQy9DLFlBQU0sS0FBSyxVQUFVLEtBQUssTUFBTSxhQUFhLE1BQU0sQ0FBQztBQUVwRCxVQUFJLGFBQWEsU0FBUyxHQUFHLEtBQUs7QUFBRyxVQUFJLGNBQWM7QUFHdkQsWUFBTSxlQUFhLFVBQUssT0FBTyxvQkFBWixtQkFBNkIsZUFBYyxDQUFDO0FBRy9ELFlBQU0sbUJBQW1CO0FBRXpCLFVBQUksV0FBVyxTQUFTLEtBQUssS0FBSyxPQUFPLElBQUksTUFBTSxrQkFBa0I7QUFFakUsY0FBTSxrQkFBa0IsV0FBVyxLQUFLLE1BQU0sS0FBSyxPQUFPLElBQUksV0FBVyxNQUFNLENBQUM7QUFHaEYsYUFBSyxPQUFPLGlCQUFpQixlQUFlO0FBQUEsTUFDaEQ7QUFFQSxhQUFPLGNBQWMsS0FBSztBQUFFO0FBQWUsc0JBQWM7QUFBQSxNQUFLO0FBQzlELFVBQUksS0FBSyxPQUFPLElBQUksTUFBTSxXQUFZO0FBRXRDLFlBQU0sY0FBWSxVQUFLLE9BQU8sb0JBQVosbUJBQTZCLFVBQVMsQ0FBQztBQUN6RCxVQUFJLGNBQWMsS0FBSyxVQUFVLFNBQVMsR0FBRztBQUN6QyxpQkFBUyxJQUFJLEdBQUcsSUFBSSxhQUFhLEtBQUs7QUFDbEMsZ0JBQU0sYUFBYSxVQUFVLEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxVQUFVLE1BQU0sQ0FBQztBQUN6RSxnQkFBTSxLQUFLLE9BQU8sVUFBVSxlQUFlLFdBQVcsRUFBRTtBQUN4RCxjQUFJLHdCQUFPLDBGQUF1QixXQUFXLElBQUksRUFBRTtBQUFBLFFBQ3ZEO0FBQUEsTUFDSjtBQUVBLFlBQU0sVUFBVSxLQUFLLFdBQVc7QUFDaEMsVUFBSSxjQUFjLEtBQUssT0FBTyxHQUFJLE1BQUssT0FBTyxHQUFHLFlBQVksa0hBQXdCLFVBQVUsaUVBQWU7QUFBQSxlQUNyRyxTQUFTLFNBQVMsT0FBTyxLQUFLLEtBQUssT0FBTyxHQUFJLE1BQUssT0FBTyxHQUFHLFlBQVksdUpBQStCO0FBQUEsZUFDeEcsS0FBSyxPQUFPLElBQUk7QUFDckIsY0FBTSxnQkFBYyxhQUFRLFlBQVIsbUJBQWlCLGNBQWEsQ0FBQyx5REFBWTtBQUMvRCxhQUFLLE9BQU8sR0FBRyxZQUFZLFlBQVksS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFlBQVksTUFBTSxDQUFDLENBQUM7QUFBQSxNQUMxRjtBQUFBLElBQ0osT0FBTztBQUNILFdBQUssT0FBTyxLQUFLLFFBQVEsS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHLEtBQUssT0FBTyxLQUFLLFFBQVEsS0FBSyxJQUFJLENBQUM7QUFDakYsWUFBTSxLQUFLLE9BQU8sUUFBUTtBQUFHLFlBQU0sS0FBSyxVQUFVLFVBQVU7QUFBRyxZQUFNLEtBQUssU0FBUyxFQUFFO0FBQ3JGLFVBQUksS0FBSyxPQUFPLElBQUk7QUFDaEIsY0FBTSxVQUFVLEtBQUssV0FBVztBQUNoQyxhQUFLLE9BQU8sR0FBRyxjQUFZLGFBQVEsWUFBUixtQkFBaUIsZ0JBQWUsbURBQVc7QUFBQSxNQUMxRTtBQUFBLElBQ0o7QUFDQSxVQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsRUFDbkM7QUFBQSxFQUVBLE1BQU0sbUJBQW1CO0FBcEo3QjtBQXFKUSxVQUFNLFdBQVcsT0FBTyxPQUFPLEVBQUUsT0FBTyxZQUFZO0FBQ3BELFFBQUksS0FBSyxNQUFNLG9CQUFvQixTQUFVO0FBRTdDLFFBQUksY0FBWSxVQUFLLE9BQU8sb0JBQVosbUJBQTZCLGNBQWEsRUFBRSxlQUFlLEdBQUcsbUJBQW1CLElBQUkscUJBQXFCLEdBQUc7QUFDN0gsUUFBSSxZQUFZLE9BQU8sT0FBTyxLQUFLLE1BQU0sZUFBZSxFQUFFLElBQUksR0FBRyxNQUFNO0FBQ3ZFLFFBQUksZUFBZTtBQUFHLFFBQUksYUFBYTtBQUV2QyxVQUFNLFdBQVcsS0FBSyxrQkFBa0IsRUFBRTtBQUMxQyxRQUFJLFlBQVksS0FBSyxJQUFJLEdBQUcsVUFBVSxpQkFBaUIsU0FBUyxHQUFHLEtBQUssRUFBRTtBQUUxRSxXQUFPLFVBQVUsT0FBTyxZQUFZLElBQUksVUFBVTtBQUM5QyxZQUFNLE9BQU8sVUFBVSxPQUFPLFlBQVk7QUFDMUMsVUFBSSxHQUFDLFVBQUssT0FBTyxLQUFLLFlBQWpCLG1CQUEyQixVQUFTLEtBQUssT0FBTyxLQUFLLFFBQVEsSUFBSSxNQUFNLEdBQUc7QUFBRSx3QkFBZ0I7QUFBVztBQUFjLGNBQU0sS0FBSyxTQUFTLEVBQUU7QUFBQSxNQUFHO0FBQ25KLGdCQUFVLElBQUksR0FBRyxNQUFNO0FBQUEsSUFDM0I7QUFDQSxTQUFLLE1BQU0sa0JBQWtCO0FBRTdCLFFBQUksZUFBZSxHQUFHO0FBQ2xCLFlBQU0sY0FBYyxLQUFLLElBQUksS0FBSyxTQUFTLEdBQUcsS0FBSyxLQUFLLENBQUM7QUFDekQsVUFBSSxLQUFLLE9BQU8sSUFBSSxNQUFNLFlBQWEsS0FBSSx3QkFBTyx1RkFBb0IsVUFBVSxzTkFBNEM7QUFBQSxXQUN2SDtBQUNELGFBQUssTUFBTSxNQUFNO0FBQ2pCLFlBQUksS0FBSyxNQUFNLE1BQU0sRUFBRyxPQUFNLEtBQUssSUFBSSxTQUFTO0FBQUEsWUFDM0MsS0FBSSx3QkFBTyw2RUFBaUIsVUFBVSwrRUFBbUIsWUFBWSxNQUFNO0FBQUEsTUFDcEY7QUFBQSxJQUNKO0FBQ0EsVUFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLEVBQ25DO0FBQUEsRUFFQSxNQUFNLElBQUksV0FBVztBQWxMekI7QUFtTFEsVUFBTSxTQUFTLEtBQUssTUFBTSxLQUFLLE1BQU0sTUFBTSxVQUFVLG9CQUFvQixJQUFJO0FBQUcsVUFBTSxXQUFXLEtBQUssTUFBTSxLQUFLLE1BQU0sU0FBUyxVQUFVLHNCQUFzQixJQUFJO0FBQ3BLLFNBQUssTUFBTSxLQUFLLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxLQUFLLE1BQU07QUFBRyxTQUFLLE1BQU0sUUFBUSxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sUUFBUSxRQUFRO0FBQUcsU0FBSyxNQUFNLEtBQUssS0FBSyxNQUFNO0FBQzdJLFVBQU0sVUFBVSxLQUFLLFdBQVc7QUFBRyxVQUFNLGFBQVcsYUFBUSxZQUFSLG1CQUFpQixVQUFTO0FBQzlFLFFBQUksd0JBQU87QUFBQSx1REFBK0IsTUFBTSwyQ0FBYSxRQUFRLEVBQUU7QUFDdkUsUUFBSSxLQUFLLE9BQU8sR0FBSSxNQUFLLE9BQU8sR0FBRyxZQUFZLFFBQVE7QUFBQSxFQUMzRDtBQUFBLEVBRUEsTUFBTSxPQUFPLFFBQVE7QUExTHpCO0FBMkxRLFNBQUssTUFBTSxNQUFNO0FBQ2pCLFFBQUksS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLGVBQWU7QUFDM0MsV0FBSyxNQUFNO0FBQVMsV0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNO0FBQWUsV0FBSyxNQUFNLGlCQUFpQjtBQUFLLFdBQUssTUFBTSxLQUFLLEtBQUssTUFBTTtBQUMzSCxZQUFNLFVBQVUsS0FBSyxXQUFXO0FBQ2hDLFVBQUksS0FBSyxPQUFPLFFBQU0sYUFBUSxZQUFSLG1CQUFpQixVQUFVLE1BQUssT0FBTyxHQUFHLFlBQVksUUFBUSxRQUFRLFNBQVMsUUFBUSxXQUFXLEtBQUssTUFBTSxLQUFLLENBQUM7QUFBQSxJQUM3STtBQUFBLEVBQ0o7QUFBQSxFQUNBLE1BQU0sVUFBVSxRQUFRO0FBQUUsU0FBSyxNQUFNLFNBQVM7QUFBQSxFQUFRO0FBQUEsRUFDdEQsTUFBTSxPQUFPLFFBQVE7QUFDakIsU0FBSyxNQUFNLE1BQU07QUFDakIsUUFBSSxLQUFLLE1BQU0sS0FBSyxHQUFHO0FBQ25CLFVBQUksS0FBSyxNQUFNLFFBQVEsR0FBRztBQUFFLGFBQUssTUFBTTtBQUFTLGFBQUssTUFBTSxnQkFBZ0IsS0FBSyxJQUFJLEtBQU0sS0FBSyxNQUFNLGdCQUFnQixHQUFHO0FBQUcsYUFBSyxNQUFNLEtBQUssS0FBSyxNQUFNLGdCQUFnQixLQUFLLE1BQU07QUFBQSxNQUFJLE9BQ2hMO0FBQUUsYUFBSyxNQUFNLEtBQUs7QUFBQSxNQUFHO0FBQUEsSUFDOUI7QUFBQSxFQUNKO0FBQUEsRUFDQSxNQUFNLFVBQVUsUUFBUTtBQUFFLFNBQUssTUFBTSxRQUFRLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxRQUFRLE1BQU07QUFBQSxFQUFHO0FBQ3pGOzs7QUMzTUEsSUFBQUMsbUJBQXVCO0FBRXZCLElBQXFCLG1CQUFyQixNQUFzQztBQUFBLEVBQ2xDLFlBQVksUUFBUTtBQUNoQixTQUFLLFNBQVM7QUFBQSxFQUNsQjtBQUFBLEVBRUEsSUFBSSxRQUFRO0FBQUUsV0FBTyxLQUFLLE9BQU87QUFBQSxFQUFPO0FBQUEsRUFFeEMsTUFBTSxVQUFVLFFBQVEsUUFBUTtBQUM1QixRQUFJLENBQUMsS0FBSyxNQUFNLFVBQVcsTUFBSyxNQUFNLFlBQVksRUFBRSxNQUFNLE1BQU0sTUFBTSxNQUFNLFFBQVEsTUFBTSxXQUFXLEtBQUs7QUFDMUcsU0FBSyxNQUFNLFVBQVUsTUFBTSxJQUFJO0FBQy9CLFNBQUssT0FBTyxLQUFLLGlCQUFpQjtBQUNsQyxVQUFNLEtBQUssT0FBTyxhQUFhO0FBRy9CLFVBQU0sV0FBVyxLQUFLLE9BQU8sY0FBYyxJQUFJLE1BQU07QUFDckQsVUFBTSxVQUFTLHFDQUFVLGVBQWMsaURBQWEscUNBQVUsU0FBUSw0Q0FBUztBQUMvRSxRQUFJLEtBQUssT0FBTyxHQUFJLE1BQUssT0FBTyxHQUFHLFlBQVksTUFBTTtBQUVyRCxRQUFJLHdCQUFPLDRFQUFnQjtBQUFBLEVBQy9CO0FBQUEsRUFFQSxNQUFNLFlBQVksUUFBUTtBQUN0QixVQUFNLFNBQVMsS0FBSyxNQUFNLFlBQVksS0FBSyxNQUFNLFVBQVUsTUFBTSxJQUFJO0FBQ3JFLFFBQUksS0FBSyxNQUFNLFVBQVcsTUFBSyxNQUFNLFVBQVUsTUFBTSxJQUFJO0FBQ3pELFNBQUssT0FBTyxLQUFLLGlCQUFpQjtBQUNsQyxVQUFNLEtBQUssT0FBTyxhQUFhO0FBRy9CLFVBQU0sV0FBVyxTQUFTLEtBQUssT0FBTyxjQUFjLElBQUksTUFBTSxJQUFJO0FBQ2xFLFFBQUksS0FBSyxPQUFPLE1BQU0sU0FBVSxNQUFLLE9BQU8sR0FBRyxZQUFZLDBDQUFZLFNBQVMsSUFBSSxHQUFHO0FBRXZGLFFBQUksd0JBQU8sc0VBQWU7QUFBQSxFQUM5QjtBQUFBLEVBRUEsTUFBTSxlQUFlLFFBQVE7QUFDekIsUUFBSSxDQUFDLEtBQUssTUFBTSxVQUFXLE1BQUssTUFBTSxZQUFZLENBQUM7QUFDbkQsVUFBTSxXQUFXLEtBQUssTUFBTSxVQUFVLEtBQUssT0FBSyxFQUFFLE9BQU8sTUFBTTtBQUMvRCxRQUFJLFNBQVUsVUFBUztBQUFBLFFBQ2xCLE1BQUssTUFBTSxVQUFVLEtBQUssRUFBRSxJQUFJLFFBQVEsVUFBVSxFQUFFLENBQUM7QUFDMUQsVUFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLEVBQ25DO0FBQUEsRUFFQSxNQUFNLFFBQVEsUUFBUSxVQUFVO0FBNUNwQztBQTZDUSxRQUFJLENBQUMsS0FBSyxNQUFNLFVBQVc7QUFDM0IsVUFBTSxXQUFXLEtBQUssTUFBTSxVQUFVLEtBQUssT0FBSyxFQUFFLE9BQU8sTUFBTTtBQUMvRCxRQUFJLENBQUMsWUFBWSxTQUFTLFlBQVksRUFBRztBQUd6QyxRQUFJLFNBQVMsU0FBUyxhQUFhLFNBQVMsY0FBYztBQUN0RCxZQUFNLFNBQVMsU0FBUyxjQUFjO0FBQ3RDLFVBQUksS0FBSyxPQUFPLEdBQUksTUFBSyxPQUFPLEdBQUcsWUFBWSxNQUFNO0FBRXJELFlBQU0sS0FBSyxZQUFZLFNBQVMsWUFBWTtBQUM1QyxlQUFTO0FBQ1QsVUFBSSxTQUFTLFlBQVksRUFBRyxNQUFLLE1BQU0sWUFBWSxLQUFLLE1BQU0sVUFBVSxPQUFPLE9BQUssRUFBRSxPQUFPLE1BQU07QUFDbkcsWUFBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQjtBQUFBLElBQ0o7QUFHQSxRQUFJLFNBQVMsV0FBVyxNQUFNLFFBQVEsU0FBUyxPQUFPLEdBQUc7QUFDckQsZUFBUyxVQUFVLFNBQVMsU0FBUztBQUNqQyxnQkFBUSxPQUFPLE1BQU07QUFBQSxVQUNqQixLQUFLO0FBQVcsaUJBQUssTUFBTSxLQUFLLEtBQUssSUFBSSxLQUFLLE1BQU0sT0FBTyxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUs7QUFBRztBQUFBLFVBQzFGLEtBQUs7QUFDRCxpQkFBSyxNQUFNLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLO0FBQ3hELGdCQUFJLEtBQUssTUFBTSxPQUFPLEVBQUcsT0FBTSxLQUFLLE9BQU8sS0FBSyxNQUFJLFVBQUssT0FBTyxvQkFBWixtQkFBNkIsY0FBYSxFQUFFLG1CQUFtQixJQUFJLHFCQUFxQixHQUFHLENBQUM7QUFDaEo7QUFBQSxVQUNKLEtBQUs7QUFBVyxrQkFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLE9BQU8sS0FBSztBQUFHO0FBQUEsVUFDN0QsS0FBSztBQUFXLGtCQUFNLEtBQUssT0FBTyxLQUFLLE9BQU8sT0FBTyxLQUFLO0FBQUc7QUFBQSxVQUM3RCxLQUFLO0FBQWMsa0JBQU0sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUs7QUFBRztBQUFBLFVBQ25FLEtBQUs7QUFBYyxrQkFBTSxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSztBQUFHO0FBQUEsVUFDbkUsS0FBSztBQUFhLGtCQUFNLEtBQUssT0FBTyxLQUFLLFNBQVMsT0FBTyxLQUFLO0FBQUc7QUFBQSxVQUNqRSxLQUFLO0FBQWEsa0JBQU0sS0FBSyxPQUFPLEtBQUssU0FBUyxPQUFPLEtBQUs7QUFBRztBQUFBLFFBQ3JFO0FBQUEsTUFDSjtBQUdBLFlBQU0sU0FBUyxTQUFTLGNBQWMsbUZBQWtCLFNBQVMsSUFBSTtBQUNyRSxVQUFJLEtBQUssT0FBTyxHQUFJLE1BQUssT0FBTyxHQUFHLFlBQVksTUFBTTtBQUFBLElBQ3pEO0FBRUEsYUFBUztBQUNULFFBQUksU0FBUyxZQUFZLEVBQUcsTUFBSyxNQUFNLFlBQVksS0FBSyxNQUFNLFVBQVUsT0FBTyxPQUFLLEVBQUUsT0FBTyxNQUFNO0FBQ25HLFVBQU0sS0FBSyxPQUFPLGFBQWE7QUFDL0IsUUFBSSx3QkFBTyw2RUFBaUIsU0FBUyxJQUFJLEVBQUU7QUFBQSxFQUMvQztBQUFBO0FBQUEsRUFHQSxNQUFNLFlBQVksYUFBYTtBQTNGbkM7QUE0RlEsVUFBTSxrQkFBZ0IsVUFBSyxPQUFPLG9CQUFaLG1CQUE2QixVQUFTLENBQUM7QUFDN0QsVUFBTSxRQUFRLFlBQVksU0FBUztBQUNuQyxVQUFNLFVBQVUsWUFBWSxXQUFXLEVBQUUsUUFBUSxJQUFJO0FBRXJELFFBQUksV0FBVyxDQUFDO0FBRWhCLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxLQUFLO0FBRTVCLFlBQU0sT0FBTyxLQUFLLE9BQU8sSUFBSTtBQUM3QixVQUFJLGdCQUFnQjtBQUNwQixVQUFJLFlBQVk7QUFHaEIsaUJBQVcsQ0FBQyxRQUFRLE1BQU0sS0FBSyxPQUFPLFFBQVEsT0FBTyxHQUFHO0FBQ3BELHlCQUFpQjtBQUNqQixZQUFJLFFBQVEsZUFBZTtBQUN2QixzQkFBWTtBQUNaO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFHQSxZQUFNLGdCQUFnQixjQUFjLE9BQU8sV0FBUyxLQUFLLFVBQVUsY0FBYyxhQUFhLEtBQUssU0FBUyxTQUFTO0FBRXJILFVBQUksY0FBYyxTQUFTLEdBQUc7QUFFMUIsY0FBTSxPQUFPLGNBQWMsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLGNBQWMsTUFBTSxDQUFDO0FBQzNFLGlCQUFTLEtBQUssSUFBSTtBQUNsQixjQUFNLEtBQUssZUFBZSxLQUFLLEVBQUU7QUFBQSxNQUNyQztBQUFBLElBQ0o7QUFHQSxRQUFJLFNBQVMsU0FBUyxHQUFHO0FBQ3JCLFlBQU0sWUFBWSxTQUFTLElBQUksVUFBUSxHQUFHLEtBQUssYUFBYSxXQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsRUFBRSxLQUFLLElBQUk7QUFDMUYsVUFBSSx3QkFBTztBQUFBLEVBQTBCLFNBQVMsSUFBSSxHQUFJO0FBQ3RELFVBQUksS0FBSyxPQUFPLEdBQUksTUFBSyxPQUFPLEdBQUcsWUFBWSxnR0FBcUI7QUFBQSxJQUN4RSxPQUFPO0FBQ0gsVUFBSSx3QkFBTyxtSEFBeUI7QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUVBLE1BQU0sU0FBUyxRQUFRO0FBQ25CLFFBQUksQ0FBQyxLQUFLLE1BQU0sVUFBVztBQUMzQixVQUFNLFdBQVcsS0FBSyxNQUFNLFVBQVUsS0FBSyxPQUFLLEVBQUUsT0FBTyxNQUFNO0FBQy9ELFFBQUksQ0FBQyxTQUFVO0FBRWYsYUFBUztBQUNULFFBQUksU0FBUyxZQUFZLEVBQUcsTUFBSyxNQUFNLFlBQVksS0FBSyxNQUFNLFVBQVUsT0FBTyxPQUFLLEVBQUUsT0FBTyxNQUFNO0FBR25HLFFBQUksS0FBSyxNQUFNLFdBQVc7QUFDdEIsZUFBUyxRQUFRLEtBQUssTUFBTSxXQUFXO0FBQ25DLFlBQUksS0FBSyxNQUFNLFVBQVUsSUFBSSxNQUFNLFVBQVUsU0FBUyxZQUFZLEdBQUc7QUFDakUsZUFBSyxNQUFNLFVBQVUsSUFBSSxJQUFJO0FBQUEsUUFDakM7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLFVBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxFQUNuQztBQUNKOzs7QUN4SkEsSUFBQUMsb0JBQXVCO0FBRXZCLElBQXFCLGVBQXJCLE1BQWtDO0FBQUEsRUFDOUIsWUFBWSxRQUFRO0FBQ2hCLFNBQUssU0FBUztBQUFBLEVBQ2xCO0FBQUEsRUFFQSxNQUFNLFdBQVc7QUFDYixVQUFNLGFBQWE7QUFDbkIsVUFBTSxRQUFRLEtBQUssT0FBTyxJQUFJO0FBQzlCLFVBQU0sVUFBVSxNQUFNO0FBR3RCLFVBQU0sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUVBLFFBQUk7QUFFQSxVQUFJLENBQUMsTUFBTSxzQkFBc0IsVUFBVSxHQUFHO0FBQzFDLGNBQU0sTUFBTSxhQUFhLFVBQVU7QUFBQSxNQUN2QztBQUVBLFVBQUksV0FBVztBQUdmLGlCQUFXLFlBQVksT0FBTztBQUMxQixjQUFNLGFBQWEsR0FBRyxVQUFVLElBQUksUUFBUTtBQUM1QyxjQUFNLGFBQWEsR0FBRyxLQUFLLE9BQU8sU0FBUyxHQUFHLFdBQVcsUUFBUTtBQUdqRSxZQUFJLENBQUMsTUFBTSxzQkFBc0IsVUFBVSxHQUFHO0FBRTFDLGNBQUksTUFBTSxRQUFRLE9BQU8sVUFBVSxHQUFHO0FBQ2xDLGtCQUFNLFVBQVUsTUFBTSxRQUFRLEtBQUssVUFBVTtBQUM3QyxrQkFBTSxNQUFNLE9BQU8sWUFBWSxPQUFPO0FBQ3RDLHVCQUFXO0FBQUEsVUFDZixPQUFPO0FBQ0gsb0JBQVEsTUFBTSwwQ0FBc0IsUUFBUSxrR0FBNEI7QUFBQSxVQUM1RTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBR0EsVUFBSSxVQUFVO0FBQ1YsWUFBSSx5QkFBTyxrVEFBdUU7QUFBQSxNQUN0RjtBQUFBLElBRUosU0FBUyxPQUFPO0FBQ1osY0FBUSxNQUFNLGlMQUErQyxLQUFLO0FBQUEsSUFDdEU7QUFBQSxFQUNKO0FBQ0o7OztBWHBDQSxJQUFNLGVBQWU7QUFBQSxFQUNqQixPQUFPO0FBQUEsRUFBRyxJQUFJO0FBQUEsRUFBRyxlQUFlO0FBQUEsRUFBTSxPQUFPO0FBQUEsRUFBRyxJQUFJO0FBQUEsRUFBSyxPQUFPO0FBQUEsRUFBSyxNQUFNO0FBQUEsRUFDM0UsV0FBVyxDQUFDO0FBQUEsRUFBRyxXQUFXLEVBQUUsTUFBTSxNQUFNLE1BQU0sTUFBTSxRQUFRLE1BQU0sV0FBVyxLQUFLO0FBQUEsRUFDbEYsT0FBTyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLEVBQ2xELGlCQUFpQixPQUFPLE9BQU8sRUFBRSxPQUFPLFlBQVk7QUFDeEQ7QUFFQSxJQUFxQixpQkFBckIsY0FBNEMseUJBQU87QUFBQSxFQUUvQyxJQUFJLFFBQVE7QUFDUixVQUFNLE1BQU0sS0FBSyxLQUFLLGVBQWU7QUFDckMsUUFBSSxDQUFDLEtBQUssS0FBSyxNQUFNLEdBQUcsRUFBRyxNQUFLLEtBQUssTUFBTSxHQUFHLElBQUksS0FBSyxNQUFNLEtBQUssVUFBVSxZQUFZLENBQUM7QUFDekYsV0FBTyxLQUFLLEtBQUssTUFBTSxHQUFHO0FBQUEsRUFDOUI7QUFBQSxFQUVBLE1BQU0sU0FBUztBQUNYLFlBQVEsSUFBSSwwSEFBcUM7QUFFakQsUUFBSSxVQUFVLE1BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUN4QyxTQUFLLE9BQU8sT0FBTyxPQUFPLEVBQUUsWUFBWSxXQUFXLGFBQWEsV0FBVyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxHQUFHLE9BQU87QUFFNUcsU0FBSyxPQUFPLElBQUksV0FBVyxJQUFJO0FBQy9CLFNBQUssWUFBWSxJQUFJLGlCQUFpQixJQUFJO0FBRTFDLFNBQUssT0FBTyxJQUFJLFdBQVcsSUFBSTtBQUMvQixTQUFLLFlBQVksSUFBSSxpQkFBaUIsSUFBSTtBQUcxQyxTQUFLLGVBQWUsSUFBSSxhQUFhLElBQUk7QUFDekMsVUFBTSxLQUFLLGFBQWEsU0FBUztBQUdqQyxRQUFJLEtBQUssS0FBSyxVQUFVLFVBQWEsQ0FBQyxLQUFLLEtBQUssTUFBTSxLQUFLLEtBQUssV0FBVyxHQUFHO0FBQzFFLFdBQUssS0FBSyxNQUFNLEtBQUssS0FBSyxXQUFXLElBQUk7QUFBQSxRQUNyQyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQU8sSUFBSSxLQUFLLEtBQUs7QUFBQSxRQUFJLGVBQWUsS0FBSyxLQUFLO0FBQUEsUUFBZSxPQUFPLEtBQUssS0FBSztBQUFBLFFBQU8sSUFBSSxLQUFLLEtBQUs7QUFBQSxRQUFJLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFBTyxNQUFNO0FBQUEsUUFDMUosV0FBVyxLQUFLLEtBQUssYUFBYSxDQUFDO0FBQUEsUUFBRyxXQUFXLEVBQUUsTUFBTSxNQUFNLE1BQU0sTUFBTSxRQUFRLE1BQU0sV0FBVyxLQUFLO0FBQUEsUUFBRyxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsUUFDakwsaUJBQWlCLEtBQUssS0FBSyxtQkFBbUIsT0FBTyxPQUFPLEVBQUUsT0FBTyxZQUFZO0FBQUEsTUFDckY7QUFDQSxhQUFPLEtBQUssS0FBSztBQUFPLGFBQU8sS0FBSyxLQUFLO0FBQUksYUFBTyxLQUFLLEtBQUs7QUFBZSxhQUFPLEtBQUssS0FBSztBQUFPLGFBQU8sS0FBSyxLQUFLO0FBQUksYUFBTyxLQUFLLEtBQUs7QUFBTyxhQUFPLEtBQUssS0FBSztBQUFXLGFBQU8sS0FBSyxLQUFLO0FBQU8sYUFBTyxLQUFLLEtBQUs7QUFDdk4sWUFBTSxLQUFLLFNBQVMsS0FBSyxJQUFJO0FBQUEsSUFDakM7QUFFQSxTQUFLLGFBQWEscUJBQXFCLENBQUMsU0FBUyxJQUFJLGFBQWEsTUFBTSxJQUFJLENBQUM7QUFLN0UsVUFBTSxZQUFZLEtBQUssY0FBYyxVQUFVLHFCQUFxQixDQUFDLFFBQVE7QUFDekUsWUFBTSxPQUFPLElBQUksdUJBQUs7QUFFdEIsV0FBSyxRQUFRLENBQUMsU0FBUyxLQUFLLFNBQVMsMkZBQW1CLEVBQUUsUUFBUSxnQkFBZ0IsRUFBRSxRQUFRLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzFILFdBQUssUUFBUSxDQUFDLFNBQVMsS0FBSyxTQUFTLHlFQUFnQixFQUFFLFFBQVEsU0FBUyxFQUFFLFFBQVEsTUFBTSxJQUFJLGVBQWUsS0FBSyxLQUFLLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsSSxXQUFLLFFBQVEsQ0FBQyxTQUFTLEtBQUssU0FBUyxnREFBVyxFQUFFLFFBQVEsVUFBVSxFQUFFLFFBQVEsTUFBTSxJQUFJLGVBQWUsS0FBSyxLQUFLLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5SCxXQUFLLFFBQVEsQ0FBQyxTQUFTLEtBQUssU0FBUywyRkFBbUIsRUFBRSxRQUFRLE9BQU8sRUFBRSxRQUFRLE1BQU0sSUFBSSxVQUFVLEtBQUssS0FBSyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUgsV0FBSyxRQUFRLENBQUMsU0FBUyxLQUFLLFNBQVMsc0RBQVksRUFBRSxRQUFRLGVBQWUsRUFBRSxRQUFRLE1BQU0sSUFBSSxjQUFjLEtBQUssS0FBSyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbkksV0FBSyxhQUFhO0FBRWxCLFdBQUs7QUFBQSxRQUFRLENBQUMsU0FDVixLQUFLLFNBQVMsbUhBQXVCLEVBQ2hDLFFBQVEsTUFBTSxFQUNkLFFBQVEsWUFBWTtBQUNqQixnQkFBTSxJQUFJLE1BQU0sS0FBSyxZQUFZLFlBQVk7QUFDN0MsY0FBSSxlQUFlLEtBQUssS0FBSyxHQUFHLE9BQU8sTUFBTTtBQUFFLGlCQUFLLEtBQUssY0FBYztBQUFHLGtCQUFNLEtBQUssYUFBYTtBQUFHLGtCQUFNLEtBQUssY0FBYztBQUFBLFVBQUcsQ0FBQyxFQUFFLEtBQUs7QUFBQSxRQUM3SSxDQUFDO0FBQUEsTUFDVDtBQUVBLFdBQUs7QUFBQSxRQUFRLENBQUMsU0FDVixLQUFLLFNBQVMsNkdBQXNCLEVBQy9CLFFBQVEsT0FBTyxFQUNmLFFBQVEsWUFBWTtBQUNqQixnQkFBTSxJQUFJLE1BQU0sS0FBSyxZQUFZLFdBQVc7QUFDNUMsY0FBSSxlQUFlLEtBQUssS0FBSyxHQUFHLE9BQU8sTUFBTTtBQUFFLGlCQUFLLEtBQUssYUFBYTtBQUFHLGtCQUFNLEtBQUssYUFBYTtBQUFHLGtCQUFNLEtBQUssY0FBYztBQUFBLFVBQUcsQ0FBQyxFQUFFLEtBQUs7QUFBQSxRQUM1SSxDQUFDO0FBQUEsTUFDVDtBQUVBLFdBQUssYUFBYTtBQUVsQixXQUFLO0FBQUEsUUFBUSxDQUFDLFNBQ1YsS0FBSyxTQUFTLGtKQUE2QixFQUN0QyxRQUFRLFFBQVEsRUFDaEIsUUFBUSxNQUFNO0FBQ1gsZ0JBQU0sWUFBWTtBQUNsQixnQkFBTSxPQUFPLEtBQUssSUFBSSxNQUFNLHNCQUFzQixTQUFTO0FBQzNELGNBQUksTUFBTTtBQUVOLGlCQUFLLElBQUksbUJBQW1CLFNBQVM7QUFBQSxVQUN6QyxPQUFPO0FBQ0gsZ0JBQUkseUJBQU8sNlNBQXVFO0FBQUEsVUFDdEY7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNUO0FBR0EsV0FBSyxpQkFBaUIsR0FBRztBQUFBLElBQzdCLENBQUM7QUFFRCxjQUFVLFNBQVMsbUJBQW1CLGlCQUFpQjtBQUd2RCxVQUFNLEtBQUssbUJBQW1CO0FBRTlCLFVBQU0sS0FBSyxjQUFjO0FBQ3pCLFVBQU0sS0FBSyxpQkFBaUI7QUFFNUIsU0FBSyxpQkFBaUIsVUFBVSxTQUFTLENBQUMsUUFBUTtBQUM5QyxVQUFJLElBQUksT0FBTyxVQUFVLFNBQVMseUJBQXlCLEdBQUc7QUFDMUQsWUFBSSxDQUFDLEtBQUssbUJBQW1CLENBQUMsS0FBSyxpQkFBa0I7QUFDckQsY0FBTSxXQUFXLElBQUksT0FBTyxnQkFBZ0IsSUFBSSxPQUFPLGNBQWMsWUFBWTtBQUNqRixhQUFLLHFCQUFxQixJQUFJLE9BQU8sU0FBUyxRQUFRO0FBQUEsTUFDMUQ7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUE7QUFBQSxFQUdBLE1BQU0scUJBQXFCO0FBQ3ZCLFNBQUssZ0JBQWdCLG9CQUFJLElBQUk7QUFDN0IsVUFBTSxZQUFZLE1BQU0sS0FBSyxZQUFZLFdBQVc7QUFFcEQsZUFBVyxLQUFLLFdBQVc7QUFDdkIsVUFBSTtBQUNBLGNBQU0sV0FBVyxHQUFHLEtBQUssU0FBUyxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUM7QUFDbEUsWUFBSSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxRQUFRLEdBQUc7QUFDL0MsZ0JBQU0sVUFBVSxLQUFLLE1BQU0sTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQ3RFLGNBQUksUUFBUSxPQUFPO0FBQ2Ysb0JBQVEsTUFBTSxRQUFRLFVBQVE7QUFDMUIsbUJBQUssY0FBYztBQUNuQixtQkFBSyxjQUFjLElBQUksS0FBSyxJQUFJLElBQUk7QUFBQSxZQUN4QyxDQUFDO0FBQUEsVUFDTDtBQUFBLFFBQ0o7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUNSLGdCQUFRLE1BQU0sb05BQTBDLENBQUMsS0FBSyxDQUFDO0FBQUEsTUFDbkU7QUFBQSxJQUNKO0FBQ0EsWUFBUSxJQUFJLDJNQUF5QyxLQUFLLGNBQWMsSUFBSSxvRkFBbUI7QUFBQSxFQUNuRztBQUFBLEVBRUEsTUFBTSxtQkFBbUI7QUFDckIsVUFBTSxFQUFFLFVBQVUsSUFBSSxLQUFLO0FBQUssUUFBSSxPQUFPLFVBQVUsZ0JBQWdCLG1CQUFtQixFQUFFLENBQUM7QUFDM0YsUUFBSSxDQUFDLE1BQU07QUFBRSxhQUFPLFVBQVUsYUFBYSxLQUFLO0FBQUcsWUFBTSxLQUFLLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixRQUFRLEtBQUssQ0FBQztBQUFBLElBQUc7QUFDekgsY0FBVSxXQUFXLElBQUk7QUFBQSxFQUM3QjtBQUFBLEVBRUEsTUFBTSxZQUFZLFlBQVk7QUFDMUIsVUFBTSxVQUFVLEtBQUssSUFBSSxNQUFNO0FBQVMsVUFBTSxNQUFNLEdBQUcsS0FBSyxTQUFTLEdBQUcsSUFBSSxVQUFVO0FBQ3RGLFFBQUksQ0FBRSxNQUFNLFFBQVEsT0FBTyxHQUFHLEVBQUksUUFBTyxDQUFDO0FBQUcsWUFBUSxNQUFNLFFBQVEsS0FBSyxHQUFHLEdBQUcsUUFBUSxJQUFJLFVBQVEsS0FBSyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUMzSDtBQUFBLEVBRUEsTUFBTSxnQkFBZ0I7QUFDbEIsUUFBSSxLQUFLLEdBQUksTUFBSyxHQUFHLE9BQU87QUFBRyxRQUFJLEtBQUssaUJBQWtCLE1BQUssaUJBQWlCLE9BQU87QUFDdkYsVUFBTSxZQUFZLE1BQU0sS0FBSyxhQUFhLEtBQUssS0FBSyxVQUFVO0FBQUcsVUFBTSxhQUFhLE1BQU0sS0FBSyxjQUFjLEtBQUssS0FBSyxXQUFXO0FBQ2xJLFFBQUksYUFBYSxZQUFZO0FBQ3pCLFdBQUssS0FBSyxJQUFJLGNBQWMsSUFBSTtBQUFHLFdBQUssR0FBRyxhQUFhO0FBQ3hELFdBQUssSUFBSSxVQUFVLGdCQUFnQixtQkFBbUIsRUFBRSxRQUFRLFVBQVEsS0FBSyxLQUFLLFlBQVksQ0FBQztBQUFBLElBQ25HO0FBQUEsRUFDSjtBQUFBLEVBRUEsTUFBTSxhQUFhLElBQUk7QUFDbkIsUUFBSTtBQUNBLFlBQU0sVUFBVSxLQUFLLElBQUksTUFBTTtBQUFTLFlBQU0sV0FBVyxHQUFHLEtBQUssU0FBUyxHQUFHLGNBQWMsRUFBRSxhQUFhLEVBQUU7QUFBUyxZQUFNLFVBQVUsR0FBRyxLQUFLLFNBQVMsR0FBRyxjQUFjLEVBQUUsYUFBYSxFQUFFO0FBQ3hMLFVBQUksQ0FBRSxNQUFNLFFBQVEsT0FBTyxRQUFRLEVBQUksUUFBTztBQUM5QyxXQUFLLGtCQUFrQixLQUFLLE1BQU0sTUFBTSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQzlELFVBQUksTUFBTSxRQUFRLE9BQU8sT0FBTyxHQUFHO0FBQy9CLGFBQUssbUJBQW1CLFNBQVMsY0FBYyxPQUFPO0FBQUcsYUFBSyxpQkFBaUIsS0FBSztBQUErQixhQUFLLGlCQUFpQixZQUFZLE1BQU0sUUFBUSxLQUFLLE9BQU87QUFBRyxpQkFBUyxLQUFLLFlBQVksS0FBSyxnQkFBZ0I7QUFBQSxNQUNyTztBQUNBLGFBQU87QUFBQSxJQUNYLFNBQVMsR0FBRztBQUFFLGFBQU87QUFBQSxJQUFPO0FBQUEsRUFDaEM7QUFBQSxFQUVBLE1BQU0sY0FBYyxJQUFJO0FBQ3BCLFFBQUk7QUFDQSxZQUFNLFVBQVUsS0FBSyxJQUFJLE1BQU07QUFBUyxZQUFNLFdBQVcsR0FBRyxLQUFLLFNBQVMsR0FBRyxlQUFlLEVBQUUsY0FBYyxFQUFFO0FBQVMsWUFBTSxhQUFhLEdBQUcsS0FBSyxTQUFTLEdBQUcsZUFBZSxFQUFFO0FBQy9LLFVBQUksQ0FBRSxNQUFNLFFBQVEsT0FBTyxRQUFRLEVBQUksUUFBTztBQUM5QyxXQUFLLG1CQUFtQixLQUFLLE1BQU0sTUFBTSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBRS9ELFlBQU0sV0FBVyxLQUFLLEtBQUssa0JBQWtCLEVBQUU7QUFDL0MsWUFBTSxpQkFBaUIsU0FBUyxHQUFHLEtBQUssS0FBSztBQUM3QyxXQUFLLE1BQU0sU0FBUyxLQUFLLGlCQUFpQixTQUFTLE9BQU87QUFDMUQsVUFBSSxLQUFLLE1BQU0sS0FBSyxLQUFLLE1BQU0sTUFBTyxNQUFLLE1BQU0sS0FBSyxLQUFLLE1BQU07QUFFakUsV0FBSyxtQkFBb0IsTUFBTSxRQUFRLE9BQU8sVUFBVSxJQUFLLFFBQVEsZ0JBQWdCLFVBQVUsSUFBSTtBQUFJLGFBQU87QUFBQSxJQUNsSCxTQUFTLEdBQUc7QUFBRSxhQUFPO0FBQUEsSUFBTztBQUFBLEVBQ2hDO0FBQUEsRUFFQSxNQUFNLGVBQWU7QUFDakIsVUFBTSxLQUFLLFNBQVMsS0FBSyxJQUFJO0FBQzdCLFFBQUksS0FBSyxHQUFJLE1BQUssR0FBRyxjQUFjO0FBQ25DLFNBQUssSUFBSSxVQUFVLGdCQUFnQixtQkFBbUIsRUFBRSxRQUFRLFVBQVE7QUFBRSxVQUFJLEtBQUssS0FBSyxZQUFhLE1BQUssS0FBSyxZQUFZO0FBQUEsSUFBRyxDQUFDO0FBQUEsRUFDbkk7QUFBQSxFQUVBLFdBQVc7QUFBRSxRQUFJLEtBQUssR0FBSSxNQUFLLEdBQUcsT0FBTztBQUFHLFFBQUksS0FBSyxpQkFBa0IsTUFBSyxpQkFBaUIsT0FBTztBQUFBLEVBQUc7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUt2RyxNQUFNLHFCQUFxQixHQUFHLEdBQUc7QUFBRSxVQUFNLEtBQUssS0FBSyxxQkFBcUIsR0FBRyxDQUFDO0FBQUEsRUFBRztBQUFBLEVBQy9FLE1BQU0sbUJBQW1CO0FBQUUsVUFBTSxLQUFLLEtBQUssaUJBQWlCO0FBQUEsRUFBRztBQUFBLEVBQy9ELE1BQU0sT0FBTyxHQUFHO0FBQUUsVUFBTSxLQUFLLEtBQUssT0FBTyxDQUFDO0FBQUEsRUFBRztBQUFBLEVBQzdDLE1BQU0sVUFBVSxHQUFHO0FBQUUsVUFBTSxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQUEsRUFBRztBQUFBLEVBQ25ELE1BQU0sT0FBTyxHQUFHO0FBQUUsVUFBTSxLQUFLLEtBQUssT0FBTyxDQUFDO0FBQUEsRUFBRztBQUFBLEVBQzdDLE1BQU0sVUFBVSxHQUFHO0FBQUUsVUFBTSxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQUEsRUFBRztBQUFBLEVBRW5ELE1BQU0sVUFBVSxHQUFHLEdBQUc7QUFBRSxVQUFNLEtBQUssVUFBVSxVQUFVLEdBQUcsQ0FBQztBQUFBLEVBQUc7QUFBQSxFQUM5RCxNQUFNLFlBQVksR0FBRztBQUFFLFVBQU0sS0FBSyxVQUFVLFlBQVksQ0FBQztBQUFBLEVBQUc7QUFBQSxFQUM1RCxNQUFNLGVBQWUsR0FBRztBQUFFLFVBQU0sS0FBSyxVQUFVLGVBQWUsQ0FBQztBQUFBLEVBQUc7QUFBQSxFQUNsRSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQUUsVUFBTSxLQUFLLFVBQVUsUUFBUSxHQUFHLENBQUM7QUFBQSxFQUFHO0FBQUEsRUFDMUQsTUFBTSxTQUFTLEdBQUc7QUFBRSxVQUFNLEtBQUssVUFBVSxTQUFTLENBQUM7QUFBQSxFQUFHO0FBQUEsRUFFdEQsaUJBQWlCLGVBQWU7QUFDNUIsUUFBSSxlQUFlLEtBQUssS0FBSyxNQUFNLGFBQWEsRUFBRSxLQUFLO0FBQUEsRUFDM0Q7QUFDSjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
