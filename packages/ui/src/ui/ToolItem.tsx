import type { ReactElement, ReactNode } from "react";
import type { FocusProps, KeyboardProps, MouseProps } from "./props";

export interface ToolItemProps extends FocusProps, MouseProps, KeyboardProps {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly title?: string;
}

export function ToolItem({
  children,
  disabled = false,
  title,
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
}: ToolItemProps): ReactElement {
  return (
    <div
      className="ToolItem"
      title={title}
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
    >
      {children}
    </div>
  );
}
