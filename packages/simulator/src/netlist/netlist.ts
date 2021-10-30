import { Circuit } from "../circuit/circuit";
import type { DeviceClass } from "../circuit/device";
import { CircuitError } from "../circuit/error";
import { createDevice, getDeviceClass, Initializer } from "../circuit/library";
import type { Node } from "../circuit/network";
import { Ground } from "../device";
import { NameMap } from "../util/map";
import type { Definition, Netlist } from "./ast";
import { parse } from "./parser";
import { Variables } from "./variables";

interface DefinitionItem {
  readonly item: Definition;
  readonly deviceClass: DeviceClass;
  instanceId: string;
}

export function parseNetlist(
  input: string | Netlist,
  variables = new Variables(),
): Circuit {
  if (typeof input === "string") {
    input = parse(input);
  }

  const circuit = new Circuit();

  const definitionItems: DefinitionItem[] = [];

  // Pass: collect equations and definitions.

  for (const item of input.items) {
    switch (item.type) {
      case "equation": {
        variables.setEquation(item);
        break;
      }
      case "definition": {
        definitionItems.push({
          item,
          deviceClass: getDeviceClass(item.id.name),
          instanceId: "",
        });
        break;
      }
    }
  }

  // Pass: generate unique instance names.

  assignInstanceIds(definitionItems);

  // Pass: collect nodes.

  const nodesMap = collectNodes(circuit, definitionItems);

  // Pass: create devices.

  for (const { item, deviceClass, instanceId } of definitionItems) {
    const nodes = item.nodes.map(({ name }) => nodesMap.get(name) as Node);
    const initializer: Initializer[] = [];
    if (item.modelId != null) {
      initializer.push(item.modelId.name);
    }
    initializer.push(variables.makeParams(item.params));
    circuit.addDevice(
      createDevice(deviceClass, instanceId, nodes, ...initializer),
    );
  }

  return circuit;
}

function assignInstanceIds(definitionItems: readonly DefinitionItem[]): void {
  const taken = new Set<string>();

  // Process named definitions.
  for (const definitionItem of definitionItems) {
    const { item } = definitionItem;
    const { instanceId } = item;
    if (instanceId != null) {
      const { name } = instanceId;
      const lcName = name.toLowerCase();
      if (taken.has(lcName)) {
        throw new CircuitError(`Duplicate instance name [${name}]`);
      }
      taken.add(lcName);
      definitionItem.instanceId = name;
    }
  }

  // Process anonymous definitions.
  for (const definitionItem of definitionItems) {
    const { item } = definitionItem;
    const { instanceId } = item;
    if (instanceId == null) {
      let counter = 1;
      let name;
      let lcName;
      while (true) {
        name = `${item.id.name}${counter}`;
        lcName = name.toLowerCase();
        if (!taken.has(lcName)) {
          break;
        }
        counter += 1;
      }
      taken.add(lcName);
      definitionItem.instanceId = name;
    }
  }
}

function collectNodes(
  circuit: Circuit,
  definitionItems: readonly DefinitionItem[],
): NameMap<Node> {
  const { groundNode } = circuit;
  const nodesMap = new NameMap<Node>([[groundNode.name, groundNode]]);

  // Find ground nodes.
  // Any node to which the Ground device is connected becomes the ground node.
  for (const { item, deviceClass } of definitionItems) {
    if (deviceClass === Ground) {
      for (const { name } of item.nodes) {
        nodesMap.set(name, groundNode);
      }
    }
  }

  // Find the remaining, non-ground nodes.
  for (const { item, deviceClass } of definitionItems) {
    for (const { name } of item.nodes) {
      if (deviceClass !== Ground) {
        if (!nodesMap.has(name)) {
          nodesMap.set(name, circuit.allocNode(name));
        }
      }
    }
  }

  return nodesMap;
}
