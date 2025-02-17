import { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allNodeProbes, frequencyProbe, type Probe } from "../circuit/probe.js";
import { Props, type PropsSchema } from "../circuit/props.js";
import { Analysis } from "./analysis.js";
import { type DatasetBuilder } from "./dataset.js";
import { AcSolver } from "./solver-ac.js";
import { groupName, Sweep } from "./sweep.js";

export class AcAnalysis extends Analysis {
  static readonly propsSchema: PropsSchema = {
    ...Circuit.propsSchema,
    type: Props.string({
      range: ["lin", "log"],
      title: "frequency sweep type",
    }),
    start: Props.number({
      range: ["real", ">", 0],
      title: "start frequency",
    }),
    stop: Props.number({
      range: ["real", ">", 0],
      title: "stop frequency",
    }),
    points: Props.number({
      range: ["integer", ">", 1],
      title: "number of frequency points",
    }),
  };

  constructor() {
    super(AcAnalysis.propsSchema);
  }

  protected getProbes(circuit: Circuit): Probe[] {
    return [frequencyProbe(circuit), ...allNodeProbes(circuit, true)];
  }

  protected runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { props } = this;
    const temp = props.getNumber("temp");
    const sweep = Sweep.from("frequency", props);
    const solver = new AcSolver(circuit);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ id }, value) => {
        circuit.equations.set(id, new ConstantExp(value));
      },
      end: (steps) => {
        if (steps.length > 0) {
          dataset.group(groupName(steps));
        }

        for (const frequency of sweep) {
          circuit.temp = temp;
          circuit.time = NaN;
          circuit.frequency = frequency;
          circuit.reset();
          solver.solve();
          dataset.capture();
        }
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
