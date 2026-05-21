import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
    banner: { js: "/* Обсидиан Плагин: Chronicle.md */" },
    entryPoints: ["src/main.js", "src/styles.css"],
    bundle: true,
    outdir: ".",
    outbase: "src", // <-- ВОТ ОН, НАШ СПАСИТЕЛЬ!
    external: [
        "obsidian",
        "electron",
        ...builtins
    ],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
});

if (prod) {
    await context.rebuild();
    process.exit(0);
} else {
    await context.watch();
}