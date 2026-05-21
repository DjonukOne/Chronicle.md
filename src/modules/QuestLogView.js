import { ItemView } from 'obsidian';

export const VIEW_TYPE_QUEST_LOG = "chronicle-md-quest-log";

export default class QuestLogView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.isProcessing = false;
        this.viewMode = 'local';
    }

    getViewType() { return VIEW_TYPE_QUEST_LOG; }
    getDisplayText() { return "Журнал Квестов"; }
    getIcon() { return "clipboard-list"; }

    async onOpen() {
        await this.renderTasks();
        this.registerEvent(this.app.workspace.on('file-open', () => this.renderTasks()));
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (this.viewMode === 'local' && activeFile && file.path === activeFile.path) {
                    this.renderTasks();
                } else if (this.viewMode !== 'local') {
                    setTimeout(() => this.renderTasks(), 200);
                }
            })
        );
    }

    async renderTasks() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('rpg-quest-log-container');

        const uiText = this.plugin.currentUniverse?.ui || {
            quest_board: "📜 Доска Контрактов", current_location: "Текущая локация",
            global_map: "Карта мира", completed_quests: "Архив", no_quests: "Пусто."
        };

        container.createEl('div', { cls: 'rpg-quest-board-title', text: uiText.quest_board });

        const toggleDiv = container.createEl('div', { cls: 'rpg-quest-toggle' });
        const btnLocal = toggleDiv.createEl('button', { text: uiText.current_location });
        const btnGlobal = toggleDiv.createEl('button', { text: uiText.global_map });
        const btnCompleted = toggleDiv.createEl('button', { text: uiText.completed_quests });

        if (this.viewMode === 'local') btnLocal.addClass('active');
        else if (this.viewMode === 'global') btnGlobal.addClass('active');
        else btnCompleted.addClass('active');

        btnLocal.onclick = () => { this.viewMode = 'local'; this.renderTasks(); };
        btnGlobal.onclick = () => { this.viewMode = 'global'; this.renderTasks(); };
        btnCompleted.onclick = () => { this.viewMode = 'completed'; this.renderTasks(); };

        this.listContainer = container.createEl('div');

        if (this.viewMode === 'local') await this.renderLocalMode(uiText);
        else if (this.viewMode === 'global') await this.renderGlobalMode(uiText, 'unfinished');
        else await this.renderGlobalMode(uiText, 'completed');
    }

    async renderLocalMode(uiText) {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || activeFile.extension !== 'md') {
            this.listContainer.createEl('p', { text: uiText.no_quests, style: 'text-align: center; color: var(--text-muted);' });
            return;
        }
        await this.processFileTasks(activeFile, uiText.no_quests, 'all');
    }

    async renderGlobalMode(uiText, filterType) {
        const files = this.app.vault.getMarkdownFiles();
        let foundAny = false;
        const sortedFiles = files.sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, 30);

        for (const file of sortedFiles) {
            const hasTasks = await this.processFileTasks(file, null, filterType);
            if (hasTasks) foundAny = true;
        }

        if (!foundAny) this.listContainer.createEl('p', { text: uiText.no_quests, style: 'text-align: center; color: var(--text-muted);' });
    }

    async processFileTasks(file, emptyMessage, filterType) {
        const content = await this.app.vault.read(file);
        const lines = content.split('\n');
        const tasks = [];
        const taskRegex = /^([ \t]*)- \[(.)\] (.*)/;

        lines.forEach((line, index) => {
            const match = line.match(taskRegex);
            if (match) {
                const isCompleted = match[2].toLowerCase() === 'x';
                if (filterType === 'unfinished' && isCompleted) return;
                if (filterType === 'completed' && !isCompleted) return;
                tasks.push({ lineIndex: index, isCompleted: isCompleted, text: match[3] });
            }
        });

        if (tasks.length === 0) {
            if (emptyMessage) this.listContainer.createEl('p', { text: emptyMessage, style: 'text-align: center; color: var(--text-muted);' });
            return false;
        }

        const card = this.listContainer.createEl('div', { cls: 'rpg-quest-day-card' });
        const header = card.createEl('div', { cls: 'rpg-quest-day-header' });
        header.createEl('span', { text: file.basename });

        const list = card.createEl('ul', { cls: 'rpg-quest-list' });

        tasks.forEach(task => {
            const li = list.createEl('li', { text: task.text });
            if (task.isCompleted) li.addClass('completed');

            li.addEventListener('click', async () => {
                if (this.isProcessing) return;
                this.isProcessing = true;
                await this.toggleTaskInFile(file, task.lineIndex, !task.isCompleted);

                // Передаем текст задачи (task.text) в Ядро!
                await this.plugin.recordTaskCompletion(!task.isCompleted, task.text);

                setTimeout(() => { this.isProcessing = false; }, 500);
            });
        });
        return true;
    }

    async toggleTaskInFile(file, lineIndex, makeCompleted) {
        await this.app.vault.process(file, (data) => {
            const lines = data.split('\n');
            const line = lines[lineIndex];
            if (makeCompleted) lines[lineIndex] = line.replace(/- \[(.)\]/, '- [x]');
            else lines[lineIndex] = line.replace(/- \[(.)\]/, '- [ ]');
            return lines.join('\n');
        });
    }
    async onClose() { }
}