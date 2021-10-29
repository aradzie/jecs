import type { Network, Node, Stamper } from "./network";
import type { Op } from "./ops";
import type { ParamsSchema } from "./params";

// pin
// two-terminal, three-terminal, etc
// one-port
// two-port

export interface DeviceClass {
  readonly id: string;
  readonly numTerminals: number;
  readonly paramsSchema: ParamsSchema;
  new (name: string, nodes: readonly Node[], params: any): Device;
}

export abstract class Device<ParamsT = unknown, StateT = unknown> {
  static readonly id: string;
  static readonly numTerminals: number;
  static readonly paramsSchema: ParamsSchema;

  readonly name: string;
  readonly nodes: Node[];
  readonly params: ParamsT;

  state: StateT = this.getInitialState();

  constructor(name: string, nodes: readonly Node[], params: ParamsT) {
    this.name = name;
    this.nodes = [...nodes];
    this.params = { ...params };
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
