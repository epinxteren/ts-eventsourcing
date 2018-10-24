/**
 * Specify the handler by @handleQuery
 */
export interface QueryHandler {

}

export type QueryHandlerConstructor<Handler = QueryHandler> = new (...args: any[]) => Handler;
