import { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allDeviceProbes, allNodeProbes, type Probe } from "../circuit/probe.js";
import { type PropsSchema } from "../circuit/props.js";
import { Analysis } from "./analysis.js";
import { type DatasetBuilder } from "./dataset.js";
import { NonlinearSolver } from "./solver-nonlinear.js";
import { groupName, Sweep } from "./sweep.js";

export class DcAnalysis extends Analysis {
  static readonly propsSchema: PropsSchema = {
    ...Circuit.propsSchema,
    ...NonlinearSolver.propsSchema,
  };

  constructor() {
    super(DcAnalysis.propsSchema);
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [...allNodeProbes(circuit), ...allDeviceProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { props } = this;
    const temp = props.getNumber("temp");
    const solver = new NonlinearSolver(circuit, props);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        dataset.group(groupName(steps));
      },
      set: ({ id }, value) => {
        circuit.equations.set(id, new ConstantExp(value));
      },
      end: () => {
        circuit.temp = temp;
        circuit.time = NaN;
        circuit.frequency = NaN;
        circuit.reset();
        solver.useDc();
        solver.solve();
        dataset.capture();
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
