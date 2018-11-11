/// <reference path="./transit-immutable-js.d.ts" />

import * as transit from 'transit-immutable-js';
import { Record } from 'immutable';
import { SerializerInterface } from '../SerializerInterface';

export interface RecordConstructor {
  new(...args: any[]): Record<any>;
}

export class TransitJSSerializer implements SerializerInterface {

  private readonly recordTransit: any;

  constructor(records: RecordConstructor[], extraHandlers: any[] = []) {
    /**
     * Simple map to verify you cannot give a record with the same name.
     */
    const recordsTypes: { [key: string]: RecordConstructor } = {};
    records.forEach(record => {
      const descriptiveName = Record.getDescriptiveName(new record());
      if (descriptiveName === '' || descriptiveName.toLowerCase() === 'record') {
        throw new Error(`wrong descriptiveName record name ${descriptiveName}`);
      }
      if (typeof recordsTypes[descriptiveName] !== 'undefined') {
        throw new Error(`Records with this name already given ${descriptiveName}`);
      }
      recordsTypes[descriptiveName] = record;
    });
    const withRecords = transit.withRecords(records);
    this.recordTransit = withRecords.withExtraHandlers(extraHandlers);
  }

  public serialize(data: unknown): string {
    return this.recordTransit.toJSON(data);
  }

  public deserialize(json: string): unknown {
    return this.recordTransit.fromJSON(json);
  }

}
