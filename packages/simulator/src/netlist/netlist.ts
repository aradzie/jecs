import { AcAnalysis } from "../analysis/analysis-ac.js";
import { DcAnalysis } from "../analysis/analysis-dc.js";
import { TrAnalysis } from "../analysis/analysis-tr.js";
import type { Analysis } from "../analysis/analysis.js";
import { Sweep } from "../analysis/sweep.js";
import { Circuit } from "../circuit/circuit.js";
import { Device, DeviceClass } from "../circuit/device.js";
import {
  BinaryExp,
  Binding,
  ConstantExp,
  Equations,
  Exp,
  FunctionExp,
  UnaryExp,
  VariableExp,
} from "../circuit/equations.js";
import { FunctionDef } from "../circuit/functions.js";
import { getDeviceClass } from "../circuit/library.js";
import { Model } from "../circuit/model.js";
import type { Node } from "../circuit/network.js";
import type { Properties } from "../circuit/properties.js";
import { standardModels } from "../device/models.js";
import type {
  AcItemNode,
  DcItemNode,
  EquationItemNode,
  ExpressionNode,
  InstanceItemNode,
  ModelItemNode,
  NetlistNode,
  PropertyNode,
  SweepNode,
  TrItemNode,
} from "./ast.js";
import { NetlistError } from "./error.js";
import { parse } from "./parser.js";

const constants = new Equations();

export class Netlist {
  static parse(
    content: string,
    {
      models = [],
    }: {
      readonly models?: readonly Model[];
    } = {},
  ): Netlist {
    const document = parse(content);
    const builder = new NetlistBuilder(document);
    builder.addModels(standardModels);
    builder.addModels(models);
    return builder.build();
  }

  constructor(readonly circuit: Circuit, readonly analyses: readonly Analysis[]) {}
}

interface Instance {
  readonly item: InstanceItemNode;
  readonly deviceClass: DeviceClass;
  readonly nodes: Node[];
  device: Device;
}

class NetlistBuilder {
  readonly document: NetlistNode;
  readonly circuit = new Circuit();
  readonly models = new Map<string, Model>();
  readonly nodes = new Map<string, Node>();
  readonly instances = new Map<string, Instance>();
  readonly analyses: Analysis[] = [];

  constructor(document: NetlistNode) {
    this.document = document;
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
    for (const instance of this.instances.values()) {
      this.circuit.connect(instance.device, instance.nodes);
    }
    this.collectAnalyses();
    return new Netlist(this.circuit, this.analyses);
  }

  collectEquations(): void {
    for (const item of this.document.items) {
      if (item.type === "equation") {
        this.addEquation(item);
      }
    }
  }

  addEquation(item: EquationItemNode): void {
    this.circuit.equations.set(item.id.name, toExp(item.value));
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
    for (const node of item.properties) {
      try {
        this.setConstantProperty(model.properties, node);
      } catch (err: any) {
        throw new NetlistError(
          `Error in model [${item.modelId.name}]: ` +
            `Invalid property [${node.id.name}]. ${err.message}`,
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
      device: Device.dummy,
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
    instance.device = new instance.deviceClass(instance.item.instanceId.name);
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

    for (const node of instance.item.properties) {
      try {
        this.setProperty(instance.device, node);
      } catch (err: any) {
        throw new NetlistError(
          `Error in instance [${instance.item.instanceId.name}]: ` +
            `Invalid property [${node.id.name}]. ${err.message}`,
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
        case "tr":
          this.addTrAnalysis(item);
          break;
        case "ac":
          this.addAcAnalysis(item);
          break;
      }
    }
  }

  addDcAnalysis(node: DcItemNode): void {
    const analysis = new DcAnalysis();
    this.setAnalysisProperties(analysis, node.properties);
    this.addAnalysisSweeps(analysis, node.sweeps);
    this.analyses.push(analysis);
  }

  addTrAnalysis(node: TrItemNode): void {
    const analysis = new TrAnalysis();
    this.setAnalysisProperties(analysis, node.properties);
    this.addAnalysisSweeps(analysis, node.sweeps);
    this.analyses.push(analysis);
  }

  addAcAnalysis(node: AcItemNode): void {
    const analysis = new AcAnalysis();
    this.setAnalysisProperties(analysis, node.properties);
    this.addAnalysisSweeps(analysis, node.sweeps);
    this.analyses.push(analysis);
  }

  private setAnalysisProperties(analysis: Analysis, nodes: readonly PropertyNode[]): void {
    for (const node of nodes) {
      try {
        this.setConstantProperty(analysis.properties, node);
      } catch (err: any) {
        throw new NetlistError(
          `Error in an analysis: ` + //
            `Invalid property [${node.id.name}]. ${err.message}`,
        );
      }
    }
  }

  private addAnalysisSweeps(analysis: Analysis, nodes: readonly SweepNode[]) {
    for (const node of nodes) {
      const sweep = new Sweep(node.id.name);
      this.setSweepProperties(sweep, node.properties);
      analysis.sweeps.push(sweep);
    }
  }

  private setSweepProperties(sweep: Sweep, nodes: readonly PropertyNode[]): void {
    for (const node of nodes) {
      try {
        this.setConstantProperty(sweep.properties, node);
      } catch (err: any) {
        throw new NetlistError(
          `Error in a sweep: ` + //
            `Invalid property [${node.id.name}]. ${err.message}`,
        );
      }
    }
  }

  private setProperty(device: Device, node: PropertyNode): void {
    switch (node.value.type) {
      case "string": {
        device.properties.set(node.id.name, node.value.value);
        break;
      }
      case "exp": {
        const exp = toExp(node.value.value);
        if (exp.isConstant()) {
          device.properties.set(node.id.name, exp.eval(this.circuit.equations));
        } else {
          this.circuit.bindings.add(new Binding(device, node.id.name, exp));
        }
        break;
      }
    }
  }

  private setConstantProperty(properties: Properties, node: PropertyNode): void {
    switch (node.value.type) {
      case "string": {
        properties.set(node.id.name, node.value.value);
        break;
      }
      case "exp": {
        const exp = toExp(node.value.value);
        properties.set(node.id.name, exp.eval(constants));
        break;
      }
    }
  }
}

function toExp(node: ExpressionNode): Exp {
  switch (node.type) {
    case "constant":
      return new ConstantExp(node.value);
    case "unary":
      return new UnaryExp(node.op, toExp(node.arg));
    case "binary":
      return new BinaryExp(node.op, toExp(node.arg1), toExp(node.arg2));
    case "variable":
      return new VariableExp(node.id.name);
    case "function":
      return new FunctionExp(FunctionDef.get(node.id.name), node.args.map(toExp));
  }
}
