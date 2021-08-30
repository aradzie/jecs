import type { FunctionComponent } from "react";
import { Canvas } from "./canvas";

export interface SchematicProps {
  readonly title: string;
}

export const Schematic: FunctionComponent<SchematicProps> = ({ title }) => {
  const handleBlur = () => {};
  const handleFocus = () => {};
  const handleClick = () => {};
  const handleMouseDown = () => {};
  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};
  const handleMouseUp = () => {};
  const handleKeyDown = () => {};
  const handleKeyUp = () => {};

  return (
    <div className="Schematic">
      <Canvas
        tabIndex={-1}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        draw={(ctx) => {
          //
        }}
      />
    </div>
  );
};
