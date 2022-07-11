import type { Circuit } from "@jecs/simulator/lib/circuit/circuit.js";
import { Netlist } from "@jecs/simulator/lib/netlist/netlist.js";

export type Result = OkResult | ErrorResult;

export type OkResult = {
  readonly type: "ok";
  readonly ops: readonly Op[];
};

export type ErrorResult = {
  readonly type: "error";
  readonly error: {
    readonly name: string;
    readonly message: string;
  };
};

export type Op = {
  readonly deviceId: string;
  readonly name: string | null;
  readonly value: number;
  readonly unit: string;
};

export function exec(content: string): Result {
  try {
    const { circuit, analyses } = Netlist.parse(content);
    for (const analysis of analyses) {
      analysis.run(circuit);
    }
    return {
      type: "ok",
      ops: getOps(circuit),
    };
  } catch (err: unknown) {
    return {
      type: "error",
      error: err as {
        name: string;
        message: string;
      },
    };
  }
}

function getOps(circuit: Circuit): readonly Op[] {
  const ops: Op[] = [];
  for (const node of circuit.nodes) {
    switch (node.type) {
      case "node":
        ops.push({
          deviceId: node.id,
          name: null,
          value: node.voltage,
          unit: "V",
        });
        break;
    }
  }
  for (const device of circuit.devices) {
    const { id: classId, stateSchema } = device.deviceClass;
    for (const op of stateSchema.ops) {
      ops.push({
        deviceId: `${classId}:${device.id}`,
        name: op.name,
        value: device.state[op.index],
        unit: op.unit,
      });
    }
  }
  return ops;
}
