import { solve } from "../math/gauss-elimination";
import { matClear, matMake, vecClear, vecMake } from "../math/matrix";
import type { Circuit } from "./circuit";
import { CircuitError } from "./error";
import { Stamper } from "./network";
import type { Options } from "./options";
import { defaultOptions } from "./options";

export function dcAnalysis(
  circuit: Circuit,
  options: Partial<Options> = {},
): void {
  const fullOptions = Object.freeze<Options>({ ...defaultOptions, ...options });
  const { nodes, devices } = circuit;

  if (devices.length === 0) {
    throw new CircuitError(`Empty circuit`);
  }

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);

  const stamper = new Stamper(fullOptions, matrix, vector);

  let iter = 0;
  while (true) {
    matClear(matrix);
    vecClear(vector);
    stamper.reset();

    for (const device of devices) {
      device.stamp(stamper);
    }

    solve(matrix, vector);

    circuit.updateNodes(vector);

    if (stamper.linear || (iter > 0 && stamper.converged)) {
      break;
    }

    iter += 1;
  }
}
