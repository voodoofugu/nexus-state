import React from "react";

import logo from "@nexus-state/src/assets/nexus-state-logo.svg";

export type Theme = "system" | "light" | "dark";

const themes: Theme[] = ["system", "light", "dark"];

/** один и тот же рассказ о библиотеке, на двух языках */
const article = {
  en: "https://dev.to/voodoofugu/how-i-wrote-my-own-state-manager-434h",
  ru: "https://habr.com/ru/articles/1087264/",
};

/**
 * Статья одной кнопкой: языки прячутся под ней, а не занимают два места в
 * меню. Закрывается сама — нажатием мимо и клавишей Esc, как и положено
 * всплывающему.
 */
function ArticleMenu() {
  const [open, setOpen] = React.useState(false);
  const box = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const onDown = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="top-article" ref={box}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((shown) => !shown)}
        type="button"
      >
        article
      </button>

      {open && (
        <div className="top-article-menu" role="menu">
          <a href={article.en} hrefLang="en" role="menuitem">
            en
          </a>
          <a href={article.ru} hrefLang="ru" role="menuitem">
            ru
          </a>
        </div>
      )}
    </div>
  );
}

/** Шапка документации: возврат к началу, внешние ссылки и выбор темы. */
function TopBar({
  theme,
  onTheme,
}: {
  theme: Theme;
  onTheme: (theme: Theme) => void;
}) {
  return (
    <header className="top-bar">
      <a className="top-brand" href="#/">
        {/* знак красим сами: форму берём маской, цвет — из темы */}
        <span
          className="top-mark"
          style={{ "--mark": `url("${logo}")` } as React.CSSProperties}
        />
        nexus-state
      </a>

      <nav className="top-links">
        <a aria-current="page" href="#/">
          docs
        </a>
        <a href="https://www.npmjs.com/package/nexus-state">npm</a>
        <a href="https://github.com/voodoofugu/nexus-state">github</a>
        <ArticleMenu />
      </nav>

      <div className="top-theme">
        {themes.map((name) => (
          <button
            aria-pressed={theme === name}
            key={name}
            onClick={() => onTheme(name)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
    </header>
  );
}

export default TopBar;
