import type { Circuit } from "../circuit/circuit";
import type { Device } from "../circuit/device";
import { CircuitError } from "../circuit/error";
import { Stamper } from "../circuit/network";
import { solve } from "../math/gauss-elimination";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "../math/matrix";
import { converged } from "./convergence";
import type { Options } from "./options";
import { defaultOptions } from "./options";

export class Controller {
  iterationCount = 0;

  nextIteration(): void {
    this.iterationCount += 1;
  }
}

export function dcAnalysis(
  circuit: Circuit,
  userOptions: Partial<Options> = {},
  ctl = new Controller(),
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

  while (true) {
    ctl.nextIteration();

    for (const device of devices) {
      const { state } = device;
      device.eval(state);
    }

    matClear(matrix);
    vecClear(vector);

    for (const device of devices) {
      const { state } = device;
      device.stamp(stamper, state);
    }

    solve(matrix, vector);

    circuit.updateNodes(vector);

    if (ctl.iterationCount > 1 && converged(options, nodes, prev, vector)) {
      break;
    }

    vecCopy(vector, prev);
  }

  for (const device of devices) {
    const { state } = device;
    device.eval(state);
  }
}
