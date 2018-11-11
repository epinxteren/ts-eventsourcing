import { SelectQueryBuilder } from 'typeorm';
import { Observable, Observer } from 'rxjs';

function pageQuery<Entity>(query: SelectQueryBuilder<Entity>, page: number, itemPerPage: number): Promise<Entity[]> {
  return query
    .skip(page * itemPerPage)
    .limit(itemPerPage)
    .execute();
}

/**
 * Query entities paginated.
 *
 * Keep in mind the order is important, otherwise an entity can be skipped.
 * if an entity is added, it should normal at the and of the query result.
 */
export function fromQuery<Entity>(query: SelectQueryBuilder<Entity>, entitiesPerPage = 500): Observable<Entity> {
  return new Observable((observer: Observer<Entity>) => {
    const paginateToStream = async () => {
      let result: Entity[] = [];
      let page = 0;
      do {
        result = await pageQuery(query, page, entitiesPerPage);
        for (const entity of result) {
          if (observer.closed) {
            return;
          }
          observer.next(entity);
        }
        page += 1;
      } while (result.length === entitiesPerPage && !observer.closed);
      observer.complete();
    };
    paginateToStream().then(
      () => observer.complete(),
      (error) => observer.error(error),
    );
  });
}
