import type { Circuit } from "../circuit/circuit.js";
import type { Device, OutputParam } from "../circuit/device.js";
import type { Node } from "../circuit/network.js";
import { toExponential } from "../util/format.js";

/**
 * Column describes a single dataset value.
 */
export interface Column {
  /** Column name which consists of parameter name with node or device name. */
  readonly name: string;
  /** Column unit. */
  readonly unit: string;
  /** Cell index in an output row. */
  readonly index: number;
}

/**
 * Row group contains all data rows from a single sweep.
 */
export interface RowGroup {
  /** Group title. */
  readonly title: string | null;
  /** Group rows. */
  readonly rows: readonly Float64Array[];
}

/**
 * Dataset is a simulation result, it contains values captured from a circuit.
 */
export type Dataset = {
  /** Columns. */
  readonly columns: readonly Column[];
  /** Row groups. */
  readonly rowGroups: readonly RowGroup[];
};

/**
 * Probe captures a single dataset value from a circuit after simulation.
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

export type DatasetBuilder = {
  /**
   * Starts a new row group.
   * @param title Row group title.
   */
  group(title: string | null): void;
  /**
   * Appends a new row to the dataset with the current probe values.
   */
  capture(): void;
  /**
   * Creates and returns a new dataset with all the captured values.
   */
  build(): Dataset;
};

type ProbeColumn = {
  readonly probe: Probe;
  readonly index: number;
};

type MutableRowGroup = {
  title: string | null;
  rows: Float64Array[];
};

export const makeDatasetBuilder = (probes: readonly Probe[]): DatasetBuilder => {
  const columns: ProbeColumn[] = [];
  const rowGroups: MutableRowGroup[] = [];

  let rowGroup: MutableRowGroup = {
    title: null,
    rows: [],
  };

  for (const probe of probes) {
    columns.push({
      probe,
      index: columns.length,
    });
  }

  return new (class implements DatasetBuilder {
    group(title: string | null): void {
      if (rowGroup.rows.length > 0) {
        rowGroups.push(rowGroup);
      }
      rowGroup = {
        title,
        rows: [],
      };
    }

    capture(): void {
      const row = new Float64Array(columns.length);
      for (const { index, probe } of columns) {
        row[index] = probe.measure();
      }
      rowGroup.rows.push(row);
    }

    build(): Dataset {
      if (rowGroup.rows.length > 0) {
        rowGroups.push(rowGroup);
      }
      rowGroup = {
        title: null,
        rows: [],
      };
      return {
        columns: columns.map(({ probe: { name, unit }, index }) => ({ name, unit, index })),
        rowGroups,
      };
    }
  })();
};

export const formatSchema = ({ columns }: Dataset): string => {
  const lines: string[] = [];
  for (let i = 0; i < columns.length; i++) {
    lines.push(`${i + 1} ${columns[i].name}\n`);
  }
  return lines.join("");
};

export const formatData = (
  { columns, rowGroups }: Dataset,
  { fractionDigits = 10 }: { readonly fractionDigits?: number } = {},
): string => {
  const lines: string[] = [];
  for (const rowGroup of rowGroups) {
    if (lines.length > 0) {
      lines.push("");
      lines.push("");
    }
    if (rowGroup.title) {
      lines.push(rowGroup.title);
    }
    for (const row of rowGroup.rows) {
      const line: string[] = [];
      for (let i = 0; i < columns.length; i++) {
        line.push(toExponential(row[i], fractionDigits));
      }
      lines.push(line.join(" "));
    }
  }
  return lines.join("\n");
};
