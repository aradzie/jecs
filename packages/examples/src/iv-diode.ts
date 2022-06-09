import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { DcAnalysis } from "@jssim/simulator/lib/simulation/analysis.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
V:V1 np gnd V=$xVd
Diode:DUT np gnd @D
`;

const dataset = new Dataset();

for (const xVd of points(0.5, 0.9, 100)) {
  const variables = new Variables();
  variables.setVariable("$xVd", xVd);
  const { circuit } = Netlist.parse(input, { variables });
  new DcAnalysis().run(circuit);
  const dut = circuit.getDevice("DUT");
  const V = dut.op("V");
  const I = dut.op("I");
  dataset.add(V, I);
}

dataset.save("iv-diode");
