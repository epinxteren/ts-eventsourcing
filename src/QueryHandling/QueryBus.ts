import { Query } from './Query';
import { QueryHandler } from './QueryHandler';

export interface QueryBus {
  /**
   * Dispatches the Query Query to the proper QueryHandler.
   */
  dispatch(Query: Query): Promise<any>;

  /**
   * Subscribes the Query handler to this QueryBus.
   */
  subscribe(handler: QueryHandler): void;
}
