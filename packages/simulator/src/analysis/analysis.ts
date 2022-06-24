import { EventEmitter } from "events";
import type { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { Properties } from "../circuit/properties.js";
import { logger } from "../util/logging.js";
import { makeTableBuilder, Table, TableBuilder } from "./dataset.js";
import { dcProperties, getOptions, tranProperties } from "./options.js";
import { Solver } from "./solver.js";
import { groupName, Sweep } from "./sweep.js";

export const analysisStarted = Symbol();
export const analysisEnded = Symbol();
export const analysisError = Symbol();

export abstract class Analysis extends EventEmitter {
  readonly sweeps: Sweep[] = [];

  constructor(readonly properties: Properties) {
    super();
  }

  run(circuit: Circuit): Table {
    logger.reset();
    this.emit(analysisStarted, this);
    const table = this.createTable(circuit);
    let err = null;
    try {
      this.runImpl(circuit, table);
    } catch (arg: any) {
      err = arg;
    }
    if (err != null) {
      this.emit(analysisError, this, err);
      throw err;
    } else {
      const result = table.build();
      this.emit(analysisEnded, this, result);
      return result;
    }
  }

  protected abstract createTable(circuit: Circuit): TableBuilder;

  protected abstract runImpl(circuit: Circuit, table: TableBuilder): void;
}

export class DcAnalysis extends Analysis {
  constructor() {
    super(new Properties(dcProperties));
  }

  protected override createTable(circuit: Circuit): TableBuilder {
    return makeTableBuilder(circuit, false);
  }

  protected override runImpl(circuit: Circuit, table: TableBuilder): void {
    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        table.group(groupName(steps));
      },
      set: ({ variableId }, value) => {
        circuit.equations.set(variableId, new ConstantExp(value));
      },
      end: () => {
        circuit.elapsedTime = 0;
        circuit.timeStep = NaN;
        circuit.temp = temp;
        circuit.reset();
        solver.solve();
        table.capture(NaN);
      },
      leave: (sweep, level, steps) => {},
    });
  }
}

export class TranAnalysis extends Analysis {
  constructor() {
    super(new Properties(tranProperties));
  }

  protected override createTable(circuit: Circuit): TableBuilder {
    return makeTableBuilder(circuit, true);
  }

  protected override runImpl(circuit: Circuit, table: TableBuilder): void {
    const startTime = this.properties.getNumber("startTime");
    const stopTime = this.properties.getNumber("stopTime");
    const timeStep = this.properties.getNumber("timeStep");
    const dc = this.properties.getString("dc");
    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ variableId }, value) => {
        circuit.equations.set(variableId, new ConstantExp(value));
      },
      end: (steps) => {
        if (steps.length > 0) {
          table.group(groupName(steps));
        }
        if (dc === "yes") {
          circuit.elapsedTime = 0;
          circuit.timeStep = NaN;
          circuit.temp = temp;
          circuit.reset();
          solver.solve();
        } else {
          circuit.elapsedTime = 0;
          circuit.timeStep = 0;
          circuit.temp = temp;
          circuit.reset();
        }
        let step = 0;
        let elapsedTime = 0;
        while (elapsedTime <= stopTime) {
          circuit.elapsedTime = elapsedTime;
          circuit.timeStep = timeStep;
          circuit.temp = temp;
          solver.solve();
          if (elapsedTime >= startTime) {
            table.capture(elapsedTime);
          }
          step += 1;
          elapsedTime = timeStep * step;
        }
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
