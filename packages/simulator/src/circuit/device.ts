import type { Op } from "./ops";
import type { Network, Node, Stamper } from "./network";
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

  constructor(name: string, nodes: readonly Node[], params: ParamsT) {
    this.name = name;
    this.nodes = [...nodes];
    this.params = { ...params };
  }

  /**
   * Circuit calls this method to let a device
   * to allocate extra nodes and branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  /**
   * Returns a device state object which is shared between iterations.
   * This allows running multiple analyses on the same circuit.
   */
  getInitialState(): StateT {
    return {} as StateT;
  }

  /**
   * Circuit calls this method to let a device
   * to stamp MNA matrix and RHS vector.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   * @param state Device state which is saved between iterations.
   */
  stamp(stamper: Stamper, state: StateT): void {}

  /**
   * Returns device operating points.
   */
  ops(): readonly Op[] {
    return [];
  }
}
