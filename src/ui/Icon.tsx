import clsx from "clsx";
import { FunctionComponent, memo } from "react";
import type { ClassName, MouseProps } from "./props";

export interface IconProps extends MouseProps {
  readonly shape: string;
  readonly className?: ClassName;
  readonly viewBox?: string;
}

export const Icon: FunctionComponent<IconProps> = memo((props) => {
  const {
    shape,
    className,
    viewBox = "0 0 24 24",
    onClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
  } = props;
  return (
    <svg
      className={clsx("Icon", className)}
      viewBox={viewBox}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
    >
      <path d={shape} />
    </svg>
  );
});
