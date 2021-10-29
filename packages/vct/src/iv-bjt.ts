import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { parse } from "@jssim/simulator/lib/netlist/parser";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { formatNumber } from "@jssim/simulator/lib/util/format";
import { Unit } from "@jssim/simulator/lib/util/unit";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
V nc g V=$xVce;
V nb g V=$xVbe;
BJT:DUT g nb nc @npn;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xVbe of points(0.6, 0.65, 5)) {
  dataset.group(`Vbe=${formatNumber(xVbe, Unit.VOLT)}`);
  for (const xVce of points(0, 1, 100)) {
    const variables = new Variables();
    variables.setVariable("$xVce", xVce);
    variables.setVariable("$xVbe", xVbe);
    const circuit = parseNetlist(netlist, variables);
    dcAnalysis(circuit);
    const ops = circuit.getDevice("DUT").ops();
    const Vce = op(ops, "Vce");
    const Ic = op(ops, "Ic");
    dataset.add(Vce, Ic);
  }
}

dataset.save("iv-bjt");
