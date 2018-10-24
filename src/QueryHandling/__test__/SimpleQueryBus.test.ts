/* tslint:disable:max-classes-per-file */

import { SimpleQueryBus } from '../SimpleQueryBus';
import { HandleQuery } from '../HandleQuery';
import { QueryHandlerAlreadyRegisteredError } from '../Error/QueryHandlerAlreadyRegisteredError';
import { Query } from '../Query';
import { QueryHandlerNotRegisteredError } from '../Error/QueryHandlerNotRegisteredError';
import { QueryHandler } from '../QueryHandler';

it('Should handle single Query', () => {
  const simpleBus = new SimpleQueryBus();

  const handleQuerySpy = jest.fn();

  class TestQuery implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handle(QueryArg: TestQuery): void {
      handleQuerySpy(QueryArg);
    }
  }

  simpleBus.subscribe(new TestQueryHandler());

  const query = new TestQuery();
  simpleBus.dispatch(query);

  expect(handleQuerySpy).toBeCalledWith(query);
});

it('Should be able to handle multiple Querys', () => {
  const simpleBus = new SimpleQueryBus();

  const handleQuerySpy = jest.fn();

  class TestQueryFoo implements Query {

  }

  class TestQueryBar implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handleFoo(query: TestQueryFoo): void {
      handleQuerySpy(query);
    }

    @HandleQuery
    public handleBar(query: TestQueryBar): void {
      handleQuerySpy(query);
    }
  }

  simpleBus.subscribe(new TestQueryHandler());

  const QueryFoo = new TestQueryFoo();
  simpleBus.dispatch(QueryFoo);

  const QueryBar = new TestQueryBar();
  simpleBus.dispatch(QueryBar);

  expect(handleQuerySpy).toBeCalledWith(QueryFoo);
  expect(handleQuerySpy).toBeCalledWith(QueryBar);
});

it('Should always be a handler for a Query', () => {
  const simpleBus = new SimpleQueryBus();

  class TestQuery implements Query {

  }

  const query = new TestQuery();
  return expect(simpleBus.dispatch(query)).rejects.toBeInstanceOf(QueryHandlerNotRegisteredError);
});

it('Cannot have 2 handlers for same Query', () => {
  const simpleBus = new SimpleQueryBus();

  class TestQuery implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handle(_Query: TestQuery): void {
      // noop
    }
  }

  simpleBus.subscribe(new TestQueryHandler());

  expect(() => {
    simpleBus.subscribe(new TestQueryHandler());
  }).toThrowError(QueryHandlerAlreadyRegisteredError);
});
