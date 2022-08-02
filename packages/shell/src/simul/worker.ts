import type { Circuit } from "@jecs/simulator/lib/circuit/circuit.js";
import { Netlist } from "@jecs/simulator/lib/netlist/netlist.js";
import type { Content, Op, Result } from "./types.js";

onmessage = (ev: MessageEvent<Content>): void => {
  postMessage(exec(ev.data.content));
};

function exec(content: string): Result {
  try {
    const { circuit, analyses } = Netlist.parse(content);
    for (const analysis of analyses) {
      analysis.run(circuit);
    }
    return {
      type: "ok",
      ops: getOps(circuit),
    };
  } catch (err: any) {
    return {
      type: "error",
      error: {
        name: err.name || "Error",
        message: err.message || "Unknown",
        location: err.location || null,
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
