import type { Circuit } from "../circuit/circuit.js";
import { newSimulator } from "./iter.js";
import type { Options } from "./options.js";
import { defaultOptions } from "./options.js";
import { makeOutputBuilder, Output } from "./output.js";

export function tranAnalysis(
  circuit: Circuit,
  {
    timeInterval,
    timeStep,
  }: {
    readonly timeInterval: number;
    readonly timeStep: number;
  },
  userOptions: Partial<Options> = {},
): Output {
  const options = Object.freeze<Options>({ ...defaultOptions, ...userOptions });

  circuit.reset();

  const builder = makeOutputBuilder(circuit);

  let step = 0;
  let elapsedTime = 0;
  const simulator = newSimulator(circuit, options);
  while (elapsedTime <= timeInterval) {
    simulator({
      elapsedTime,
      timeStep,
      gmin: options.gmin,
    });
    step += 1;
    elapsedTime = timeStep * step;
    builder.append(elapsedTime);
  }

  return builder.build();
}
