import type { DeviceModel } from "./library";
import type { Network, Node, Stamper } from "./network";
import type { Op } from "./ops";
import type { ParamsSchema } from "./params";

// pin
// two-terminal, three-terminal, etc
// one-port
// two-port

export interface DeviceClass {
  /** Unique device identifier. */
  readonly id: string;

  /** The number of terminals in the device. */
  readonly numTerminals: number;

  /** The schema of the device parameters. */
  readonly paramsSchema: ParamsSchema;

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

export abstract class Device<ParamsT = unknown, StateT = unknown> {
  /** Returns a list of built-in generic device models, if any. */
  static getModels(): readonly DeviceModel[] {
    return [];
  }

  /** Unique device identifier. */
  static readonly id: string;

  /** The number of terminals in the device. */
  static readonly numTerminals: number;

  /** The schema of the device parameters. */
  static readonly paramsSchema: ParamsSchema;

  /** Unique device name. */
  readonly name: string;

  /** The list of nodes to which the device terminals are connected. */
  readonly nodes: readonly Node[];

  /** The device parameters. */
  readonly params: ParamsT;

  state: StateT = this.getInitialState();

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
   * Returns a device state object which is shared between iterations.
   */
  getInitialState(): StateT {
    return {} as StateT;
  }

  /**
   * Circuit calls this method to let a device to compute its state
   * from the current node voltages and branch currents.
   * @param state Device state which is saved between iterations.
   */
  eval(state: StateT): void {}

  /**
   * Circuit calls this method to let a device to stamp the MNA matrix
   * with values obtained from the previously computed state.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   * @param state Device state which is saved between iterations.
   */
  stamp(stamper: Stamper, state: StateT): void {}

  /**
   * Returns device operating points obtained from a previously computed state.
   */
  ops(state?: StateT): readonly Op[] {
    return [];
  }
}
