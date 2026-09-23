import React from "react";

import { MorphScroll } from "morphing-scroll";
import type {
  BarConfig,
  ControlsConfig,
  MorphScrollProps,
  MorphScrollHandle,
} from "morphing-scroll";

import ScrollThumb from "./ScrollThumb";

/*
 * Оснастка страницы прокручивается сама собой: дерево слева и текст справа.
 * Браузерных полос на сайте нет — везде своя, с одним и тем же бегунком,
 * нарочно тихим: цвет берут примеры, а не рамка вокруг них.
 *
 * Высоту берёт у родителя, так что коробка вокруг должна знать свою.
 */
const bar = {
  element: <ScrollThumb />,
  edgeGap: 3,
  trackGap: 2,
  thumbMinSize: 32,
};

type Props = Omit<MorphScrollProps, "controls" | "size"> & {
  children?: React.ReactNode;
  /** `bar` здесь — поправка к общей полосе, а не замена ей */
  controls?: Omit<ControlsConfig, "bar"> & { bar?: Partial<BarConfig> };
  size?: MorphScrollProps["size"];
};

const ChromeScroll = React.forwardRef<MorphScrollHandle, Props>(
  function ChromeScroll(
    { className, controls, edge, size = "auto", ...rest },
    ref,
  ) {
    return (
      <MorphScroll
        className={className ? `chrome-scroll ${className}` : "chrome-scroll"}
        controls={{
          wheel: true,
          ...controls,
          bar: { ...bar, ...controls?.bar },
        }}
        edge={edge ?? { size: 40 }}
        ref={ref}
        size={size}
        {...rest}
      />
    );
  },
);

export default ChromeScroll;
