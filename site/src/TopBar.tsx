import React from "react";

import logo from "@nexus-state/src/assets/nexus-state-logo.svg";
import packageInfo from "../../package.json";

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

/** Сегментированный выбор темы поддерживает клик, клавиатуру и перетаскивание. */
function ThemeControl({
  theme,
  onTheme,
}: {
  theme: Theme;
  onTheme: (theme: Theme) => void;
}) {
  const control = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const selectAt = (clientX: number) => {
    const bounds = control.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;

    const offset = Math.max(
      0,
      Math.min(bounds.width - 1, clientX - bounds.left),
    );
    const index = Math.min(
      themes.length - 1,
      Math.floor(offset / (bounds.width / themes.length)),
    );
    onTheme(themes[index]);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  return (
    <div
      aria-label="Color theme"
      className="top-theme"
      data-dragging={dragging || undefined}
      onLostPointerCapture={() => setDragging(false)}
      onPointerCancel={stopDragging}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        selectAt(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging) selectAt(event.clientX);
      }}
      onPointerUp={stopDragging}
      ref={control}
    >
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
        <span>nexus-state</span>
        <span className="top-version">v{packageInfo.version}</span>
      </a>

      <nav className="top-links">
        <a aria-current="page" href="#/">
          docs
        </a>
        <a href="https://www.npmjs.com/package/nexus-state">npm</a>
        <a href="https://github.com/voodoofugu/nexus-state">github</a>
        <ArticleMenu />
        <a href="https://resume.voodoofugu.com/?lang=ru">author</a>
      </nav>

      <ThemeControl onTheme={onTheme} theme={theme} />
    </header>
  );
}

export default TopBar;
