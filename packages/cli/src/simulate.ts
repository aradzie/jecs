import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug.js";
import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";

export const simulate = (content: string): void => {
  const netlist = Netlist.parse(content);
  netlist.runAnalyses();
  console.log(dumpCircuit(netlist.circuit).join("\n"));
};
