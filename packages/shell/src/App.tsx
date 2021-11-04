import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import type { ReactElement } from "react";
import "./App.css";

parseNetlist(`Ground g;`);

export function App(): ReactElement {
  return <div className="App">Hello World!</div>;
}
