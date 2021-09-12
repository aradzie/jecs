import type { FunctionComponent } from "react";
import type { Part } from "../parts/part";
import { Canvas } from "./canvas";
import type { FocusProps, KeyboardProps, MouseProps } from "./props";

export interface ComponentItemProps
  extends FocusProps,
    MouseProps,
    KeyboardProps {
  readonly part: Part;
}

export const ComponentItem: FunctionComponent<ComponentItemProps> = ({
  part,
  tabIndex = -1,
  onBlur,
  onFocus,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onMouseUp,
  onKeyDown,
  onKeyUp,
}) => (
  <div className="ComponentItem" title={part.title}>
    <Canvas
      tabIndex={tabIndex}
      onBlur={onBlur}
      onFocus={onFocus}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      draw={(ctx) => {
        part.draw(ctx);
      }}
    />
  </div>
);
