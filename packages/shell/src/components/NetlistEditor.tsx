import type { ReactElement } from "react";
import MonacoEditor from "react-monaco-editor";

export function NetlistEditor({
  value,
  onValueChange,
}: {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}): ReactElement {
  return (
    <MonacoEditor
      width="100%"
      height="100%"
      language="netlist"
      theme="vs-dark"
      value={value}
      onChange={onValueChange}
      options={{}}
    />
  );
}
