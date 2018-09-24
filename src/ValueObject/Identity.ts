
export interface Identity {

  toString(): string;

  equals(id: Identity): boolean;

}

export type IdentityConstructor<Id extends Identity> = new (...args: any[]) => Id;
