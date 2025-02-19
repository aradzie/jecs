import { type EditAction } from "./edit.ts";
import { type Element } from "./element.ts";
import { filterInstances, filterNotes, filterWires } from "./filter.ts";
import { type Instance } from "./instance.ts";
import { Names } from "./names.ts";
import { connect, dummyNetwork, type Network } from "./network.ts";
import { type Note } from "./note.ts";
import { type Selection } from "./selection.ts";
import { UniqueMap } from "./unique.ts";
import { unusable } from "./unusable.ts";
import { rewire, type Wire } from "./wire.ts";

export class Schematic implements Iterable<Element> {
  static create(elements: Iterable<Element>): Schematic {
    const schematic = new Schematic();
    schematic.#state = new State(elements);
    return schematic;
  }

  #state: State = unusable;
  #instances: Instance[] | null = null;
  #notes: Note[] | null = null;
  #wires: Wire[] | null = null;

  constructor() {}

  [Symbol.iterator](): IterableIterator<Element> {
    return this.#state[Symbol.iterator]();
  }

  get instances(): readonly Instance[] {
    return (this.#instances ??= filterInstances(this.#state));
  }

  get notes(): readonly Note[] {
    return (this.#notes ??= filterNotes(this.#state));
  }

  get wires(): readonly Wire[] {
    return (this.#wires ??= filterWires(this.#state));
  }

  get network(): Network {
    return this.#state.network;
  }

  get names(): Names {
    return this.#state.names;
  }

  append(elements: Iterable<Element>): Schematic {
    this.#state.append(elements);
    return this.#transfer();
  }

  delete(selection: Selection): Schematic {
    this.#state.delete(selection);
    return this.#transfer();
  }

  unwire(): Schematic {
    this.#state.unwire();
    return this.#transfer();
  }

  rewire(): Schematic {
    this.#state.rewire();
    return this.#transfer();
  }

  rename(order: "none" | "horizontal" | "vertical" = "none"): Schematic {
    this.#state.names.rename(order);
    return this.#transfer();
  }

  edit(action: EditAction): Schematic {
    switch (action.type) {
      case "set-note-text": {
        const { note, text } = action;
        if (note.text !== text) {
          note.text = text;
        }
        break;
      }
      case "set-note-align": {
        const { note, align } = action;
        if (note.align !== align) {
          note.align = align;
        }
        break;
      }
      case "set-note-dir": {
        const { note, dir } = action;
        if (note.dir !== dir) {
          note.dir = dir;
        }
        break;
      }
      case "set-instance-prop": {
        const { instance, name, value } = action;
        instance.props = instance.props.setValue(name, value);
        break;
      }
    }
    this.#state.rewire();
    return this.#transfer();
  }

  #transfer() {
    const that = new Schematic();
    that.#state = this.#state;
    this.#state = unusable;
    this.#instances = null;
    this.#notes = null;
    this.#wires = null;
    return that;
  }
}

type Wiring = {
  rewire(elements: Element[]): void;
  connect(elements: Iterable<Element>): Network;
};

const dummyWiring: Wiring = {
  rewire: (elements) => {},
  connect: (elements) => dummyNetwork(),
};

const liveWiring: Wiring = {
  rewire,
  connect,
};

class State implements Iterable<Element> {
  #elements: Element[];
  #wiring: Wiring;
  #network: Network | null;
  #names: Names | null;

  constructor(elements: Iterable<Element>) {
    this.#elements = [];
    this.#wiring = liveWiring;
    this.#network = null;
    this.#names = null;
    this.append(elements);
  }

  [Symbol.iterator](): IterableIterator<Element> {
    return this.#elements[Symbol.iterator]();
  }

  get network(): Network {
    return (this.#network ??= this.#wiring.connect(this.#elements));
  }

  get names(): Names {
    return (this.#names ??= new Names(this.#elements));
  }

  append(elements: Iterable<Element>): void {
    this.#elements = [...new UniqueMap<Element>().append(this.#elements).append(elements)];
    this.#wiring.rewire(this.#elements);
    this.#network = null;
    this.names.rename();
  }

  delete(selection: Selection): void {
    this.#elements = [...new UniqueMap<Element>().append(this.#elements).delete(selection)];
    this.#wiring.rewire(this.#elements);
    this.#network = null;
    this.names.rename();
  }

  unwire(): void {
    this.#wiring = dummyWiring;
    this.#network = null;
  }

  rewire(): void {
    this.#wiring = liveWiring;
    this.#network = null;
  }
}
