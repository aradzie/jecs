import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc.js";

export const simulate = (content: string): void => {
  const variables = new Variables();
  const circuit = parseNetlist(content, variables);
  const output = dcAnalysis(circuit);
  console.log(output);
};
