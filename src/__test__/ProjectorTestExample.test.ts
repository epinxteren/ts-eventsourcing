/* tslint:disable:max-classes-per-file */
import { UuidIdentity } from '../ValueObject/UuidIdentity';
import { EventSourcingTestBench } from '../Testing';
import { DomainEvent } from '../Domain/DomainEvent';
import { ReadModel } from '../ReadModel/ReadModel';
import { Projector } from '../ReadModel/Projector';
import { Repository } from '../ReadModel/Repository';
import { HandleDomainEvent } from '../EventHandling/HandleDomainEvent';
import { DomainMessage } from '../Domain/DomainMessage';

class UserId extends UuidIdentity {

}

class UserRegistered implements DomainEvent {

}

class UserHasLoggedIn implements DomainEvent {

}

class UserLogInStatistics implements ReadModel {

  private count: number = 0;

  constructor(private id: UserId) {

  }

  public getId(): UserId {
    return this.id;
  }

  public increaseCount() {
    this.count += 1;
  }

  public getCount(): number {
    return this.count;
  }
}

class UserLoggedInCountProjector implements Projector {

  constructor(private repository: Repository<UserLogInStatistics>) {

  }

  @HandleDomainEvent
  public async userRegistered(_event: UserRegistered, message: DomainMessage<UserRegistered, UserId>) {
    const model = new UserLogInStatistics(message.aggregateId);
    await this.repository.save(model);
  }

  @HandleDomainEvent
  public async userLoggedIn(_event: UserHasLoggedIn, message: DomainMessage) {
    const model = await this.repository.get(message.aggregateId);
    model.increaseCount();
    await this.repository.save(model);
  }

}

it('Can test a projector with matching model', async () => {
  const id = UserId.create();
  const expectedModel = new UserLogInStatistics(id);
  expectedModel.increaseCount();

  await EventSourcingTestBench
    .create()
    .givenEventListener((testBench) => {
      return new UserLoggedInCountProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .whenEventsHappened(id, [
      new UserRegistered(),
      new UserHasLoggedIn(),
    ])
    .thenModelsShouldMatch([
      expectedModel,
    ]);
});

it('Can test a projector manually', async () => {
  const id = UserId.create();
  await EventSourcingTestBench
    .create()
    .givenEventListener((testBench) => {
      return new UserLoggedInCountProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .whenEventsHappened(id, [
      new UserRegistered(),
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
    ])

    // Fetch the model yourself
    .thenAssert(async (testBench: EventSourcingTestBench) => {
      const repository = testBench.getReadModelRepository(UserLogInStatistics);
      const model = await repository.get(id);
      expect(model.getCount()).toEqual(3);
    });
});

it('Can test a projector manually for a single model', async () => {
  const id = UserId.create();
  await EventSourcingTestBench
    .create()
    .givenEventListener((testBench) => {
      return new UserLoggedInCountProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .whenEventsHappened(id, [
      new UserRegistered(),
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
    ])
    .thenAssertModel(UserLogInStatistics, id, async (model, _testBench: EventSourcingTestBench) => {
      expect(model.getCount()).toEqual(3);
    });
});

it('Can test a projector with spies', async () => {
  const id = UserId.create();
  let spy: jest.SpyInstance | undefined;
  await EventSourcingTestBench
    .create()
    .givenEventListener((testBench) => {
      return new UserLoggedInCountProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .whenEventsHappened(id, [
      new UserRegistered(),
    ])
    .givenSpies(async (testBench: EventSourcingTestBench) => {
      const repository = testBench.getReadModelRepository(UserLogInStatistics);
      const model = await repository.get(id);
      spy = jest.spyOn(model, 'increaseCount');
    })
    .whenEventsHappened(id, [
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
    ])
    .thenAssert(async () => {
      expect(spy).toHaveBeenCalledTimes(3);
    });
});

it('Can test a projector with snapshot', async () => {
  const id = new UserId('270df21f-1cdb-4518-bc07-432464799df6');
  await EventSourcingTestBench
    .create()
    .givenEventListener((testBench) => {
      return new UserLoggedInCountProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .whenEventsHappened(id, [
      new UserRegistered(),
    ])
    .whenEventsHappened(id, [
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
      new UserHasLoggedIn(),
    ])
    .thenIPutABeakpoint()
    .thenModelsShouldMatchSnapshot()
    .thenShouldMatchSnapshot();
});

it('Can catch a projectors error', async () => {
  const id = new UserId('270df21f-1cdb-4518-bc07-432464799df6');
  await EventSourcingTestBench
    .create()
    .givenEventListener((testBench) => {
      return new UserLoggedInCountProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .throws(`Model with id ${id.toString()} not found`)
    .whenEventsHappened(id, [
      new UserHasLoggedIn(),
    ]);
});
