import type { Circuit } from "../circuit/circuit.js";
import { newSimulator } from "./iter.js";
import type { Options } from "./options.js";
import { defaultOptions } from "./options.js";
import { makeOutputBuilder, Output } from "./output.js";

export function dcAnalysis(circuit: Circuit, userOptions: Partial<Options> = {}): Output {
  const options = Object.freeze<Options>({ ...defaultOptions, ...userOptions });

  circuit.reset();

  const output = makeOutputBuilder(circuit);

  const simulator = newSimulator(circuit, options);
  simulator({
    elapsedTime: NaN,
    timeStep: NaN,
    gmin: options.gmin,
  });

  output.append(NaN);

  return output.build();
}
