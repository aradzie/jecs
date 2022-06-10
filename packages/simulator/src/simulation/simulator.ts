import { solve } from "@jssim/math/lib/gauss-elimination.js";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import type { Circuit } from "../circuit/circuit.js";
import type { EvalParams } from "../circuit/device.js";
import { Stamper } from "../circuit/network.js";
import { logger } from "../util/logging.js";
import { Controller, converged } from "./convergence.js";
import type { SimulationOptions } from "./options.js";

export const newSimulator = (
  circuit: Circuit,
  options: SimulationOptions,
): ((params: EvalParams) => void) => {
  const { nodes, devices } = circuit;

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);
  const prevVector = vecMake(n);
  const stamper = new Stamper(matrix, vector);

  const linear = false;

  return (params: EvalParams): void => {
    const startIteration = (): void => {
      for (const device of devices) {
        device.beginEval(device.state, params);
      }
    };

    const doIteration = (): void => {
      logger.iterationStarted();
      for (const device of devices) {
        device.eval(device.state, params);
      }
      for (const device of devices) {
        device.stamp(device.state, stamper);
      }
      solve(matrix, vector);
      circuit.updateNodes(vector);
      logger.iterationEnded();
    };

    const endIteration = (): void => {
      for (const device of devices) {
        device.endEval(device.state, params);
      }
    };

    matClear(matrix);
    vecClear(vector);

    if (linear) {
      // The circuit consists only of linear devices.
      // The solution can be obtained in a single step.

      logger.simulationStarted();
      startIteration();
      doIteration();
      endIteration();
      logger.simulationEnded();
    } else {
      // The circuit includes some non-linear devices.
      // Must perform multiple iterations until the convergence is reached.

      logger.simulationStarted();
      startIteration();
      for (const iteration of new Controller(options)) {
        doIteration();
        if (iteration > 1 && converged(options, nodes, prevVector, vector)) {
          break;
        }
        vecCopy(vector, prevVector);
        matClear(matrix);
        vecClear(vector);
      }
      endIteration();
      logger.simulationEnded();
    }
  };
};
