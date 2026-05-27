export type DeepImmutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
    : T extends Set<infer U>
      ? ReadonlySet<DeepImmutable<U>>
      : T extends Array<infer U>
        ? ReadonlyArray<DeepImmutable<U>>
        : T extends object
          ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
          : T

type PermutationHelper<T extends string, U extends string = T> = [T] extends [never]
  ? never
  : T extends U
    ? T | `${T},${PermutationHelper<Exclude<U, T>>}`
    : never

export type Permutations<T extends string> = PermutationHelper<T>
