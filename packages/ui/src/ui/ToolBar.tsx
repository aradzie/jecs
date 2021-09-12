import type { FunctionComponent, ReactElement } from "react";
import type { FocusProps, KeyboardProps, MouseProps } from "./props";
import type { ToolItem, ToolItemProps } from "./ToolItem";

export interface ToolBarProps extends FocusProps, MouseProps, KeyboardProps {
  readonly children: readonly ReactElement<ToolItemProps, typeof ToolItem>[];
  readonly disabled?: boolean;
  readonly title?: string;
}

export const ToolBar: FunctionComponent<ToolBarProps> = ({ children }) => {
  return <div className="ToolBar">{children}</div>;
};
