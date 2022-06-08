import { solve } from "@jssim/math/lib/gauss-elimination.js";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import type { Circuit } from "../circuit/circuit.js";
import type { EvalOptions } from "../circuit/device.js";
import { Stamper } from "../circuit/network.js";
import { Controller, converged } from "./convergence.js";
import type { SimulationOptions } from "./options.js";

export const newSimulator = (
  circuit: Circuit,
  options: SimulationOptions,
): ((evalOptions: EvalOptions) => void) => {
  const { nodes, devices } = circuit;

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);
  const prevVector = vecMake(n);
  const stamper = new Stamper(matrix, vector);

  const linear = false;

  return (evalOptions: EvalOptions): void => {
    matClear(matrix);
    vecClear(vector);

    if (linear) {
      // The circuit consists only of linear devices.
      // The solution can be obtained in a single step.

      for (const device of devices) {
        device.beginEval(device.state, evalOptions);
      }
      for (const device of devices) {
        device.eval(device.state, evalOptions);
      }
      for (const device of devices) {
        device.stamp(device.state, stamper);
      }

      solve(matrix, vector);

      circuit.updateNodes(vector);

      for (const device of devices) {
        device.endEval(device.state, evalOptions);
      }
    } else {
      // The circuit includes some non-linear devices.
      // Must perform multiple iterations until the convergence is reached.

      // Initialize iteration.
      for (const device of devices) {
        device.beginEval(device.state, evalOptions);
      }

      // Iterate until converges.
      for (const iteration of new Controller()) {
        for (const device of devices) {
          device.eval(device.state, evalOptions);
        }
        for (const device of devices) {
          device.stamp(device.state, stamper);
        }

        solve(matrix, vector);

        circuit.updateNodes(vector);

        if (iteration > 1 && converged(options, nodes, prevVector, vector)) {
          break;
        }

        vecCopy(vector, prevVector);
        matClear(matrix);
        vecClear(vector);
      }

      for (const device of devices) {
        device.endEval(device.state, evalOptions);
      }
    }
  };
};
