import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { opAnalysis } from "@jssim/simulator/lib/simulation/op.js";

export const simulate = (content: string): void => {
  const variables = new Variables();
  const circuit = parseNetlist(content, variables);
  const output = opAnalysis(circuit);
  console.log(output);
};
