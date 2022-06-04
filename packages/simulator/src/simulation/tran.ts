import assert from "assert";
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

  assert(circuit.nodes.length > 0);
  assert(circuit.devices.length > 0);
  assert(timeInterval > 0);
  assert(timeStep > 0);
  assert(options.abstol > 0);
  assert(options.vntol > 0);
  assert(options.reltol > 0);
  assert(options.gmin > 0);

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
