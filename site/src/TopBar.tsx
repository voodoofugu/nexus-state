import React from "react";

import logo from "@nexus-state/src/assets/nexus-state-logo.svg";

export type Theme = "system" | "light" | "dark";

const themes: Theme[] = ["system", "light", "dark"];

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
