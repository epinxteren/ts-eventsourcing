
export type Command = object;

export type CommandConstructor = new (...args: any[]) => Command;
