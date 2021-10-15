import { readNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const dataset = new Dataset();

for (const xVd of points(0, 1, 100)) {
  const circuit = readNetlist([
    ["Ground", ["g"], {}],
    ["V", ["NP", "g"], { v: xVd }],
    ["Diode:DUT", ["NP", "g"], {}],
  ]);
  dcAnalysis(circuit);
  const ops = circuit.getDevice("DUT").ops();
  const Vd = op(ops, "Vd");
  const Id = op(ops, "I");
  dataset.add(Vd, Id);
}

dataset.save("iv-diode");
