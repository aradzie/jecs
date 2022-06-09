import { Netlist } from "../netlist/netlist.js";
import { formatData, formatSchema } from "../simulation/dataset.js";

const netlist = Netlist.parse(`
V:Vce nc gnd V=0
V:Vbe nb gnd V=0
BJT:DUT gnd nb nc @NPN
.dc
  sweep Vbe V 0.625 0.65 5
  sweep Vce V 0 0.3 10
`);

netlist.runAnalyses((analysis, table) => {
  console.log(formatSchema(table));
  console.log(formatData(table));
});
