import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { marked } from "marked";
import type { Plugin } from "vite";

/**
 * README — источник правды документации: его правят первым, а сайт только
 * показывает его удобнее. Модуль `virtual:ns-readme` разбирает README при
 * сборке и отдаёт дерево «раздел → запись» с готовым HTML; в dev он
 * пересобирается, как только README правят.
 */
const VIRTUAL_ID = "virtual:ns-readme";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

const README_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../README.md",
);

export type ReadmeNode = {
  /** имя в заголовке: `nexus`, `createNexus`, `get` */
  name: string;
  /** раздел, которому запись принадлежит: `main`, `nexus` */
  section: string;
  kind: "section" | "entry";
  /** что стоит в заголовке после имени */
  note: string;
  /** группа, под которой запись стоит в README: `CORE`, `REACT` */
  group: string;
  /** свой текст, без вложенных записей */
  body: string;
  children: ReadmeNode[];
};

export type ReadmeSection = { title: string; body: string };

export type Readme = {
  /** разделы до API: About, Installation, Quick start */
  sections: ReadmeSection[];
  /** разделы API: main, nexus */
  api: ReadmeNode[];
  /** то, что идёт после API: Recipes */
  extras: ReadmeSection[];
};

const GROUP = /###### \*\*— (.+?) —\*\*/g;
const HEADING = /^### (.+?)\s*$/gm;

/** разделы, которые на сайте не нужны: оглавление строит навигация */
const SKIP = new Set(["Table of contents"]);
/** разделы, что идут отдельным блоком после API */
const EXTRA = new Set(["Recipes", "License"]);

const stripTags = (html: string) => html.replace(/<[^>]+>/g, "").trim();

/**
 * Имя в заголовке бывает двух видов: раздел — `<b>nexus</b>`, запись —
 * `<b><code>createNexus</code></b>`. Всё остальное (например
 * `<b>TypeScript Snippet:</b>`) узлом не становится и остаётся в теле.
 */
const readSummary = (summary: string) => {
  const entry = summary.match(
    /^<b><code>([\w.]+)<\/code><\/b>([\s\S]*)$/,
  );
  if (entry)
    return { kind: "entry" as const, name: entry[1], note: stripTags(entry[2]) };

  const section = summary.match(/^<b>([\w.]+)<\/b>\s*$/);
  if (section)
    return { kind: "section" as const, name: section[1], note: "" };

  return null;
};

/** обёртки, которыми README держит разметку на GitHub, — на сайте они лишние */
const tidy = (body: string) =>
  body
    .replace(GROUP, "")
    .replace(/<h2><\/h2>/g, "")
    .replace(/^\s*<br\s*\/?>\s*<ul><div>/, "")
    .replace(/<\/div><\/ul>\s*$/, "")
    .replace(/^\s*<ul><div>\s*$/gm, "")
    .replace(/^\s*<\/div><\/ul>\s*$/gm, "")
    .trim();

type Open = ReadmeNode & {
  currentGroup: string;
  /** не узел API: вернётся в тело родителя как есть */
  raw?: string;
};

export function parseReadme(text: string): Readme {
  const headings = [...text.matchAll(HEADING)];
  const sections: ReadmeSection[] = [];
  const extras: ReadmeSection[] = [];
  let apiText = "";

  headings.forEach((heading, index) => {
    const start = heading.index! + heading[0].length;
    const end = headings[index + 1]?.index ?? text.length;
    const body = text
      .slice(start, end)
      .replace(/<h2><\/h2>\s*$/, "")
      .trim();

    const title = heading[1];
    if (title === "API") apiText = body;
    else if (SKIP.has(title)) return;
    else if (EXTRA.has(title)) extras.push({ title, body });
    else sections.push({ title, body });
  });

  const root: Open = {
    name: "",
    section: "",
    kind: "section",
    note: "",
    group: "",
    body: "",
    children: [],
    currentGroup: "",
  };
  const stack: Open[] = [root];

  // текст между тегами достаётся тому разделу, что сейчас открыт
  const feed = (chunk: string) => {
    const top = stack[stack.length - 1];
    for (const match of chunk.matchAll(GROUP)) top.currentGroup = match[1];
    top.body += chunk;
  };

  const tags = /<details>|<\/details>/g;
  let cursor = 0;

  for (let tag = tags.exec(apiText); tag; tag = tags.exec(apiText)) {
    feed(apiText.slice(cursor, tag.index));
    cursor = tag.index + tag[0].length;

    if (tag[0] === "</details>") {
      const node = stack.pop()!;
      const parent = stack[stack.length - 1];

      // не узел API — возвращаем в тело родителя вместе с тегами
      if (node.raw !== undefined) {
        parent.body += `<details><summary>${node.raw}</summary>${node.body}</details>`;
        continue;
      }

      const { currentGroup: _group, raw: _raw, ...clean } = node;
      parent.children.push({ ...clean, body: tidy(clean.body) });
      continue;
    }

    const summary = apiText.slice(cursor).match(/^<summary>([\s\S]*?)<\/summary>/);
    const head = summary ? readSummary(summary[1]) : null;
    if (summary) cursor += summary[0].length;

    const parent = stack[stack.length - 1];

    stack.push({
      name: head?.name ?? "",
      section: head?.kind === "section" ? head.name : parent.section,
      kind: head?.kind ?? "entry",
      note: head?.note ?? "",
      group: parent.currentGroup,
      body: "",
      children: [],
      currentGroup: "",
      ...(head ? {} : { raw: summary?.[1] ?? "" }),
    });
  }

  return { sections, api: root.children, extras };
}

/** все записи плоским списком — для поиска */
export function flatten(nodes: ReadmeNode[], into: ReadmeNode[] = []) {
  for (const node of nodes) {
    if (node.kind === "entry") into.push(node);
    flatten(node.children, into);
  }
  return into;
}

const render = (markdown: string) => marked.parse(markdown, { async: false }) as string;

/** то, что уходит в браузер: вместо исходного markdown — готовый HTML */
const toClient = (node: ReadmeNode): ReadmeNode => ({
  ...node,
  body: render(node.body),
  children: node.children.map(toClient),
});

export default function nsReadme(): Plugin {
  return {
    name: "ns-readme",

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;

      const readme = parseReadme(readFileSync(README_FILE, "utf8"));
      const section = (item: ReadmeSection) => ({
        ...item,
        body: render(item.body),
      });

      return `export default ${JSON.stringify({
        sections: readme.sections.map(section),
        api: readme.api.map(toClient),
        extras: readme.extras.map(section),
      })};`;
    },

    configureServer(server) {
      server.watcher.add(README_FILE);
      server.watcher.on("change", (file) => {
        if (file !== README_FILE) return;

        const graph = server.environments.client.moduleGraph;
        const module = graph.getModuleById(RESOLVED_ID);
        if (module) graph.invalidateModule(module);
        server.hot.send({ type: "full-reload" });
      });
    },
  };
}
