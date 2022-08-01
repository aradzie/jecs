import type { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allCircuitProbes, Probe } from "../circuit/probe.js";
import { Properties } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { dcProperties, getOptions } from "./options.js";
import { Solver } from "./solver.js";
import { groupName, Sweep } from "./sweep.js";

export class DcAnalysis extends Analysis {
  constructor() {
    super(new Properties(dcProperties));
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [...allCircuitProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        dataset.group(groupName(steps));
      },
      set: ({ variableId }, value) => {
        circuit.equations.set(variableId, new ConstantExp(value));
      },
      end: () => {
        circuit.elapsedTime = NaN;
        circuit.timeStep = NaN;
        circuit.temp = temp;
        circuit.reset();
        solver.useDc();
        solver.solve();
        dataset.capture();
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
