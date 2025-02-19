export const unusable = makeUnusable<any>();

function makeUnusable<T extends object>(): T {
  const t = () => {
    throw new Error("unusable");
  };

  return new Proxy<T>(Object.create(null) as T, {
    apply: t,
    construct: t,
    defineProperty: t,
    deleteProperty: t,
    get: t,
    getOwnPropertyDescriptor: t,
    getPrototypeOf: t,
    has: t,
    isExtensible: t,
    ownKeys: t,
    preventExtensions: t,
    set: t,
    setPrototypeOf: t,
  });
}
