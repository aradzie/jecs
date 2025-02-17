import {
  allDeviceProbes,
  allNodeProbes,
  Circuit,
  ConstantExp,
  DiffMethod,
  MAX_ORDER,
  MIN_ORDER,
  type Probe,
  Props,
  type PropsSchema,
  timeProbe,
  Tran,
} from "../circuit/index.js";
import { Analysis } from "./analysis.js";
import { type DatasetBuilder } from "./dataset.js";
import { NonlinearSolver } from "./solver-nonlinear.js";
import { groupName, Sweep } from "./sweep.js";

export class TrAnalysis extends Analysis {
  static readonly propsSchema: PropsSchema = {
    startTime: Props.number({
      defaultValue: 0,
      range: ["real", ">=", 0],
      title: "simulation start time",
    }),
    stopTime: Props.number({
      range: ["real", ">", 0],
      title: "simulation stop time",
    }),
    timeStep: Props.number({
      range: ["real", ">", 0],
      title: "simulation time step",
    }),
    method: Props.string({
      defaultValue: DiffMethod.Gear,
      range: [DiffMethod.Euler, DiffMethod.Trapezoidal, DiffMethod.Gear],
      title: "integration method",
    }),
    order: Props.number({
      defaultValue: MAX_ORDER,
      range: ["integer", ">=", MIN_ORDER, "<=", MAX_ORDER],
      title: "integration order",
    }),
    dc: Props.string({
      defaultValue: "yes",
      range: ["yes", "no"],
      title: "start with DC analysis",
    }),
    ...Circuit.propsSchema,
    ...NonlinearSolver.propsSchema,
  };

  constructor() {
    super(TrAnalysis.propsSchema);
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [timeProbe(circuit), ...allNodeProbes(circuit), ...allDeviceProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { props } = this;
    const startTime = props.getNumber("startTime");
    const stopTime = props.getNumber("stopTime");
    const timeStep = props.getNumber("timeStep");
    const method = props.getString("method") as DiffMethod;
    const order = props.getNumber("order");
    const dc = props.getString("dc");
    const temp = props.getNumber("temp");
    const solver = new NonlinearSolver(circuit, props);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ id }, value) => {
        circuit.equations.set(id, new ConstantExp(value));
      },
      end: (steps) => {
        if (steps.length > 0) {
          dataset.group(groupName(steps));
        }
        circuit.temp = temp;
        circuit.time = NaN;
        circuit.frequency = NaN;
        circuit.reset();
        if (dc === "yes") {
          solver.useDc();
          solver.solve();
        }
        solver.useTr();
        const tran = new Tran(circuit.devices);
        tran.setMethod(method, order);
        let step = 0;
        let time = 0;
        while (time <= stopTime) {
          circuit.temp = temp;
          circuit.time = time;
          circuit.frequency = NaN;
          tran.nextStep(time, timeStep);
          solver.solve();
          if (time >= startTime) {
            dataset.capture();
          }
          step += 1;
          time = timeStep * step;
        }
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
