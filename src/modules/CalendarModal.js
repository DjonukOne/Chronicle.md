import { Modal } from 'obsidian';

export default class CalendarModal extends Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
        this.currentDate = window.moment();
    }
    onOpen() { this.renderCalendar(); }
    renderCalendar() {
        const { contentEl } = this;
        contentEl.empty();
        const uiText = this.plugin.currentUniverse?.ui || { calendar_title: "📅 Хроники", quest_icon: "⚔️" };

        contentEl.createEl('h2', { text: uiText.calendar_title, style: 'text-align: center; color: var(--interactive-accent); border-bottom: 2px solid var(--background-modifier-border); padding-bottom: 10px; font-family: var(--font-text);' });

        const header = contentEl.createEl('div', { cls: 'rpg-calendar-header' });
        const prevBtn = header.createEl('button', { text: '◀' });
        const monthName = this.currentDate.format('MMMM YYYY');
        header.createEl('h3', { text: monthName.charAt(0).toUpperCase() + monthName.slice(1), style: 'margin: 0; color: var(--text-normal); font-family: var(--font-text);' });
        const nextBtn = header.createEl('button', { text: '▶' });

        prevBtn.onclick = () => { this.currentDate.subtract(1, 'month'); this.renderCalendar(); };
        nextBtn.onclick = () => { this.currentDate.add(1, 'month'); this.renderCalendar(); };

        const grid = contentEl.createEl('div', { cls: 'rpg-calendar-grid' });
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(d => grid.createEl('div', { cls: 'rpg-calendar-dow', text: d }));

        const startOfMonth = this.currentDate.clone().startOf('month');
        const endOfMonth = this.currentDate.clone().endOf('month');

        let startDayOfWeek = startOfMonth.day();
        if (startDayOfWeek === 0) startDayOfWeek = 7;
        startDayOfWeek--;

        for (let i = 0; i < startDayOfWeek; i++) grid.createEl('div', { cls: 'rpg-calendar-day empty' });

        const history = this.plugin.data.history || {};
        const todayStr = window.moment().format('YYYY-MM-DD');

        for (let day = 1; day <= endOfMonth.date(); day++) {
            const dateStr = startOfMonth.clone().date(day).format('YYYY-MM-DD');
            const questsDone = history[dateStr] || 0;

            const dayCell = grid.createEl('div', { cls: 'rpg-calendar-day' });
            dayCell.createEl('span', { text: day.toString(), style: 'color: var(--text-normal);' });

            if (dateStr === todayStr) dayCell.addClass('today');
            if (questsDone > 0) {
                dayCell.addClass('has-quests');
                dayCell.createEl('span', { cls: 'rpg-quest-badge', text: `${uiText.quest_icon} ${questsDone}` });
            }
        }
    }
    onClose() { this.contentEl.empty(); }
}