import { Circuit } from "../circuit/circuit";
import type { DeviceClass } from "../circuit/device";
import { CircuitError } from "../circuit/error";
import { createDevice, getDeviceClass, Initializer } from "../circuit/library";
import type { Node } from "../circuit/network";
import { Ground } from "../device";
import type { Definition, Netlist } from "./ast";
import { parse } from "./parser";
import { Variables } from "./variables";

interface NamedItem {
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

  // Pass: collect variables.

  for (const item of input.items) {
    switch (item.type) {
      case "equation": {
        variables.setEquation(item);
        break;
      }
    }
  }

  // Pass: map nodes.

  const { groundNode } = circuit;
  const nodesMap = new Map<string, Node>([[groundNode.name, groundNode]]);
  // Find ground nodes.
  for (const item of input.items) {
    switch (item.type) {
      case "definition": {
        // Any node to which the Ground device is connected
        // becomes the ground node.
        if (item.id.name === Ground.id) {
          for (const { name } of item.nodes) {
            nodesMap.set(name, groundNode);
          }
        }
        break;
      }
    }
  }
  // Find the remaining nodes.
  for (const item of input.items) {
    switch (item.type) {
      case "definition": {
        for (const { name } of item.nodes) {
          if (!nodesMap.has(name)) {
            nodesMap.set(name, circuit.allocNode(name));
          }
        }
        break;
      }
    }
  }

  // Pass: generate unique instance names.

  const namedItems: NamedItem[] = [];
  for (const item of input.items) {
    switch (item.type) {
      case "definition": {
        namedItems.push({
          item,
          deviceClass: getDeviceClass(item.id.name),
          instanceId: "",
        });
        break;
      }
    }
  }
  assignInstanceIds(namedItems);

  // Pass: create devices.

  for (const { item, deviceClass, instanceId } of namedItems) {
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

function assignInstanceIds(namedItems: readonly NamedItem[]): void {
  const taken = new Set<string>();

  // Process named definitions.
  for (const namedItem of namedItems) {
    const { item } = namedItem;
    const { instanceId } = item;
    if (instanceId != null) {
      const { name } = instanceId;
      if (taken.has(name)) {
        throw new CircuitError(`Duplicate instance name [${name}]`);
      }
      taken.add(name);
      namedItem.instanceId = name;
    }
  }

  // Process anonymous definitions.
  for (const namedItem of namedItems) {
    const { item } = namedItem;
    const { instanceId } = item;
    if (instanceId == null) {
      let counter = 1;
      let name;
      while (true) {
        name = `${item.id.name}${counter}`;
        if (!taken.has(name)) {
          break;
        }
        counter += 1;
      }
      taken.add(name);
      namedItem.instanceId = name;
    }
  }
}
