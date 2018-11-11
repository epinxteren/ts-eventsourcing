export interface ClassConstructor<T = any> {
  new(...args: any[]): T;
}
