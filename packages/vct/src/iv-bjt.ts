import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { DcAnalysis } from "@jssim/simulator/lib/simulation/analysis.js";
import { formatNumber } from "@jssim/simulator/lib/util/format.js";
import { Unit } from "@jssim/simulator/lib/util/unit.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
V:V1 nc gnd V=$xVce
V:V2 nb gnd V=$xVbe
BJT:DUT gnd nb nc @NPN
`;

const dataset = new Dataset();

for (const xVbe of points(0.625, 0.65, 5)) {
  dataset.group(`Vbe=${formatNumber(xVbe, Unit.VOLT)}`);
  for (const xVce of points(0, 0.3, 100)) {
    const variables = new Variables();
    variables.setVariable("$xVce", xVce);
    variables.setVariable("$xVbe", xVbe);
    const { circuit } = Netlist.parse(input, variables);
    new DcAnalysis().run(circuit);
    const dut = circuit.getDevice("DUT");
    const Vce = dut.op("Vce");
    const Ic = dut.op("Ic");
    dataset.add(Vce, Ic);
  }
}

dataset.save("iv-bjt");
