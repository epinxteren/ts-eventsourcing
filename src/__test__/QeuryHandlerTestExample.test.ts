/* tslint:disable:max-classes-per-file */

import { EventSourcingTestBench } from '../Testing';
import { QueryHandler } from '../QueryHandling/QueryHandler';
import { HandleQuery } from '../QueryHandling/HandleQuery';
import { Query } from '../QueryHandling/Query';

it('Should able to execute query handler', async () => {
  class QueryForWelcome implements Query {
    constructor(public readonly name: string) {

    }
  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handleQuery(query: QueryForWelcome) {
      return `Welcome ${query.name}`;
    }

  }

  await EventSourcingTestBench
    .create()
    .givenQueryHandler(new TestQueryHandler())
    .thenQueryHandlerShouldMatchResult(new QueryForWelcome('John'), 'Welcome John');
});
