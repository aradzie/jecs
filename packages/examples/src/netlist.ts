import { Netlist } from "@jecs/netlist";
import { formatData, formatSchema, logger } from "@jecs/simulator";

const { circuit, analyses } = Netlist.parse(`
V:Vce nc gnd V=$Vce
V:Vbe nb gnd V=$Vbe
BJT:DUT gnd nb nc @NPN
.dc
  .sweep $Vbe type="lin" start=0.625 stop=0.65 points=5
  .sweep $Vce type="lin" start=0 stop=0.3 points=10
`);

for (const analysis of analyses) {
  const dataset = analysis.run(circuit);
  console.log(formatSchema(dataset));
  console.log(formatData(dataset));
}

console.log(String(logger));
