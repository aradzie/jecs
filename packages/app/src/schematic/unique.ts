export type Id = number;

let id = 0;

export function nextId(): Id {
  return (id += 1);
}

export class Unique {
  readonly #id = nextId();

  get id(): Id {
    return this.#id;
  }
}

export class UniqueMap<T extends Unique> implements Iterable<T> {
  readonly #map = new Map<Id, T>();

  [Symbol.iterator](): IterableIterator<T> {
    return this.#map.values();
  }

  append(items: Iterable<T>): this {
    for (const item of items) {
      this.#map.set(item.id, item);
    }
    return this;
  }

  delete(ids: Iterable<Id>): this {
    for (const id of ids) {
      this.#map.delete(id);
    }
    return this;
  }
}
