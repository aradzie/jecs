import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { DcAnalysis } from "@jssim/simulator/lib/simulation/analysis.js";
import { formatNumber } from "@jssim/simulator/lib/util/format.js";
import { Unit } from "@jssim/simulator/lib/util/unit.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
V:V1 nr gnd V=10
V:V2 ng gnd V=$xVgs
R:R1 nr nd R=$xRl
MOSFET:Q1 gnd ng nd gnd @NMOS
`;

const dataset = new Dataset();

for (const xRl of points(2000, 100, 5)) {
  dataset.group(`Rl=${formatNumber(xRl, Unit.OHM)}`);
  for (const xVgs of points(2, 4, 100)) {
    const variables = new Variables();
    variables.setVariable("$xRl", xRl);
    variables.setVariable("$xVgs", xVgs);
    const { circuit } = Netlist.parse(input, { variables });
    new DcAnalysis().run(circuit);
    const q1 = circuit.getDevice("Q1");
    const nd = circuit.getNode("nd");
    dataset.add(q1.op("Vgs"), nd.voltage);
  }
}

dataset.save("amp-mosfet");
