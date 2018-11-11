import { getSerializerMetadata, SerializeMetadata } from '../Serializeable';
import { ClassConstructor } from '../ClassConstructor';

interface SerializeHandler {
  /**
   * a unique identifier for this type that will be used in the serialised output
   */
  tag: string;
  /**
   * a constructor function that can be used to identify the type via an instanceof check
   */
  class: ClassConstructor;

  /**
   * a function which will receive an instance of your type, and is expected to create some serializable representation of it.
   */
  write(instance: any): any;

  /**
   * a function which will receive the serializable representation, and is expected to create a new instance from it
   */
  read(instance: any): any;
}

export function createClassHandlers(classes: { [key: string]: ClassConstructor }): SerializeHandler[] {

  function getReadFunction(metadata: SerializeMetadata, classConstructor: ClassConstructor) {
    const deNormalize = metadata.deNormalize;
    if (deNormalize) {
      return (data: any) => {
        return (classConstructor as any)[deNormalize](data);
      };
    }
    return (plainProperties: { [key: string]: any }) => {
      const instance = new classConstructor();
      const ownPropertyNames = Object.getOwnPropertyNames(plainProperties);
      ownPropertyNames.forEach(key => {
        instance[key] = plainProperties[key];
      });
      return instance;
    };
  }

  function getWriteFunction(metadata: SerializeMetadata) {
    const normalize = metadata.normalize;
    if (normalize) {
      return (data: any) => {
        return data[normalize](data);
      };
    }
    return (object: { [key: string]: any }) => {
      const ownPropertyNames = Object.getOwnPropertyNames(object);
      const plainProperties: { [key: string]: any } = {};
      ownPropertyNames.forEach(key => {
        plainProperties[key] = object[key];
      });
      return plainProperties;
    };
  }

  return Object.getOwnPropertyNames(classes).map(tag => {

    const classConstructor = classes[tag];
    const metadata = getSerializerMetadata(classConstructor);
    // This is for inheritance, uses tag comparison instead of instanceof.
    // classConstructor.prototype.transitTag = tag;
    return {
      tag,
      class: classConstructor,
      write: getWriteFunction(metadata),
      read: getReadFunction(metadata, classConstructor),
    };
  });
}
