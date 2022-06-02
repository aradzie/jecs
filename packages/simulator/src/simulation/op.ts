import assert from "assert";
import type { Circuit } from "../circuit/circuit.js";
import { newSimulator } from "./iter.js";
import type { Options } from "./options.js";
import { defaultOptions } from "./options.js";
import { captureOp, ScalarOp } from "./output.js";

export function opAnalysis(
  circuit: Circuit,
  userOptions: Partial<Options> = {},
): Map<string, ScalarOp> {
  const options = Object.freeze<Options>({ ...defaultOptions, ...userOptions });

  assert(circuit.nodes.length > 0);
  assert(circuit.devices.length > 0);
  assert(options.abstol > 0);
  assert(options.vntol > 0);
  assert(options.reltol > 0);
  assert(options.gmin > 0);

  const simulator = newSimulator(circuit, options);
  simulator({
    elapsedTime: NaN,
    timeStep: NaN,
    gmin: options.gmin,
  });

  return captureOp(circuit);
}
