import type { DeviceModel } from "./library";
import type { Network, Node, Stamper } from "./network";
import type { Op } from "./ops";
import type { ParamsSchema } from "./params";

export interface DeviceClass {
  /** Unique device identifier. */
  readonly id: string;

  /** The number of terminals in the device. */
  readonly numTerminals: number;

  /** Schema of the device parameters. */
  readonly paramsSchema: ParamsSchema;

  /** Schema of the device state vector. */
  readonly stateParams: StateParams;

  /**
   * Device constructor.
   * @param name Device name which is unique within a circuit.
   * @param nodes Circuit nodes to which the device terminals are connected.
   * @param params Device parameters.
   */
  new (name: string, nodes: readonly Node[], params: any): Device;

  /** Returns a list of device models. */
  getModels(): readonly DeviceModel[];
}

/**
 * Device states are kept in typed arrays.
 */
export type DeviceState = Float64Array;

export interface OutputParameter {
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
  readonly outputs: readonly OutputParameter[];
}

const emptyState = new Float64Array();

export abstract class Device<ParamsT = unknown> {
  /** Returns a list of built-in generic device models, if any. */
  static getModels(): readonly DeviceModel[] {
    return [];
  }

  /** Unique device identifier. */
  static readonly id: string;

  /** The number of terminals in the device. */
  static readonly numTerminals: number;

  /** Schema of the device parameters. */
  static readonly paramsSchema: ParamsSchema;

  /** Schema of the device state vector. */
  static readonly stateParams: StateParams;

  /** Unique device name. */
  readonly name: string;

  /** The list of nodes to which the device terminals are connected. */
  readonly nodes: readonly Node[];

  /** The device parameters. */
  readonly params: ParamsT;

  // TODO Externalize this state.
  state: DeviceState = emptyState;

  constructor(name: string, nodes: readonly Node[], params: ParamsT) {
    this.name = name;
    this.nodes = nodes;
    this.params = params;
  }

  /**
   * Circuit calls this method to let a device to allocate extra nodes and
   * branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  /**
   * Circuit calls this method to let a device to compute its state
   * from the current node voltages and branch currents.
   * @param state Device state which is saved between iterations.
   * @param final Whether this is a final evaluation step, which is performed after last iteration.
   *              At the final evaluation step devices should compute output parameters.
   *              Non-linear devices should disable damping.
   */
  eval(state: DeviceState, final: boolean): void {}

  /**
   * Circuit calls this method to let a device to stamp the MNA matrix
   * with values obtained from the previously computed state.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   * @param state Device state which is saved between iterations.
   */
  stamp(stamper: Stamper, state: DeviceState): void {}

  /**
   * Returns device operating points obtained from a previously computed state.
   */
  ops(state?: DeviceState): readonly Op[] {
    return [];
  }
}
