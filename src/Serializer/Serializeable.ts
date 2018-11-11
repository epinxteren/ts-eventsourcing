import 'reflect-metadata';
import { ClassConstructor } from './ClassConstructor';
import { Metadata } from '../Metadata';

const SERIALIZER = Symbol.for('serializer');

export interface SerializeMetadata {
  normalize?: string;
  deNormalize?: string;
}

export function getSerializerMetadata(constructor: ClassConstructor): SerializeMetadata {
  const metadata: SerializeMetadata = Metadata.getMetadata(SERIALIZER, constructor);
  if (metadata) {
    return metadata;
  }
  const parent = Object.getPrototypeOf(constructor.prototype).constructor;
  if (parent === Object) {
    return {};
  }
  return Object.assign({}, getSerializerMetadata(parent));
}

/**
 * Decorator function for object to normalize it.
 */
export function Normalize(target: { constructor: ClassConstructor } | any, functionName: string): void {
  const constructor = target.constructor;
  const metadata: SerializeMetadata = getSerializerMetadata(constructor);
  metadata.normalize = functionName;
  Metadata.defineMetadata(SERIALIZER, metadata, constructor);
}

/**
 * Decorator static function to de-normalize it.
 */
export function DeNormalize(constructor: ClassConstructor, functionName: string): void {
  const metadata: SerializeMetadata = getSerializerMetadata(constructor);
  metadata.deNormalize = functionName;
  Metadata.defineMetadata(SERIALIZER, metadata, constructor);
}
