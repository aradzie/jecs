import { formatData, formatSchema } from "@jssim/simulator/lib/analysis/dataset.js";
import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { logger } from "@jssim/simulator/lib/util/logging.js";

const { circuit, analyses } = Netlist.parse(`
V:Vce nc gnd V=$Vce
V:Vbe nb gnd V=$Vbe
BJT:DUT gnd nb nc @NPN
.dc
  sweep $Vbe 0.625 0.65 5
  sweep $Vce 0 0.3 10
`);

for (const analysis of analyses) {
  const table = analysis.run(circuit);
  console.log(formatSchema(table));
  console.log(formatData(table));
}

console.log(String(logger));
