import type { Circuit } from "../circuit/circuit.js";
import { Ground } from "../device/index.js";
import { formatNumber } from "../util/format.js";

export interface Op {
  /** Column name which consists of parameter name with node or device name. */
  readonly name: string;
  /** Column unit. */
  readonly unit: string;
  /** Cell index in an output row. */
  readonly index: number;
}

/**
 * A table whose rows are node and device parameters.
 */
export type Output = {
  /** Column names. */
  readonly schema: readonly Op[];
  /** Data rows. */
  readonly data: readonly Float64Array[];
};

export type OutputBuilder = {
  append(elapsedTime: number): void;
  build(): Output;
};

export const makeOutputBuilder = ({ nodes, devices }: Circuit): OutputBuilder => {
  const schema: Op[] = [];
  const data: Float64Array[] = [];

  // Time column.
  schema.push({ name: "time", unit: "S", index: schema.length });

  // Capture node voltages.
  for (const node of nodes) {
    if (node.type === "node") {
      schema.push({
        name: `V(#${node.id})`,
        unit: "V",
        index: schema.length,
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
      schema.push({
        name: `${op.name}(${device.id})`,
        unit: op.unit,
        index: schema.length,
      });
    }
  }

  return new (class implements OutputBuilder {
    append(elapsedTime: number): void {
      const row = new Float64Array(schema.length);
      let index = 0;

      // Time column.
      row[index++] = elapsedTime;

      // Capture node voltages.
      for (const node of nodes) {
        if (node.type === "node") {
          row[index++] = node.voltage;
        }
      }

      // Capture device output parameters.
      for (const device of devices) {
        if (device instanceof Ground) {
          continue;
        }
        const { stateParams } = device.getDeviceClass();
        for (const op of stateParams.ops) {
          row[index++] = device.state[op.index];
        }
      }

      data.push(row);
    }

    build(): Output {
      return { schema, data };
    }
  })();
};

export const exportDataset = ({ schema, data }: Output): string => {
  const lines: string[] = [];
  for (const row of data) {
    const line: string[] = [];
    for (let i = 0; i < schema.length; i++) {
      line.push(String(row[i]));
    }
    lines.push(line.join(" "));
  }
  return lines.join("\n");
};

export const formatSchema = ({ schema }: Output): string => {
  const lines: string[] = [];
  for (let i = 0; i < schema.length; i++) {
    lines.push(`#${i + 1}\t${schema[i].name}`);
  }
  return lines.join("\n");
};

export const formatRow = ({ schema, data }: Output, index: number): string => {
  if (index < 0 || index >= data.length) {
    throw new TypeError();
  }
  const row = data[index];
  const items: string[] = [];
  for (const op of schema) {
    items.push(`${op.name}=${formatNumber(row[op.index], op.unit)}`);
  }
  return items.join("; ");
};
