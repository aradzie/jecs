import type { Circuit } from "../circuit/circuit";
import type { Device, DeviceClass } from "../circuit/device";
import { Stamper } from "../circuit/network";
import { solve } from "../math/gauss-elimination";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "../math/matrix";
import { converged } from "./convergence";
import { SimulationError } from "./error";
import type { Options } from "./options";
import { defaultOptions } from "./options";

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

  for (const device of devices) {
    const deviceClass = device.constructor as DeviceClass;
    device.state = vecMake(deviceClass.stateParams.length);
  }

  const controller = new Controller();

  const n = nodes.length;
  const matrix = matMake(n, n);
  const vector = vecMake(n);
  const prevVector = vecMake(n);

  const stamper = new Stamper(matrix, vector);

  for (const iteration of controller) {
    matClear(matrix);
    vecClear(vector);

    for (const device of devices) {
      const { state } = device;
      device.eval(state, false);
      device.stamp(stamper, state);
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

  for (const device of devices) {
    const { state } = device;
    device.eval(state, true);

    const deviceClass = device.constructor as DeviceClass;
    const values = deviceClass.stateParams.outputs.map(
      ({ index, name, unit }) => [name, unit, state[index]] as DeviceValue,
    );
    output.push([deviceClass.id, device.id, values]);
  }

  return output;
}
