import { Circuit } from "../circuit/circuit";
import type { DeviceClass } from "../circuit/device";
import { createDevice, getDeviceClass } from "../circuit/devicemap";
import type { Node } from "../circuit/network";
import type { RawDeviceProps } from "../circuit/props";
import { Ground } from "../device";
import type { Definition, Identifier, Netlist } from "./ast";
import { parse } from "./parser";
import { Variables } from "./variables";

interface ExtDef {
  readonly item: Definition;
  readonly deviceClass: DeviceClass;
  instanceId: string;
  nodes: Node[];
  props: RawDeviceProps;
}

export function parseNetlist(
  input: string | Netlist,
  variables = new Variables(),
): Circuit {
  if (typeof input === "string") {
    input = parse(input);
  }

  const defs: ExtDef[] = [];

  for (const item of input.items) {
    switch (item.type) {
      case "equation":
        variables.setEquation(item);
        break;
      case "definition":
        defs.push({
          item,
          deviceClass: getDeviceClass(item.id.name),
        } as ExtDef);
        break;
    }
  }

  const circuit = new Circuit();

  assignInstanceIds(defs);
  mapNodes(circuit, defs);
  mapProps(variables, defs);

  for (const { deviceClass, instanceId, nodes, props } of defs) {
    circuit.addDevice(createDevice(deviceClass, instanceId, nodes, props));
  }

  return circuit;
}

function assignInstanceIds(defs: readonly ExtDef[]): void {
  const takenIds = new Set<string>();

  // Process named definitions.
  for (const def of defs) {
    const { item } = def;
    const { instanceId } = item;
    if (instanceId != null) {
      takenIds.add(instanceId.name);
      def.instanceId = instanceId.name;
    }
  }

  // Process anonymous definitions.
  for (const def of defs) {
    const { item } = def;
    const { instanceId } = item;
    if (instanceId == null) {
      let counter = 1;
      let candidateId = "";
      while (true) {
        candidateId = `${item.id.name}${counter}`;
        if (!takenIds.has(candidateId)) {
          break;
        }
        counter += 1;
      }
      takenIds.add(candidateId);
      def.instanceId = candidateId;
    }
  }
}

function mapNodes(circuit: Circuit, defs: readonly ExtDef[]): void {
  const { groundNode } = circuit;

  const nodes = new Map<string, Node>([[groundNode.name, groundNode]]);
  const mapper = ({ name }: Identifier): Node => {
    let node = nodes.get(name);
    if (node == null) {
      nodes.set(name, (node = circuit.allocNode(name)));
    }
    return node;
  };

  // Find ground nodes.
  let found = false;
  for (const def of defs) {
    const { item } = def;
    if (item.id.name === Ground.id) {
      found = true;
      for (const node of item.nodes) {
        nodes.set(node.name, groundNode);
      }
    } else {
      found = found || item.nodes.some(({ name }) => name === groundNode.name);
    }
  }

  // Allocate and assign nodes.
  for (const def of defs) {
    def.nodes = def.item.nodes.map(mapper);
  }
}

function mapProps(variables: Variables, defs: ExtDef[]): void {
  for (const def of defs) {
    def.props = variables.mapProps(def.item.props);
  }
}
