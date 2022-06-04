import assert from "assert";
import type { Circuit } from "../circuit/circuit.js";
import { newSimulator } from "./iter.js";
import type { Options } from "./options.js";
import { defaultOptions } from "./options.js";
import { captureVectorOp, VectorOp } from "./output.js";

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
): Map<string, VectorOp> {
  const options = Object.freeze<Options>({ ...defaultOptions, ...userOptions });

  assert(circuit.nodes.length > 0);
  assert(circuit.devices.length > 0);
  assert(timeInterval > 0);
  assert(timeStep > 0);
  assert(options.abstol > 0);
  assert(options.vntol > 0);
  assert(options.reltol > 0);
  assert(options.gmin > 0);

  const steps = Math.floor(timeInterval / timeStep);
  const [ops, updateOps] = captureVectorOp(circuit, steps);
  let elapsedTime = 0;
  updateOps(elapsedTime);
  const simulator = newSimulator(circuit, options);
  for (let step = 0; step <= steps; step++) {
    simulator({
      elapsedTime,
      timeStep,
      gmin: options.gmin,
    });
    elapsedTime = timeStep * step;
    updateOps(elapsedTime);
  }

  return ops;
}
