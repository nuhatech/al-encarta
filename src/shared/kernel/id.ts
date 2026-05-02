declare const __brand: unique symbol;

export type Id<Brand extends string> = string & { readonly [__brand]: Brand };

export const idOf = <Brand extends string>(value: string): Id<Brand> => value as Id<Brand>;

export function newId<Brand extends string>(): Id<Brand> {
  // Workers + Node both expose crypto.randomUUID via globalThis.crypto.
  return crypto.randomUUID() as Id<Brand>;
}
