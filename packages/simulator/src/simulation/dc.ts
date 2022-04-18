import { solve } from "@jssim/math/lib/gauss-elimination.js";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import type { Circuit } from "../circuit/circuit.js";
import type { Device, EvalOptions } from "../circuit/device.js";
import { Stamper } from "../circuit/network.js";
import { converged } from "./convergence.js";
import { SimulationError } from "./error.js";
import type { Options } from "./options.js";
import { defaultOptions } from "./options.js";

export type Output = readonly DeviceOutput[];

export type DeviceOutput = readonly [
  // Device class identifier.
  deviceId: string,
  // Device instance identifier.
  id: string,
  // The list of device output parameters.
  values: readonly DeviceValue[],
];

export type DeviceValue = readonly [
  // Parameter name.
  name: string,
  // Parameter unit.
  unit: string,
  // Parameter value.
  value: number,
];

export function dcAnalysis(circuit: Circuit, userOptions: Partial<Options> = {}): Output {
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

  const evalOptions: EvalOptions = {
    damped: true,
    gmin: options.gmin,
  };

  for (const iteration of controller) {
    matClear(matrix);
    vecClear(vector);

    for (const device of devices) {
      const { state } = device;

      device.eval(state, evalOptions);
      device.stamp(state, stamper);
    }

    solve(matrix, vector);

    circuit.updateNodes(vector);

    if (iteration > 1 && converged(options, nodes, prevVector, vector)) {
      break;
    }

    vecCopy(vector, prevVector);
  }

  return makeOutput(devices);
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

function makeOutput(devices: readonly Device[]): Output {
  const output: DeviceOutput[] = [];

  const evalOptions: EvalOptions = {
    damped: false,
    gmin: 0,
  };

  for (const device of devices) {
    const { state } = device;
    device.eval(state, evalOptions);

    const deviceClass = device.getDeviceClass();
    const values = deviceClass.stateParams.ops.map(
      ({ index, name, unit }) => [name, unit, state[index]] as DeviceValue,
    );
    output.push([deviceClass.id, device.id, values]);
  }

  return output;
}
