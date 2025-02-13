import { EditAction } from "./edit.ts";
import { Element } from "./element.ts";
import { filterInstances, filterNotes, filterWires } from "./filter.ts";
import { Instance } from "./instance.ts";
import { Names } from "./names.ts";
import { connect, dummyNetwork, Network } from "./network.ts";
import { Note } from "./note.ts";
import { setProp } from "./props.ts";
import { ReadonlySelection } from "./selection.ts";
import { rewire, Wire } from "./wire.ts";

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

export class Schematic implements Iterable<Element> {
  #elements: Element[];
  #wiring: Wiring;
  #instances: readonly Instance[] | null;
  #notes: readonly Note[] | null;
  #wires: readonly Wire[] | null;
  #network: Network | null;
  #names: Names | null;

  constructor(elements: Iterable<Element>, wiring: Wiring = liveWiring) {
    this.#elements = [...elements];
    this.#wiring = wiring;
    this.#instances = null;
    this.#notes = null;
    this.#wires = null;
    this.#network = null;
    this.#names = null;
    this.#wiring.rewire(this.#elements);
    if (elements instanceof Schematic) {
      elements.#dispose();
    }
  }

  [Symbol.iterator](): IterableIterator<Element> {
    return this.#elements[Symbol.iterator]();
  }

  get instances(): readonly Instance[] {
    return (this.#instances ??= filterInstances(this.#elements));
  }

  get notes(): readonly Note[] {
    return (this.#notes ??= filterNotes(this.#elements));
  }

  get wires(): readonly Wire[] {
    return (this.#wires ??= filterWires(this.#elements));
  }

  get network(): Network {
    return (this.#network ??= this.#wiring.connect(this.#elements));
  }

  get names(): Names {
    return (this.#names ??= new Names(this.#elements));
  }

  append(elements: Iterable<Element>): Schematic {
    return new Schematic([...this.#elements, ...elements], this.#wiring);
  }

  delete(selection: ReadonlySelection): Schematic {
    return new Schematic(
      this.#elements.filter((elem) => !selection.has(elem)),
      this.#wiring,
    );
  }

  unwire(): Schematic {
    return new Schematic(this.#elements, dummyWiring);
  }

  rewire(): Schematic {
    return new Schematic(this.#elements, liveWiring);
  }

  rename(order: "none" | "horizontal" | "vertical" = "none"): Schematic {
    const schematic = new Schematic(this.#elements, this.#wiring);
    schematic.names.rename(order);
    return schematic;
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
        if (instance.props[name] !== value) {
          instance.props = setProp(instance.props, name, value);
        }
        break;
      }
    }
    return new Schematic(this, this.#wiring);
  }

  #dispose() {
    this.#elements = [];
    this.#wiring = dummyWiring;
    this.#instances = null;
    this.#notes = null;
    this.#wires = null;
    this.#network = null;
    this.#names = null;
  }
}
