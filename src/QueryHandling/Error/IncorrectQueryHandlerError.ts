import { ClassUtil } from '../../ClassUtil';
import { QueryHandler, QueryHandlerConstructor } from '../QueryHandler';

export class IncorrectQueryHandlerError extends Error {

  public static missingArgument(queryHandler: QueryHandlerConstructor, functionName: string) {
    const QueryHandlerName = ClassUtil.nameOffInstance(queryHandler);
    return new this(`Missing Query argument on ${QueryHandlerName}.${functionName}`);
  }

  public static missingHandler(queryHandler: QueryHandler) {
    const QueryHandlerName = ClassUtil.nameOffInstance(queryHandler);
    return new this(`Missing a Query handler on ${QueryHandlerName}. Don't forget @HandleQuery annotation`);
  }

  public static missingQuery(queryHandler: QueryHandler, functionName: string) {
    const QueryHandlerName = ClassUtil.nameOffInstance(queryHandler);
    return new this(`Missing a Query in @HandleQuery(<here>) arguments ${QueryHandlerName}.${functionName}`);
  }

}
