import React from "react";

import logo from "@nexus-state/src/assets/nexus-state-logo.svg";
import packageInfo from "../../package.json";

export type Theme = "system" | "light" | "dark";

const themes: Theme[] = ["system", "light", "dark"];

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

      <ThemeControl onTheme={onTheme} theme={theme} />
    </header>
  );
}

export default TopBar;
