import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import type { Plugin } from "vite";

/**
 * Короткие подсказки сайт не хранит у себя: он берёт их из того же JSDoc, что
 * пользователь видит в редакторе. Модуль `virtual:ns-docs` собирается на месте
 * из исходников и в dev пересобирается, как только их правят.
 */
const VIRTUAL_ID = "virtual:ns-docs";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../../src");

/** функции публичного API: приватные хелперы в браузер не уходят */
const PUBLIC = new Set([
  "createNexus",
  "createActs",
  "persist",
  "createReactNexus",
  "devtools",
]);

/** интерфейсы, чьи члены описывают экземпляр `nexus` */
const INTERFACES = ["Nexus", "ReactNexus"];

/** файлы, где лежат функции публичного API */
const FILES = [
  "types/core.ts",
  "nexus-core.ts",
  "createActs.ts",
  "persist.ts",
  "nexus-react.ts",
  "devtools.ts",
];

export type PropDoc = { text: string; default?: string };

/** строки шапки: разделитель, логотип и заголовок с именем */
const isHeading = (line: string) =>
  line === "" || line === "---" || line.startsWith("#");

/**
 * Подсказке достаётся первый абзац: остальное в JSDoc — это `@description` и
 * `@example`, целая страница текста, которой в короткой строке не место.
 */
const firstParagraph = (raw: string) => {
  const lines = raw.split("\n").map((line) => line.trim());
  while (lines.length && isHeading(lines[0])) lines.shift();

  const end = lines.indexOf("");
  return (end === -1 ? lines : lines.slice(0, end)).join(" ").trim();
};

const oneLine = (raw: string) =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .join(" ")
    .trim();

/** блок берём только свой: у члена без описания API отдаёт родительский */
const docOf = (node: ts.Node): PropDoc | undefined => {
  const blocks = ts
    .getJSDocCommentsAndTags(node)
    .filter((item): item is ts.JSDoc => ts.isJSDoc(item) && item.parent === node);

  const text = firstParagraph(
    ts.getTextOfJSDocComment(blocks[blocks.length - 1]?.comment) ?? "",
  );
  if (!text) return undefined;

  const tag = ts
    .getJSDocTags(node)
    .find((item) => item.tagName.text === "default");
  const fallback = ts.getTextOfJSDocComment(tag?.comment);

  return fallback ? { text, default: oneLine(fallback) } : { text };
};

/** все описания публичного API: имя → первый абзац и `@default` */
export const collectDocs = (): Record<string, PropDoc> => {
  const docs: Record<string, PropDoc> = {};

  for (const file of FILES) {
    const path = resolve(SRC, file);
    const source = ts.createSourceFile(
      path,
      ts.sys.readFile(path) ?? "",
      ts.ScriptTarget.Latest,
      true,
    );

    const visit = (node: ts.Node) => {
      // функции публичного API: createNexus, persist, devtools…
      if (ts.isFunctionDeclaration(node) && node.name && PUBLIC.has(node.name.text)) {
        const doc = docOf(node);
        if (doc && !docs[node.name.text]) docs[node.name.text] = doc;
      }

      // члены экземпляра: get, set, subscribe, useSelector…
      if (ts.isInterfaceDeclaration(node) && INTERFACES.includes(node.name.text)) {
        for (const member of node.members) {
          if (!member.name) continue;
          const name = member.name.getText(source);
          const doc = docOf(member);
          if (doc && !docs[name]) docs[name] = doc;
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(source);
  }

  return docs;
};

export default function nsDocs(): Plugin {
  const watched = FILES.map((file) => resolve(SRC, file));

  return {
    name: "ns-docs",

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      return id === RESOLVED_ID
        ? `export default ${JSON.stringify(collectDocs())};`
        : null;
    },

    configureServer(server) {
      watched.forEach((file) => server.watcher.add(file));
      server.watcher.on("change", (file) => {
        if (!watched.includes(file)) return;

        const graph = server.environments.client.moduleGraph;
        const module = graph.getModuleById(RESOLVED_ID);
        if (module) graph.invalidateModule(module);
        server.hot.send({ type: "full-reload" });
      });
    },
  };
}
