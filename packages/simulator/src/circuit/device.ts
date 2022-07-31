import type { AcStamper, Stamper } from "./mna.js";
import type { Network, Node } from "./network.js";
import { Properties, PropertiesSchema } from "./properties.js";

export interface DeviceClass {
  /** Unique device class identifier. */
  readonly id: string;
  /** The number of terminals in the device. */
  readonly numTerminals: number;
  /** Schema of the device parameters. */
  readonly propertiesSchema: PropertiesSchema;
  /** Schema of the device state vector. */
  readonly stateSchema: StateSchema;
  /** Whether this device is linear. */
  readonly linear: boolean;
  /**
   * Device constructor.
   * @param id Unique device instance identifier.
   */
  new (id: string): Device;
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

export interface StateSchema {
  /** Length of the state vector. */
  readonly length: number;
  /** Output parameters from the state vector. */
  readonly ops: readonly OutputParam[];
}

export type DcParams = {
  /** The default temperature of devices. */
  readonly temp: number;
  /** Voltage or current source value multiplier for the convergence helper. */
  readonly sourceFactor: number;
};

export type TrParams = {
  /** Elapsed simulation time. */
  readonly elapsedTime: number;
  /** Time step from the last simulation. */
  readonly timeStep: number;
  /** The default temperature of devices. */
  readonly temp: number;
  /** Voltage or current source value multiplier for the convergence helper. */
  readonly sourceFactor: number;
};

export abstract class Device {
  static readonly dummy = new (class Dummy extends Device {
    static override readonly id = "DUMMY";
    static override readonly numTerminals = 0;
    static override readonly propertiesSchema = {};
    static override readonly stateSchema = {
      length: 0,
      ops: [],
    };

    constructor() {
      super("DUMMY");
    }
  })();

  /** Unique device class identifier. */
  static readonly id: string;

  /** The number of terminals in the device. */
  static readonly numTerminals: number;

  /** Schema of the device parameters. */
  static readonly propertiesSchema: PropertiesSchema;

  /** Schema of the device state vector. */
  static readonly stateSchema: StateSchema;

  /** Whether this device is linear. Most devices are linear. */
  static readonly linear: boolean = true;

  /** Unique device instance identifier. */
  readonly id: string;

  /** Device properties. */
  readonly properties: Properties;

  /** Vector with device state variables. */
  state: DeviceState;

  constructor(id: string) {
    this.id = id;
    const { propertiesSchema, stateSchema } = this.deviceClass;
    this.properties = new Properties(propertiesSchema);
    this.state = new Float64Array(stateSchema.length);
  }

  get deviceClass(): DeviceClass {
    return this.constructor as DeviceClass;
  }

  /**
   * Circuit calls this method to let a device allocate extra nodes and
   * branches.
   * @param network A network which contains allocated nodes and branches.
   * @param nodes Circuit nodes to which the device terminals are connected.
   */
  connect(network: Network, nodes: readonly Node[]): void {}

  init(state: DeviceState): void {}

  initDc(state: DeviceState, params: DcParams): void {}

  loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {}

  endDc(state: DeviceState, params: DcParams): void {}

  initTr(state: DeviceState, params: TrParams): void {}

  loadTr(state: DeviceState, params: TrParams, stamper: Stamper): void {}

  endTr(state: DeviceState, params: TrParams): void {}

  initAc(state: DeviceState): void {}

  loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {}
}
