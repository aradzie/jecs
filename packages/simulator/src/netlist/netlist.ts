import { Circuit } from "../circuit/circuit.js";
import type { Device, DeviceClass } from "../circuit/device.js";
import { getDeviceClass } from "../circuit/library.js";
import { Model } from "../circuit/model.js";
import type { Node } from "../circuit/network.js";
import { Ground } from "../device/index.js";
import { standardModels } from "../device/models.js";
import type { EquationItem, InstanceItem, ModelItem, Netlist } from "./ast.js";
import { dummy } from "./dummy.js";
import { NetlistError } from "./error.js";
import { parse } from "./parser.js";
import { Variables } from "./variables.js";

export function parseNetlist(input: string | Netlist, variables = new Variables()): Circuit {
  if (typeof input === "string") {
    input = parse(input);
  }
  const builder = new CircuitBuilder(input, variables);
  builder.addModels(standardModels);
  builder.buildCircuit();
  return builder.circuit;
}

interface Instance {
  readonly item: InstanceItem;
  readonly deviceClass: DeviceClass;
  readonly nodes: Node[];
  instanceId: string;
  device: Device;
}

class CircuitBuilder {
  readonly circuit = new Circuit();
  readonly netlist: Netlist;
  readonly variables: Variables;
  readonly models: Map<string, Model>;
  readonly instances: Instance[];

  constructor(netlist: Netlist, variables: Variables) {
    this.netlist = netlist;
    this.variables = variables;
    this.models = new Map();
    this.instances = [];
  }

  addModels(models: readonly Model[]): void {
    for (const model of models) {
      this.models.set(model.modelId, model);
    }
  }

  buildCircuit(): void {
    this.collectEquations();
    this.collectModels();
    this.collectInstances();
    this.assignNodes();
    this.assignInstanceIds();
    for (const instance of this.instances) {
      this.createDevice(instance);
    }
    for (const instance of this.instances) {
      this.setProperties(instance);
    }
    this.collectOptions();
  }

  collectEquations(): void {
    for (const item of this.netlist.items) {
      if (item.type === "equation") {
        this.addEquation(item);
      }
    }
  }

  addEquation(item: EquationItem): void {
    this.variables.setEquation(item);
  }

  collectModels(): void {
    for (const item of this.netlist.items) {
      if (item.type === "model") {
        this.addModel(item);
      }
    }
  }

  addModel(item: ModelItem): void {
    const deviceClass = getDeviceClass(item.deviceId.name);
    const model = new Model(item.modelId.name, deviceClass);
    for (const property of item.properties) {
      try {
        model.properties.set(property.id.name, this.variables.getValue(property.value));
      } catch (err: any) {
        throw new NetlistError(
          `Error in model [${item.modelId.name}]: ` +
            `Invalid property [${property.id.name}]. ${err.message}`,
        );
      }
    }
    this.models.set(model.modelId, model);
  }

  collectInstances(): void {
    for (const item of this.netlist.items) {
      if (item.type === "instance") {
        this.addInstance(item);
      }
    }
  }

  addInstance(item: InstanceItem): void {
    const deviceClass = getDeviceClass(item.deviceId.name);
    this.instances.push({
      item,
      deviceClass,
      instanceId: "",
      nodes: [],
      device: dummy,
    });
  }

  assignInstanceIds(): void {
    const taken = new Set<string>();

    // Process named instances.
    for (const instance of this.instances) {
      const { instanceId } = instance.item;
      if (instanceId != null) {
        const { name } = instanceId;
        if (taken.has(name)) {
          throw new NetlistError(`Duplicate instance id [${name}]`);
        }
        taken.add(name);
        instance.instanceId = name;
      }
    }

    // Process anonymous instances.
    for (const instance of this.instances) {
      const { instanceId } = instance.item;
      if (instanceId == null) {
        let counter = 1;
        let name;
        while (true) {
          name = `${instance.item.deviceId.name}${counter}`;
          if (!taken.has(name)) {
            break;
          }
          counter += 1;
        }
        taken.add(name);
        instance.instanceId = name;
      }
    }
  }

  assignNodes(): void {
    const map = new Map<string, Node>();

    const { groundNode } = this.circuit;

    map.set(groundNode.id, groundNode);

    // Find ground nodes.
    // Any node to which the Ground device is connected becomes the ground node.
    for (const instance of this.instances) {
      if (instance.deviceClass === Ground) {
        for (const { name } of instance.item.nodes) {
          map.set(name, groundNode);
        }
        instance.nodes.push(groundNode);
      }
    }

    // Find the remaining, non-ground nodes.
    for (const instance of this.instances) {
      for (const { name } of instance.item.nodes) {
        if (instance.deviceClass !== Ground) {
          let node = map.get(name);
          if (node == null) {
            map.set(name, (node = this.circuit.makeNode(name)));
          }
          instance.nodes.push(node);
        }
      }
    }
  }

  createDevice(instance: Instance): void {
    if (instance.nodes.length !== instance.deviceClass.numTerminals) {
      throw new NetlistError(
        `Error in instance [${instance.instanceId}]: Invalid number of nodes. ` +
          `Expected ${instance.deviceClass.numTerminals}, got ${instance.nodes.length}.`,
      );
    }

    this.circuit.addDevice(
      (instance.device = new instance.deviceClass(instance.instanceId, instance.nodes)),
    );
  }

  setProperties(instance: Instance): void {
    // Set properties from model.

    if (instance.item.modelId != null) {
      const model = this.models.get(instance.item.modelId.name);
      if (model == null) {
        throw new NetlistError(
          `Error in instance [${instance.instanceId}]: ` +
            `Model [${instance.item.modelId.name}] not found.`,
        );
      }
      if (model.deviceClass.id !== instance.deviceClass.id) {
        throw new NetlistError(
          `Error in instance [${instance.instanceId}]: ` +
            `Invalid device of model [${instance.item.modelId.name}]. ` +
            `Expected [${instance.deviceClass.id}], got [${model.deviceClass.id}].`,
        );
      }
      instance.device.properties.from(model.properties);
    }

    // Set properties from instance properties.

    for (const property of instance.item.properties) {
      try {
        instance.device.properties.set(property.id.name, this.variables.getValue(property.value));
      } catch (err: any) {
        throw new NetlistError(
          `Error in instance [${instance.instanceId}]: ` +
            `Invalid property [${property.id.name}]. ${err.message}`,
        );
      }
    }
  }

  collectOptions(): void {
    for (const item of this.netlist.items) {
      if (item.type === "options") {
        for (const property of item.properties) {
          try {
            this.circuit.options.set(property.id.name, this.variables.getValue(property.value));
          } catch (err: any) {
            throw new NetlistError(
              `Error in simulation options: ` +
                `Invalid property [${property.id.name}]. ${err.message}`,
            );
          }
        }
      }
    }
  }
}
