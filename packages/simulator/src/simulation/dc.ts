import { solve } from "../math/gauss-elimination";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "../math/matrix";
import type { Circuit } from "./circuit";
import { converged } from "./convergence";
import { CircuitError } from "./error";
import { Stamper } from "./network";
import type { Options } from "./options";
import { defaultOptions } from "./options";

export function dcAnalysis(
  circuit: Circuit,
  userOptions: Partial<Options> = {},
): void {
  const options = Object.freeze<Options>({ ...defaultOptions, ...userOptions });
  const { nodes, devices } = circuit;

  if (devices.length === 0) {
    throw new CircuitError(`Empty circuit`);
  }

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);
  const prev = vecMake(n);

  const stamper = new Stamper(matrix, vector);

  let iter = 0;
  while (true) {
    matClear(matrix);
    vecClear(vector);

    for (const device of devices) {
      device.stamp(stamper);
    }

    solve(matrix, vector);

    circuit.updateNodes(vector);

    if (iter > 0 && converged(options, nodes, prev, vector)) {
      break;
    }

    vecCopy(vector, prev);

    iter += 1;
  }
}
