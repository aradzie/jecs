import type { Circuit } from "../circuit/circuit.js";
import type { Probe } from "../circuit/probe.js";
import { Properties, PropertiesSchema } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";

export class AcAnalysis extends Analysis {
  static readonly propertiesSchema: PropertiesSchema = {
    type: Properties.string({
      range: ["lin", "log"],
      title: "frequency sweep type",
    }),
    start: Properties.number({
      range: ["real", ">", 0],
      title: "start frequency",
    }),
    stop: Properties.number({
      range: ["real", ">", 0],
      title: "stop frequency",
    }),
    points: Properties.number({
      range: ["integer", ">", 1],
      title: "number of frequency points",
    }),
  };

  constructor() {
    super(AcAnalysis.propertiesSchema);
  }

  protected getProbes(circuit: Circuit): Probe[] {
    return [];
  }

  protected runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { properties } = this;
    const type = properties.getString("type");
    const start = properties.getNumber("start");
    const stop = properties.getNumber("stop");
    const points = properties.getNumber("points");
  }
}
