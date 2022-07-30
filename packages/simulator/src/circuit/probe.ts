import type { Circuit } from "./circuit.js";
import type { Device, OutputParam } from "./device.js";
import type { Node } from "./network.js";

/**
 * Probe captures a single dataset value from a circuit or node or device after simulation.
 */
export type Probe = {
  /** Probe name. */
  readonly name: string;
  /** Probe unit. */
  readonly unit: string;
  /** Returns probe value. */
  measure(): number;
};

/**
 * Returns a probe which measures elapsed time from transient simulation.
 */
export const timeProbe = (circuit: Circuit): Probe => {
  return new (class implements Probe {
    name = "time";
    unit = "s";
    measure(): number {
      return circuit.elapsedTime;
    }
  })();
};

/**
 * Return a probe which captures node voltage.
 */
export const nodeProbe = (node: Node): Probe => {
  return new (class implements Probe {
    name = `#${node.id}:V`;
    unit = "V";
    measure(): number {
      return node.voltage;
    }
  })();
};

/**
 * Returns a probe which captures a device output parameter.
 */
export const deviceProbe = (device: Device, op: OutputParam): Probe => {
  return new (class implements Probe {
    name = `${device.id}:${op.name}`;
    unit = op.unit;
    measure(): number {
      return device.state[op.index];
    }
  })();
};

export const allNodeProbes = (circuit: Circuit): Probe[] => {
  const probes: Probe[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        probes.push(nodeProbe(node));
        break;
      case "branch":
        break;
    }
  }
  return probes;
};

export const allDeviceProbes = (circuit: Circuit): Probe[] => {
  const probes: Probe[] = [];
  for (const device of circuit.devices) {
    for (const op of device.deviceClass.stateSchema.ops) {
      probes.push(deviceProbe(device, op));
    }
  }
  return probes;
};

export const allCircuitProbes = (circuit: Circuit): Probe[] => {
  return [...allNodeProbes(circuit), ...allDeviceProbes(circuit)];
};
