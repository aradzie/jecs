import { EventEmitter } from "events";
import type { Circuit } from "../circuit/circuit.js";
import type { Probe } from "../circuit/probe.js";
import type { Properties } from "../circuit/properties.js";
import { logger } from "../util/logging.js";
import { Dataset, DatasetBuilder, makeDatasetBuilder } from "./dataset.js";
import type { Sweep } from "./sweep.js";

export const analysisStarted = Symbol();
export const analysisEnded = Symbol();
export const analysisError = Symbol();

export abstract class Analysis extends EventEmitter {
  readonly sweeps: Sweep[] = [];

  constructor(readonly properties: Properties) {
    super();
  }

  run(circuit: Circuit): Dataset {
    logger.reset();
    this.emit(analysisStarted, this);
    const dataset = makeDatasetBuilder(this.getProbes(circuit));
    let err = null;
    try {
      this.runImpl(circuit, dataset);
    } catch (arg: any) {
      err = arg;
    }
    if (err != null) {
      this.emit(analysisError, this, err);
      throw err;
    } else {
      const result = dataset.build();
      this.emit(analysisEnded, this, result);
      return result;
    }
  }

  protected abstract getProbes(circuit: Circuit): Probe[];

  protected abstract runImpl(circuit: Circuit, dataset: DatasetBuilder): void;
}
