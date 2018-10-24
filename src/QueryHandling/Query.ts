export type Query = object;

export type QueryConstructor<T = Query> = new (...args: any[]) => T;
