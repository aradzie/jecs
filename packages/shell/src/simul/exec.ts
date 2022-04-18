import type { Circuit } from "@jssim/simulator/lib/circuit/circuit.js";
import { Ground } from "@jssim/simulator/lib/device/index.js";
import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc.js";

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

export function exec(value: string): Result {
  try {
    const circuit = parseNetlist(value);
    dcAnalysis(circuit);
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
    if (device instanceof Ground) {
      continue;
    }
    const { id: classId, stateParams } = device.getDeviceClass();
    for (const op of stateParams.ops) {
      ops.push({
        deviceId: `${classId}:${device.id}`,
        name: op.name,
        value: device.op(op.name),
        unit: op.unit,
      });
    }
  }
  return ops;
}
