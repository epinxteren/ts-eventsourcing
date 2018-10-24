import { QueryHandler } from './QueryHandler';
import { QueryBus } from './QueryBus';
import { getHandleQueryMetadata } from './HandleQuery';
import { ClassUtil } from '../ClassUtil';
import { Query } from './Query';
import { QueryHandlerNotRegisteredError } from './Error/QueryHandlerNotRegisteredError';
import { QueryHandlerAlreadyRegisteredError } from './Error/QueryHandlerAlreadyRegisteredError';

/**
 * Only support only one handler for each Query.
 */
export class SimpleQueryBus implements QueryBus {

  /**
   * Map of Query names with handler.
   */
  private handlers: { [QueryName: string]: (Query: Query) => void } = {};

  /**
   * Dispatches the Query Query to the proper QueryHandler.
   */
  public async dispatch(query: Query): Promise<any> {
    const QueryName = ClassUtil.nameOffInstance(query);
    const handler = this.handlers[QueryName];
    if (!handler) {
      return Promise.reject(QueryHandlerNotRegisteredError.missingHandler(query));
    }
    return await handler(query);
  }

  /**
   * Subscribes the Query handler to this QueryBus.
   */
  public subscribe(handler: QueryHandler): void {
    const handlers = getHandleQueryMetadata(handler);
    for (const metadata of handlers) {
      const QueryName = ClassUtil.nameOffConstructor(metadata.Query);
      if (this.handlers[QueryName]) {
        throw QueryHandlerAlreadyRegisteredError.alreadyRegistered(handler, metadata.functionName, metadata.Query);
      }
      this.handlers[QueryName] = (handler as any)[metadata.functionName].bind(handler);
    }
  }
}
