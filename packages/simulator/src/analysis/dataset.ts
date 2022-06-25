import type { Circuit } from "../circuit/circuit.js";
import { toExponential } from "../util/format.js";

export interface Column {
  /** Column name which consists of parameter name with node or device name. */
  readonly name: string;
  /** Column unit. */
  readonly unit: string;
  /** Cell index in an output row. */
  readonly index: number;
}

export interface RowGroup {
  /** Group title. */
  readonly title: string | null;
  /** Group rows. */
  readonly rows: readonly Float64Array[];
}

/**
 * A table whose rows are node and device parameters.
 */
export type Dataset = {
  /** Columns. */
  readonly columns: readonly Column[];
  /** Row groups. */
  readonly rowGroups: readonly RowGroup[];
};

export type DatasetBuilder = {
  /**
   * Start a new row group.
   * @param title Row group title.
   */
  group(title: string | null): void;
  /**
   * Appends a new row to the dataset with node and device output parameters.
   * @param time The point in time for which the row is captured.
   */
  capture(time: number): void;
  /**
   * Creates and returns a new dataset with the captured values.
   */
  build(): Dataset;
};

type MutableRowGroup = {
  title: string | null;
  rows: Float64Array[];
};

export const makeDatasetBuilder = (
  { nodes, devices }: Circuit,
  timeColumn: boolean,
): DatasetBuilder => {
  const columns: Column[] = [];
  const rowGroups: MutableRowGroup[] = [];

  let rowGroup: MutableRowGroup = {
    title: null,
    rows: [],
  };

  if (timeColumn) {
    // Time column.
    columns.push({
      name: "time",
      unit: "S",
      index: columns.length,
    });
  }

  // Capture node voltages.
  for (const node of nodes) {
    if (node.type === "node") {
      columns.push({
        name: `#${node.id}:V`,
        unit: "V",
        index: columns.length,
      });
    }
  }

  // Capture device output parameters.
  for (const device of devices) {
    const { stateSchema } = device.deviceClass;
    for (const op of stateSchema.ops) {
      columns.push({
        name: `${device.id}:${op.name}`,
        unit: op.unit,
        index: columns.length,
      });
    }
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

    capture(time: number): void {
      const row = new Float64Array(columns.length);
      let index = 0;

      if (timeColumn) {
        // Time column.
        row[index++] = time;
      }

      // Capture node voltages.
      for (const node of nodes) {
        if (node.type === "node") {
          row[index++] = node.voltage;
        }
      }

      // Capture device output parameters.
      for (const device of devices) {
        const { stateSchema } = device.deviceClass;
        for (const op of stateSchema.ops) {
          row[index++] = device.state[op.index];
        }
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
      return { columns, rowGroups };
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
