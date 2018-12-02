
/**
 * TODO: solve issue why 'reflect-metadata' does not work outside of this project for custom metadata.
 */
export class Metadata {

  public static defineMetadata(key: symbol | string, metadata: any, target: any)  {
    const classMetadata = this.getByTarget(target);
    return classMetadata[key.toString()] = metadata;
  }

  public static getMetadata(key: symbol | string, target: any)  {
    const classMetadata = this.getByTarget(target);
    return classMetadata[key.toString()];
  }

  private static index: any[] = [];
  private static metadata: any[] = [];

  private static getByTarget(target: any): any {
    const index = this.index.indexOf(target);
    if (index >= 0) {
      return this.metadata[index];
    }
    const newIndex = this.index.length;
    this.metadata[newIndex] = {};
    this.index.push(target);
    return this.metadata[newIndex];
  }
}
