import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug";
import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import "./App.css";
import defaultValue from "./assets/netlist.txt";
import { CodeEditor } from "./CodeEditor";

parseNetlist(`Ground g;`);

export function App(): ReactElement {
  const [value, setValue] = useState<string>(defaultValue);
  const handleValueChange = (value: string) => {
    exec(value);
    setValue(value);
  };
  return <CodeEditor value={value} onValueChange={handleValueChange} highlight={highlight} />;
}

function highlight(value: string): ReactNode {
  return value;
}

function exec(value: string): void {
  try {
    const circuit = parseNetlist(value);
    dcAnalysis(circuit);
    console.log(dumpCircuit(circuit).join("\n"));
  } catch (err) {
    if (err instanceof SyntaxError) {
      return;
    }
    console.error(err);
  }
}
