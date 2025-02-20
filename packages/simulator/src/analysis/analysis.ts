import { type Circuit, type Probe } from "../circuit/index.js";
import { Props, type PropsSchema } from "../props/index.js";
import { logger } from "../util/logging.js";
import { type Dataset, type DatasetBuilder, makeDatasetBuilder } from "./dataset.js";
import { type Sweep } from "./sweep.js";

export abstract class Analysis {
  readonly props: Props;
  readonly sweeps: Sweep[];

  constructor(propsSchema: PropsSchema) {
    this.props = new Props(propsSchema);
    this.sweeps = [];
  }

  run(circuit: Circuit): Dataset {
    logger.reset();
    const dataset = makeDatasetBuilder(this.getProbes(circuit));
    this.runImpl(circuit, dataset);
    return dataset.build();
  }

  protected abstract getProbes(circuit: Circuit): Probe[];

  protected abstract runImpl(circuit: Circuit, dataset: DatasetBuilder): void;
}
