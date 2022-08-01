import type { Circuit } from "../circuit/circuit.js";
import type { Probe } from "../circuit/probe.js";
import { Properties } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { acProperties } from "./options.js";

export class AcAnalysis extends Analysis {
  constructor() {
    super(new Properties(acProperties));
  }

  protected getProbes(circuit: Circuit): Probe[] {
    return [];
  }

  protected runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const type = this.properties.getString("type");
    const start = this.properties.getNumber("start");
    const stop = this.properties.getNumber("stop");
    const points = this.properties.getNumber("points");
  }
}
