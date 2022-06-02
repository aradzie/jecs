import type { DeviceModel } from "./library.js";
import type { Network, Node, Stamper } from "./network.js";
import type { ParamsSchema } from "./params.js";

export interface DeviceClass {
  /** Unique device class identifier. */
  readonly id: string;

  /** The number of terminals in the device. */
  readonly numTerminals: number;

  /** Schema of the device parameters. */
  readonly paramsSchema: ParamsSchema;

  /** Schema of the device state vector. */
  readonly stateParams: StateParams;

  /**
   * Device constructor.
   * @param id Unique device instance identifier.
   * @param nodes Circuit nodes to which the device terminals are connected.
   * @param params Device parameters.
   */
  new (id: string, nodes: readonly Node[], params: any): Device;

  /** Returns a list of device models. */
  getModels(): readonly DeviceModel[];
}

/**
 * Device states are kept in typed arrays.
 */
export type DeviceState = Float64Array;

export interface OutputParam {
  /** Element index. */
  readonly index: number;
  /** Output parameter name. */
  readonly name: string;
  /** Output parameter unit. */
  readonly unit: string;
}

export interface StateParams {
  /** Length of the state vector. */
  readonly length: number;
  /** Output parameters from the state vector. */
  readonly ops: readonly OutputParam[];
}

export type EvalOptions = {
  /**
   * Elapsed simulation time.
   */
  readonly elapsedTime: number;
  /**
   * Time step from the last simulation.
   */
  readonly timeStep: number;
  /**
   * A very small conductance added across nonlinear devices
   * to prevent nodes from floating if a device is turned completely off.
   */
  readonly gmin: number;
};

export abstract class Device<ParamsT = unknown> {
  /** Returns a list of built-in generic device models, if any. */
  static getModels(): readonly DeviceModel[] {
    return [];
  }

  /** Unique device class identifier. */
  static readonly id: string;

  /** The number of terminals in the device. */
  static readonly numTerminals: number;

  /** Schema of the device parameters. */
  static readonly paramsSchema: ParamsSchema;

  /** Schema of the device state vector. */
  static readonly stateParams: StateParams;

  /** Unique device instance identifier. */
  readonly id: string;

  /** The list of nodes to which the device terminals are connected. */
  readonly nodes: readonly Node[];

  /** Vector with device state variables. */
  state: DeviceState;

  /** Device parameters. */
  params: ParamsT | null = null;

  constructor(id: string, nodes: readonly Node[], params: ParamsT | null = null) {
    this.id = id;
    this.nodes = nodes;
    const { stateParams } = this.getDeviceClass();
    this.state = new Float64Array(stateParams.length);
    if (params != null) {
      this.setParams(params);
    }
  }

  getDeviceClass(): DeviceClass {
    return this.constructor as DeviceClass;
  }

  setParams(params: ParamsT): void {
    this.deriveState(this.state, (this.params = params));
  }

  /**
   * Derive state from params.
   */
  deriveState(state: DeviceState, params: ParamsT): void {}

  /**
   * Circuit calls this method to let a device to allocate extra nodes and
   * branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  beginEval(state: DeviceState, options: EvalOptions): void {}

  /**
   * Circuit calls this method to let a device  compute its state
   * from the current node voltages and branch currents.
   * @param state Device state which is saved between iterations.
   * @param options Evaluation options.
   */
  eval(state: DeviceState, options: EvalOptions): void {}

  /**
   * Circuit calls this method to let a device stamp the MNA matrix
   * with values obtained from the previously computed state.
   * @param state Device state which is saved between iterations.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   */
  stamp(state: DeviceState, stamper: Stamper): void {}

  endEval(state: DeviceState, options: EvalOptions): void {}

  /**
   * Returns value of an output parameter with the given name.
   */
  op(name: string): number {
    const { stateParams } = this.getDeviceClass();
    for (const op of stateParams.ops) {
      if (name === op.name) {
        return this.state[op.index];
      }
    }
    throw new TypeError(`Unknown output param [${name}]`);
  }
}
