import { Circuit } from "../circuit/circuit";
import { createDevice, getDeviceClass } from "../circuit/devicemap";
import type { Node } from "../circuit/network";
import type { Identifier, Property } from "./ast";
import { parse } from "./parser";
import { Variables } from "./variables";

export function parseNetlist(
  input: string,
  variables = new Variables(),
): Circuit {
  const circuit = new Circuit();
  const deviceName = makeDeviceNamer();
  const nameToNode = makeNodeMapper(circuit);
  const { items } = parse(input);

  // Add equations.
  for (const item of items) {
    if (item.type === "equation") {
      variables.addEquation(item);
    }
  }

  // Add devices.
  for (const item of items) {
    if (item.type === "definition") {
      const { deviceId, id, nodes, properties } = item;
      circuit.addDevice(
        createDevice(
          getDeviceClass(deviceId.id),
          deviceName(deviceId, id),
          nodes.map(nameToNode),
          mapProps(variables, properties),
        ),
      );
    }
  }

  return circuit;
}

function mapProps(
  variables: Variables,
  properties: readonly Property[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const { name, value } of properties) {
    switch (value.type) {
      case "string":
        result[name.id] = value.value;
        break;
      case "exp":
        result[name.id] = variables.evalExp(value.value);
    }
  }
  return result;
}

function makeNodeMapper(circuit: Circuit): (id: Identifier) => Node {
  const { groundNode } = circuit;
  const nodeMap = new Map<string, Node>([
    ["g", groundNode],
    ["gnd", groundNode],
  ]);
  return ({ id }: Identifier): Node => {
    let node = nodeMap.get(id) ?? null;
    if (node == null) {
      nodeMap.set(id, (node = circuit.allocNode(id)));
    }
    return node;
  };
}

function makeDeviceNamer(): (
  deviceId: Identifier,
  id: Identifier | null,
) => string {
  // TODO Generate truly unique names, avoid collisions with existing names.
  const instanceCounter = new Map<string, number>();
  return (deviceId: Identifier, id: Identifier | null): string => {
    if (id == null) {
      const prefix = deviceId.id;
      let index = instanceCounter.get(prefix) ?? 0;
      instanceCounter.set(prefix, (index += 1));
      return `${prefix}${index}`;
    } else {
      return id.id;
    }
  };
}
