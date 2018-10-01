import { Repository } from '../../ReadModel/Repository';
import { InMemoryRepository } from '../../ReadModel/InMemoryRepository';
import { ReadModel } from '../../ReadModel/ReadModel';

export class ReadModelTestContext<T extends ReadModel> {
  private repository: Repository<T> = new InMemoryRepository();

  public getRepository(): Repository<T> {
    return this.repository;
  }

  public setRepository(repository: Repository<T>) {
    this.repository = repository;
  }

}
