export type Command = object;

export type CommandConstructor<T = Command> = new (...args: any[]) => T;
