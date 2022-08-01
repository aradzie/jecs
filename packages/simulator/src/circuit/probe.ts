import type { Circuit } from "./circuit.js";
import type { Device, OutputParam } from "./device.js";
import type { Branch, Node } from "./network.js";

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
 * Returns a probe which measures elapsed time from TR simulation.
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
 * Returns a probe which measures frequency from AC simulation.
 */
export const frequencyProbe = (circuit: Circuit): Probe => {
  return new (class implements Probe {
    name = "frequency";
    unit = "Hz";
    measure(): number {
      return circuit.frequency;
    }
  })();
};

/**
 * Return a probe which captures node voltage.
 */
export const nodeVoltageProbe = (node: Node): Probe => {
  return new (class implements Probe {
    name = `#${node.id}:V`;
    unit = "V";
    measure(): number {
      return node.voltage;
    }
  })();
};

/**
 * Return a probe which captures node AC phase.
 */
export const nodePhaseProbe = (node: Node): Probe => {
  return new (class implements Probe {
    name = `#${node.id}:phase`;
    unit = "angle";
    measure(): number {
      return node.phase;
    }
  })();
};

/**
 * Return a probe which captures branch current.
 */
export const branchCurrentProbe = (branch: Branch): Probe => {
  return new (class implements Probe {
    name = `#${branch}:I`;
    unit = "V";
    measure(): number {
      return branch.current;
    }
  })();
};

/**
 * Return a probe which captures branch AC phase.
 */
export const branchPhaseProbe = (branch: Branch): Probe => {
  return new (class implements Probe {
    name = `#${branch}:phase`;
    unit = "angle";
    measure(): number {
      return branch.phase;
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

export const allNodeProbes = (circuit: Circuit, ac = false): Probe[] => {
  const probes: Probe[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        probes.push(nodeVoltageProbe(node));
        if (ac) {
          probes.push(nodePhaseProbe(node));
        }
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
