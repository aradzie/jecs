import type { Circuit } from "./circuit.js";

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

export const allNodeProbes = (circuit: Circuit): Probe[] => {
  const probes: Probe[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        probes.push(
          ...node.probes.map(({ name, unit, measure }) => ({
            name: `#${node.id}:${name}`,
            unit,
            measure,
          })),
        );
        break;
    }
  }
  return probes;
};

export const allDeviceProbes = (circuit: Circuit): Probe[] => {
  const probes: Probe[] = [];
  for (const device of circuit.devices) {
    probes.push(
      ...device.probes.map(({ name, unit, measure }) => ({
        name: `${device.id}:${name}`,
        unit,
        measure,
      })),
    );
  }
  return probes;
};

export const allCircuitProbes = (circuit: Circuit): Probe[] => {
  return [...allNodeProbes(circuit), ...allDeviceProbes(circuit)];
};
