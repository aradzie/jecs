import type { Circuit } from "../circuit/circuit.js";
import { newSimulator } from "./iter.js";
import { getOptions } from "./options.js";
import { makeOutputBuilder, Output } from "./output.js";

export function dcAnalysis(circuit: Circuit): Output {
  circuit.reset();
  const options = getOptions(circuit.options);
  const output = makeOutputBuilder(circuit);
  const simulator = newSimulator(circuit, options);
  simulator({
    elapsedTime: 0,
    timeStep: NaN,
    gmin: options.gmin,
  });
  output.append(0);
  return output.build();
}
