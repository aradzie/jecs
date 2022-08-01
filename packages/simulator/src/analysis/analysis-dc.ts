import { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allCircuitProbes, Probe } from "../circuit/probe.js";
import type { PropertiesSchema } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { NonlinearSolver } from "./solver-nonlinear.js";
import { groupName, Sweep } from "./sweep.js";

export class DcAnalysis extends Analysis {
  static readonly propertiesSchema: PropertiesSchema = {
    ...Circuit.propertiesSchema,
    ...NonlinearSolver.propertiesSchema,
  };

  constructor() {
    super(DcAnalysis.propertiesSchema);
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [...allCircuitProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { properties } = this;
    const temp = properties.getNumber("temp");
    const solver = new NonlinearSolver(circuit, properties);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        dataset.group(groupName(steps));
      },
      set: ({ param }, value) => {
        circuit.equations.set(param, new ConstantExp(value));
      },
      end: () => {
        circuit.temp = temp;
        circuit.elapsedTime = NaN;
        circuit.timeStep = NaN;
        circuit.reset();
        solver.useDc();
        solver.solve();
        dataset.capture();
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
