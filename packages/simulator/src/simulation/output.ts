import type { Circuit } from "../circuit/circuit.js";
import { Ground } from "../device/index.js";

export interface Op<T = number | Float64Array> {
  readonly name: string;
  /** Parameter unit. */
  readonly unit: string;
  /** Parameter value. */
  readonly value: T;
}

export type ScalarOp = Op<number>;

export type VectorOp = Op<Float64Array>;

export function captureOp({ nodes, devices }: Circuit): Map<string, ScalarOp> {
  const ops = new Map<string, ScalarOp>();

  // Capture node voltages and branch currents.
  for (const node of nodes) {
    if (node.type === "node") {
      const name = `V(#${node.id})`;
      ops.set(name, {
        name,
        unit: "V",
        value: node.voltage,
      });
    } else {
      const name = `I(#${node.a.id}-#${node.b.id})`;
      ops.set(name, {
        name,
        unit: "A",
        value: node.current,
      });
    }
  }

  // Capture device output parameters.
  for (const device of devices) {
    if (device instanceof Ground) {
      continue;
    }
    const { stateParams } = device.getDeviceClass();
    for (const op of stateParams.ops) {
      const name = `${op.name}(${device.id})`;
      ops.set(name, {
        name,
        unit: op.unit,
        value: device.state[op.index],
      });
    }
  }

  return ops;
}

export function captureVectorOp(
  { nodes, devices }: Circuit,
  length: number,
): [Map<string, VectorOp>, (elapsedTime: number) => void] {
  const ops = new Map<string, VectorOp>();
  const updaters: (() => void)[] = [];

  let index = 0;

  const time = new Float64Array(length);
  ops.set("T", {
    name: "T",
    unit: "S",
    value: time,
  });

  // Capture node voltages and branch currents.
  for (const node of nodes) {
    if (node.type === "node") {
      const name = `V(#${node.id})`;
      const value = new Float64Array(length);
      ops.set(name, {
        name,
        unit: "V",
        value,
      });
      updaters.push(() => {
        value[index] = node.voltage;
      });
    } else {
      const name = `I(#${node.a.id}-#${node.b.id})`;
      const value = new Float64Array(length);
      ops.set(name, {
        name,
        unit: "A",
        value,
      });
      updaters.push(() => {
        value[index] = node.current;
      });
    }
  }

  // Capture device output parameters.
  for (const device of devices) {
    if (device instanceof Ground) {
      continue;
    }
    const { stateParams } = device.getDeviceClass();
    for (const op of stateParams.ops) {
      const name = `${op.name}(${device.id})`;
      const value = new Float64Array(length);
      ops.set(name, {
        name,
        unit: op.unit,
        value: value,
      });
      updaters.push(() => {
        value[index] = device.state[op.index];
      });
    }
  }

  const append = (elapsedTime: number): void => {
    time[index] = elapsedTime;
    for (const updater of updaters) {
      updater();
    }
    index += 1;
  };

  return [ops, append];
}
