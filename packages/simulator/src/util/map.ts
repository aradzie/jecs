const tombstone: unknown = {};

export class NameMap<T> implements Iterable<[string, T]> {
  private readonly map = new Map<string, T>();
  private readonly lcMap = new Map<string, T>();

  constructor(entries: Iterable<readonly [string, T]> | null = null) {
    if (entries != null) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  get size(): number {
    return this.map.size;
  }

  [Symbol.iterator](): IterableIterator<[string, T]> {
    return this.map[Symbol.iterator]();
  }

  entries(): IterableIterator<[string, T]> {
    return this.map[Symbol.iterator]();
  }

  set(key: string, value: T): void {
    const { map, lcMap } = this;
    if (map.has(key)) {
      throw new TypeError(`Duplicate key [${key}]`);
    }
    map.set(key, value);
    const lcKey = key.toLowerCase();
    const lcVal = lcMap.get(lcKey);
    if (lcVal !== tombstone) {
      if (lcVal != null) {
        lcMap.set(lcKey, tombstone as T);
      } else {
        lcMap.set(lcKey, value);
      }
    }
  }

  has(key: string): boolean {
    const { map, lcMap } = this;
    const val = map.get(key);
    if (val != null) {
      return true;
    } else {
      const lcKey = key.toLowerCase();
      const lcVal = lcMap.get(lcKey);
      return lcVal !== tombstone && lcVal != null;
    }
  }

  get(key: string): T | null {
    const { map, lcMap } = this;
    const val = map.get(key);
    if (val != null) {
      return val;
    } else {
      const lcKey = key.toLowerCase();
      const lcVal = lcMap.get(lcKey);
      return lcVal !== tombstone && lcVal != null ? lcVal : null;
    }
  }
}
