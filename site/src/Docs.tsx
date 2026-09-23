import React from "react";

import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";

import docs from "virtual:ns-docs";
import readme from "virtual:ns-readme";
import type { ReadmeNode } from "virtual:ns-readme";

import TopBar from "./TopBar";
import type { Theme } from "./TopBar";

/*
 * Документация — это README, показанный удобнее: текст разделов приходит из
 * него готовым HTML (`plugins/readme.ts`), здесь только навигация и поиск.
 * Короткие подсказки в карточках берутся из JSDoc (`plugins/docs.ts`) — того
 * самого, что виден в редакторе.
 */
const STORAGE_KEY = "nexus-state-docs";

/** у разделов своего текста в README нет — подпись живёт на сайте */
const SECTION_LEAD: Record<string, string> = {
  main: "What you import from the package.",
  nexus: "What a store instance gives you.",
};

const hrefOf = (node: ReadmeNode) =>
  node.kind === "section" ? `#/${node.name}` : `#/${node.section}/${node.name}`;

/** все разделы по адресу */
const byHref = new Map<string, ReadmeNode>();
const allEntries: ReadmeNode[] = [];
const index = (node: ReadmeNode) => {
  byHref.set(hrefOf(node), node);
  if (node.kind === "entry") allEntries.push(node);
  node.children.forEach(index);
};
readme.api.forEach(index);

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Одна строка для карточки: у записи — подсказка из JSDoc, если она есть, у
 * раздела — своя подпись. Запасной вариант — начало описания из README.
 */
const leadOf = (node: ReadmeNode) => {
  if (node.kind === "section") return SECTION_LEAD[node.name] ?? "";
  if (docs[node.name]) return docs[node.name].text;

  const text = plain(node.body);
  const start = text.indexOf("Description:");
  const from = start === -1 ? text : text.slice(start + "Description:".length);
  const sentence = from.trim().match(/^[^.]*[.]?/)?.[0] ?? "";
  return sentence.length > 140 ? `${sentence.slice(0, 139)}…` : sentence;
};

/** `код` в коротких строках карточек */
const inline = (text: string) =>
  text
    .split(/(`[^`]+`)/)
    .map((part, key) =>
      part.startsWith("`") ? <code key={key}>{part.slice(1, -1)}</code> : part,
    );

function useRoute() {
  const [hash, setHash] = React.useState(() => window.location.hash || "#/");

  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return hash;
}

function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").theme;
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
      return "system";
    }
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme }));
    } catch {
      // нет доступа к хранилищу — выбор живёт до перезагрузки
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

/** HTML раздела из README, с подсветкой кода */
function Body({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) Prism.highlightAllUnder(ref.current);
  }, [html]);

  return (
    <div
      className="doc-body"
      dangerouslySetInnerHTML={{ __html: html }}
      ref={ref}
    />
  );
}

function Cards({ nodes }: { nodes: ReadmeNode[] }) {
  return (
    <div className="doc-cards">
      {nodes.map((node) => (
        <a className="doc-card" href={hrefOf(node)} key={hrefOf(node)}>
          <span className="doc-card-name">{node.name}</span>
          <span className="doc-card-lead">{inline(leadOf(node))}</span>
        </a>
      ))}
    </div>
  );
}

/** записи по группам README: CORE, REACT */
function Groups({ nodes }: { nodes: ReadmeNode[] }) {
  const groups = nodes.reduce<Array<[string, ReadmeNode[]]>>((list, node) => {
    const last = list[list.length - 1];
    if (last && last[0] === node.group) last[1].push(node);
    else list.push([node.group, [node]]);
    return list;
  }, []);

  return (
    <>
      {groups.map(([group, members]) => (
        <section className="doc-group" key={group || "api"}>
          <h2>{group ? group.toLowerCase() : "api"}</h2>
          <Cards nodes={members} />
        </section>
      ))}
    </>
  );
}

function Overview() {
  return (
    <article className="doc-page">
      <h1 className="doc-title">nexus-state</h1>
      <p className="doc-lead">
        Lightweight, framework-agnostic state management with optional actions,
        React bindings, and traceable updates.
      </p>

      <Cards nodes={readme.api} />

      {readme.sections.map((section) => (
        <section className="doc-group" key={section.title}>
          <h2>{section.title.toLowerCase()}</h2>
          <Body html={section.body} />
        </section>
      ))}

      {readme.extras.map((section) => (
        <section className="doc-group" key={section.title}>
          <h2>{section.title.toLowerCase()}</h2>
          <Body html={section.body} />
        </section>
      ))}
    </article>
  );
}

function Page({ node }: { node: ReadmeNode }) {
  const parent = node.kind === "entry" ? byHref.get(`#/${node.section}`) : null;
  const hint = node.kind === "entry" ? docs[node.name] : undefined;

  return (
    <article className="doc-page">
      <nav aria-label="breadcrumbs" className="doc-crumbs">
        <a href="#/">docs</a>
        {parent && (
          <>
            <span aria-hidden="true">›</span>
            <a href={hrefOf(parent)}>{parent.name}</a>
          </>
        )}
      </nav>

      <h1 className="doc-title">
        {node.name}
        {node.note && <span className="doc-badge">{node.note}</span>}
      </h1>

      {node.kind === "section" ? (
        <>
          <p className="doc-lead">{SECTION_LEAD[node.name] ?? ""}</p>
          <Groups nodes={node.children} />
        </>
      ) : (
        <>
          {hint && <p className="doc-lead">{inline(hint.text)}</p>}
          <Body html={node.body} />
        </>
      )}
    </article>
  );
}

function Tree({ nodes, current }: { nodes: ReadmeNode[]; current: string }) {
  return (
    <ul>
      {nodes.map((node) => {
        const href = hrefOf(node);
        const inside = current.startsWith(`${href}/`);
        const open = node.kind === "section" || current === href || inside;

        return (
          <li key={href}>
            <a
              aria-current={current === href ? "page" : inside || undefined}
              href={href}
            >
              {node.name}
            </a>
            {open && node.children.length > 0 && (
              <Tree current={current} nodes={node.children} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Docs() {
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [query, setQuery] = React.useState("");
  const page = React.useRef<HTMLElement>(null);

  // новый раздел читают с начала
  React.useEffect(() => {
    page.current?.scrollTo({ top: 0 });
  }, [route]);

  const node = byHref.get(route);
  const needle = query.trim().toLowerCase();
  const found = needle
    ? allEntries.filter((entry) =>
        `${entry.section} ${entry.name}`.toLowerCase().includes(needle),
      )
    : null;

  return (
    <div className="docs">
      <TopBar onTheme={setTheme} theme={theme} />

      <div className="docs-shell">
        <aside className="docs-nav">
          <input
            aria-label="search api"
            className="docs-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="search api"
            type="search"
            value={query}
          />

          <div className="docs-nav-scroll">
            {found ? (
              <ul className="docs-found">
                {found.map((entry) => (
                  <li key={hrefOf(entry)}>
                    <a href={hrefOf(entry)} onClick={() => setQuery("")}>
                      {entry.name}
                      <small>{entry.section}</small>
                    </a>
                  </li>
                ))}
                {found.length === 0 && (
                  <li className="docs-none">nothing found</li>
                )}
              </ul>
            ) : (
              <nav aria-label="contents" className="docs-tree">
                <a aria-current={route === "#/" ? "page" : undefined} href="#/">
                  overview
                </a>
                <Tree current={route} nodes={readme.api} />
              </nav>
            )}
          </div>
        </aside>

        <main className="docs-main" ref={page}>
          {node ? <Page node={node} /> : <Overview />}
        </main>
      </div>
    </div>
  );
}

export default Docs;
