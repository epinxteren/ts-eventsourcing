
export interface SerializerInterface {

  serialize(data: unknown): string;

  deserialize(json: string): unknown;
}
