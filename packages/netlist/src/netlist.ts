import { devices, standardModels } from "@jecs/devices";
import {
  AcAnalysis,
  type Analysis,
  BinaryExp,
  Binding,
  Circuit,
  ConstantExp,
  DcAnalysis,
  Device,
  type DeviceClass,
  Equations,
  type Exp,
  FunctionDef,
  FunctionExp,
  getDeviceClass,
  Model,
  type Node,
  type Props,
  registerDeviceClass,
  Sweep,
  TrAnalysis,
  UnaryExp,
  VariableExp,
} from "@jecs/simulator";
import type {
  AcItemNode,
  DcItemNode,
  EquationItemNode,
  ExpressionNode,
  InstanceItemNode,
  ModelItemNode,
  NetlistNode,
  PropNode,
  SweepNode,
  TrItemNode,
} from "./ast.js";
import { NetlistError } from "./error.js";
import { parse } from "./parser.js";

registerDeviceClass(...devices);

const constants = new Equations();

export class Netlist {
  static parse(
    content:
      | string
      | {
          readonly content: string;
          readonly location: string | undefined;
        },
    {
      models = [],
    }: {
      readonly models?: readonly Model[];
    } = {},
  ): Netlist {
    if (typeof content === "string") {
      content = { content, location: undefined };
    }
    const document = parse(content.content, {
      grammarSource: content.location,
    });
    const builder = new NetlistBuilder(document);
    builder.addModels(standardModels);
    builder.addModels(models);
    return builder.build();
  }

  constructor(
    readonly circuit: Circuit,
    readonly analyses: readonly Analysis[],
  ) {}
}

type Instance = {
  readonly item: InstanceItemNode;
  readonly deviceClass: DeviceClass;
  readonly nodes: Node[];
  device: Device;
};

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
      this.setInstanceProps(instance);
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
    let deviceClass: DeviceClass;
    try {
      deviceClass = getDeviceClass(item.deviceId.name);
    } catch (err: any) {
      throw new NetlistError(err.message, {
        // cause: err,
        location: item.location,
      });
    }
    const model = new Model(item.modelId.name, deviceClass);
    this.setConstantProps(model.props, item.props);
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
    let deviceClass: DeviceClass;
    try {
      deviceClass = getDeviceClass(item.deviceId.name);
    } catch (err: any) {
      throw new NetlistError(err.message, {
        // cause: err,
        location: item.location,
      });
    }
    if (this.instances.has(item.instanceId.name)) {
      throw new NetlistError(`Duplicate instance identifier [${item.instanceId.name}].`, {
        location: item.location,
      });
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
        `Invalid number of nodes. ` +
          `Expected ${instance.deviceClass.numTerminals}, got ${instance.nodes.length}.`,
        { location: instance.item.location },
      );
    }
    instance.device = new instance.deviceClass(instance.item.instanceId.name);
  }

  setInstanceProps(instance: Instance): void {
    // Set properties from model.

    if (instance.item.modelId != null) {
      const model = this.models.get(instance.item.modelId.name);
      if (model == null) {
        throw new NetlistError(`Model [${instance.item.modelId.name}] not found.`, {
          location: instance.item.location,
        });
      }
      if (model.deviceClass.id !== instance.deviceClass.id) {
        throw new NetlistError(
          `Invalid device of model [${instance.item.modelId.name}]. ` +
            `Expected [${instance.deviceClass.id}], got [${model.deviceClass.id}].`,
          { location: instance.item.location },
        );
      }
      instance.device.props.from(model.props);
    }

    // Set properties from instance properties.

    this.setDeviceProps(instance.device, instance.item.props);
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
    this.setConstantProps(analysis.props, node.props);
    this.addAnalysisSweeps(analysis, node.sweeps);
    this.analyses.push(analysis);
  }

  addTrAnalysis(node: TrItemNode): void {
    const analysis = new TrAnalysis();
    this.setConstantProps(analysis.props, node.props);
    this.addAnalysisSweeps(analysis, node.sweeps);
    this.analyses.push(analysis);
  }

  addAcAnalysis(node: AcItemNode): void {
    const analysis = new AcAnalysis();
    this.setConstantProps(analysis.props, node.props);
    this.addAnalysisSweeps(analysis, node.sweeps);
    this.analyses.push(analysis);
  }

  private addAnalysisSweeps(analysis: Analysis, nodes: readonly SweepNode[]) {
    for (const node of nodes) {
      const sweep = new Sweep(node.id.name);
      this.setConstantProps(sweep.props, node.props);
      analysis.sweeps.push(sweep);
    }
  }

  private setDeviceProps(device: Device, nodes: readonly PropNode[]): void {
    for (const node of nodes) {
      try {
        switch (node.value.type) {
          case "string": {
            device.props.set(node.id.name, node.value.value);
            break;
          }
          case "exp": {
            const exp = toExp(node.value.value);
            if (exp.isConstant()) {
              device.props.set(node.id.name, exp.eval(this.circuit.equations));
            } else {
              this.circuit.bindings.add(new Binding(device, node.id.name, exp));
            }
            break;
          }
        }
      } catch (err: any) {
        throw new NetlistError(err.message, {
          // cause: err,
          location: node.location,
        });
      }
    }
  }

  private setConstantProps(props: Props, nodes: readonly PropNode[]): void {
    for (const node of nodes) {
      try {
        switch (node.value.type) {
          case "string": {
            props.set(node.id.name, node.value.value);
            break;
          }
          case "exp": {
            const exp = toExp(node.value.value);
            props.set(node.id.name, exp.eval(constants));
            break;
          }
        }
      } catch (err: any) {
        throw new NetlistError(err.message, {
          // cause: err,
          location: node.location,
        });
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
