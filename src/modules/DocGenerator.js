import { Notice } from 'obsidian';

export default class DocGenerator {
    constructor(plugin) {
        this.plugin = plugin;
    }

    async generate() {
        const folderName = "Chronicle.md";
        const vault = this.plugin.app.vault;
        const adapter = vault.adapter;

        // Список файлов для копирования из assets в хранилище
        const files = [
            "📖 Руководство Мододела.md",
            "🛠️ Кузница Миров.html"
        ];

        try {
            // 1. Создаем папку, если её нет
            if (!vault.getAbstractFileByPath(folderName)) {
                await vault.createFolder(folderName);
            }

            let isCopied = false;

            // 2. Проходим по каждому файлу и копируем его
            for (const fileName of files) {
                const targetPath = `${folderName}/${fileName}`;
                const sourcePath = `${this.plugin.manifest.dir}/assets/${fileName}`;

                // Если файла еще нет в хранилище пользователя
                if (!vault.getAbstractFileByPath(targetPath)) {
                    // Проверяем, существует ли он в папке assets плагина
                    if (await adapter.exists(sourcePath)) {
                        const content = await adapter.read(sourcePath);
                        await vault.create(targetPath, content);
                        isCopied = true;
                    } else {
                        console.error(`Chronicle.md: Файл ${fileName} не найден в папке assets!`);
                    }
                }
            }

            // Уведомляем пользователя только если что-то реально скопировалось
            if (isCopied) {
                new Notice("Chronicle.md: Руководство и Кузница Миров добавлены в ваше хранилище!");
            }

        } catch (error) {
            console.error("Ошибка при копировании файлов Chronicle.md:", error);
        }
    }
}