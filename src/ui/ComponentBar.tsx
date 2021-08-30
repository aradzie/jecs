import type { FunctionComponent, ReactElement } from "react";
import type { ComponentItem, ComponentItemProps } from "./ComponentItem";

export interface ComponentBarProps {
  readonly children: readonly ReactElement<
    ComponentItemProps,
    typeof ComponentItem
  >[];
}

export const ComponentBar: FunctionComponent<ComponentBarProps> = ({
  children,
}) => {
  return <div className="ComponentBar">{children}</div>;
};
