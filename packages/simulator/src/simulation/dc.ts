import type { Circuit } from "../circuit/circuit";
import { Stamper } from "../circuit/network";
import { solve } from "../math/gauss-elimination";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "../math/matrix";
import { converged } from "./convergence";
import { SimulationError } from "./error";
import type { Options } from "./options";
import { defaultOptions } from "./options";

export function dcAnalysis(circuit: Circuit, userOptions: Partial<Options> = {}): void {
  const options = Object.freeze<Options>({ ...defaultOptions, ...userOptions });
  const { nodes, devices } = circuit;

  if (devices.length === 0) {
    throw new SimulationError(`Empty circuit`);
  }

  const controller = new Controller();

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);
  const prevVector = vecMake(n);

  const stamper = new Stamper(matrix, vector);

  for (const iteration of controller) {
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

    if (iteration > 1 && converged(options, nodes, prevVector, vector)) {
      break;
    }

    vecCopy(vector, prevVector);
  }

  for (const device of devices) {
    const { state } = device;
    device.eval(state);
  }
}

class Controller implements Iterable<number> {
  iteration = 0;

  *[Symbol.iterator](): IterableIterator<number> {
    for (this.iteration = 0; this.iteration < 100; this.iteration += 1) {
      yield this.iteration;
    }
    throw new SimulationError(`Simulation did not converge`);
  }
}
