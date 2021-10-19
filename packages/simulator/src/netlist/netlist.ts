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
      variables.setEquation(item);
    }
  }

  // Add devices.
  for (const item of items) {
    if (item.type === "definition") {
      const { id, instanceId, nodes, props } = item;
      circuit.addDevice(
        createDevice(
          getDeviceClass(id.name),
          deviceName(id, instanceId),
          nodes.map(nameToNode),
          mapProps(variables, props),
        ),
      );
    }
  }

  return circuit;
}

function mapProps(
  variables: Variables,
  props: readonly Property[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const { id, value } of props) {
    switch (value.type) {
      case "string":
        result[id.name] = value.value;
        break;
      case "exp":
        result[id.name] = variables.evalExp(value.value);
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
  return ({ name }: Identifier): Node => {
    let node = nodeMap.get(name) ?? null;
    if (node == null) {
      nodeMap.set(name, (node = circuit.allocNode(name)));
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
  return (id: Identifier, instanceId: Identifier | null): string => {
    if (instanceId == null) {
      const prefix = id.name;
      let index = instanceCounter.get(prefix) ?? 0;
      instanceCounter.set(prefix, (index += 1));
      return `${prefix}${index}`;
    } else {
      return instanceId.name;
    }
  };
}
