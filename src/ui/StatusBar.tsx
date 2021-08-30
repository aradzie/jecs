import type { FunctionComponent, ReactNode } from "react";

export interface StatusBarProps {
  readonly children: ReactNode;
}

export const StatusBar: FunctionComponent<StatusBarProps> = ({ children }) => {
  return <div className="StatusBar">{children}</div>;
};
