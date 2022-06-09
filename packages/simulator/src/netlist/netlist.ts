import { Circuit } from "../circuit/circuit.js";
import type { Device, DeviceClass } from "../circuit/device.js";
import { getDeviceClass } from "../circuit/library.js";
import { Model } from "../circuit/model.js";
import type { Node } from "../circuit/network.js";
import { standardModels } from "../device/models.js";
import { Analysis, DcAnalysis, TranAnalysis } from "../simulation/analysis.js";
import { Sweep } from "../simulation/sweep.js";
import type {
  DcItemNode,
  EquationItemNode,
  InstanceItemNode,
  ModelItemNode,
  NetlistNode,
  PropertyNode,
  SweepNode,
  TranItemNode,
} from "./ast.js";
import { dummy } from "./dummy.js";
import { NetlistError } from "./error.js";
import { parse } from "./parser.js";
import { Variables } from "./variables.js";

export class Netlist {
  static parse(
    content: string,
    {
      variables = new Variables(),
      models = [],
    }: {
      readonly variables?: Variables;
      readonly models?: readonly Model[];
    } = {},
  ): Netlist {
    const document = parse(content);
    const builder = new NetlistBuilder(document, variables);
    builder.addModels(standardModels);
    builder.addModels(models);
    return builder.build();
  }

  constructor(
    readonly circuit: Circuit,
    readonly variables: Variables,
    readonly analyses: readonly Analysis[],
  ) {}

  runAnalyses(): void {
    for (const analysis of this.analyses) {
      analysis.run(this.circuit);
    }
  }
}

interface Instance {
  readonly item: InstanceItemNode;
  readonly deviceClass: DeviceClass;
  readonly nodes: Node[];
  device: Device;
}

class NetlistBuilder {
  readonly circuit = new Circuit();
  readonly document: NetlistNode;
  readonly variables: Variables;
  readonly models: Map<string, Model>;
  readonly nodes: Map<string, Node>;
  readonly instances: Map<string, Instance>;
  readonly analyses: Analysis[];

  constructor(document: NetlistNode, variables: Variables) {
    this.document = document;
    this.variables = variables;
    this.models = new Map();
    this.nodes = new Map();
    this.instances = new Map();
    this.analyses = [];
  }

  addModels(models: readonly Model[]): void {
    for (const model of models) {
      this.models.set(model.modelId, model);
    }
  }

  build(): Netlist {
    this.collectEquations();
    this.collectModels();
    this.collectInstances();
    this.assignNodes();
    for (const instance of this.instances.values()) {
      this.createInstance(instance);
    }
    for (const instance of this.instances.values()) {
      this.setInstanceProperties(instance);
    }
    this.collectAnalyses();
    return new Netlist(this.circuit, this.variables, this.analyses);
  }

  collectEquations(): void {
    for (const item of this.document.items) {
      if (item.type === "equation") {
        this.addEquation(item);
      }
    }
  }

  addEquation(item: EquationItemNode): void {
    this.variables.setEquation(item);
  }

  collectModels(): void {
    for (const item of this.document.items) {
      if (item.type === "model") {
        this.addModel(item);
      }
    }
  }

  addModel(item: ModelItemNode): void {
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
    for (const item of this.document.items) {
      if (item.type === "instance") {
        this.addInstance(item);
      }
    }
  }

  addInstance(item: InstanceItemNode): void {
    const deviceClass = getDeviceClass(item.deviceId.name);
    if (this.instances.has(item.instanceId.name)) {
      throw new NetlistError(`Duplicate instance identifier [${item.instanceId.name}].`);
    }
    this.instances.set(item.instanceId.name, {
      item,
      deviceClass,
      nodes: [],
      device: dummy,
    });
  }

  assignNodes(): void {
    const { groundNode } = this.circuit;
    this.nodes.set(groundNode.id, groundNode);
    for (const instance of this.instances.values()) {
      for (const { name } of instance.item.nodes) {
        let node = this.nodes.get(name);
        if (node == null) {
          this.nodes.set(name, (node = this.circuit.makeNode(name)));
        }
        instance.nodes.push(node);
      }
    }
  }

  createInstance(instance: Instance): void {
    if (instance.nodes.length !== instance.deviceClass.numTerminals) {
      throw new NetlistError(
        `Error in instance [${instance.item.instanceId.name}]: Invalid number of nodes. ` +
          `Expected ${instance.deviceClass.numTerminals}, got ${instance.nodes.length}.`,
      );
    }

    this.circuit.addDevice(
      (instance.device = new instance.deviceClass(instance.item.instanceId.name, instance.nodes)),
    );
  }

  setInstanceProperties(instance: Instance): void {
    // Set properties from model.

    if (instance.item.modelId != null) {
      const model = this.models.get(instance.item.modelId.name);
      if (model == null) {
        throw new NetlistError(
          `Error in instance [${instance.item.instanceId.name}]: ` +
            `Model [${instance.item.modelId.name}] not found.`,
        );
      }
      if (model.deviceClass.id !== instance.deviceClass.id) {
        throw new NetlistError(
          `Error in instance [${instance.item.instanceId.name}]: ` +
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
          `Error in instance [${instance.item.instanceId.name}]: ` +
            `Invalid property [${property.id.name}]. ${err.message}`,
        );
      }
    }
  }

  collectAnalyses(): void {
    for (const item of this.document.items) {
      switch (item.type) {
        case "dc":
          this.addDcAnalysis(item);
          break;
        case "tran":
          this.addTranAnalysis(item);
          break;
      }
    }
  }

  addDcAnalysis(item: DcItemNode): void {
    const analysis = new DcAnalysis();
    this.setAnalysisProperties(item.properties, analysis);
    this.addAnalysisSweeps(item.sweeps, analysis);
    this.analyses.push(analysis);
  }

  addTranAnalysis(item: TranItemNode): void {
    const analysis = new TranAnalysis();
    this.setAnalysisProperties(item.properties, analysis);
    this.addAnalysisSweeps(item.sweeps, analysis);
    this.analyses.push(analysis);
  }

  private setAnalysisProperties(properties: readonly PropertyNode[], analysis: Analysis) {
    for (const { id, value } of properties) {
      try {
        analysis.properties.set(id.name, this.variables.getValue(value));
      } catch (err: any) {
        throw new NetlistError(
          `Error in analysis properties: ` + //
            `Invalid property [${id.name}]. ${err.message}`,
        );
      }
    }
  }

  private addAnalysisSweeps(sweeps: readonly SweepNode[], analysis: Analysis) {
    for (const { instanceId, propertyId, from, to, points } of sweeps) {
      const instance = this.instances.get(instanceId.name);
      if (instance == null) {
        throw new NetlistError(`Error in analysis: Unknown sweep instance [${instanceId.name}].`);
      }
      try {
        instance.device.properties.prop(propertyId.name);
      } catch {
        throw new NetlistError(`Error in analysis: Unknown sweep property [${propertyId.name}].`);
      }
      analysis.sweeps.push(new Sweep(instanceId.name, propertyId.name, from, to, points));
    }
  }
}
