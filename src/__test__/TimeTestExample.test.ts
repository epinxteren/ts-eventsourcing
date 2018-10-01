/* tslint:disable:max-classes-per-file */

import { UuidIdentity } from '../ValueObject/UuidIdentity';
import { EventSourcingTestBench } from '../Testing';
import { HandleDomainEvent } from '../EventHandling/HandleDomainEvent';
import { DomainMessage } from '../Domain/DomainMessage';
import { Projector } from '../ReadModel/Projector';
import { Repository } from '../ReadModel/Repository';
import { DomainEvent } from '../Domain/DomainEvent';
import { ReadModel } from '../ReadModel/ReadModel';

class UserId extends UuidIdentity {

}

class UserRegistered implements DomainEvent {

}

class UserHasLoggedIn implements DomainEvent {

}

class UserHasLoggedOut implements DomainEvent {

}

class UserLogInStatistics implements ReadModel {

  private ms: number = 0;
  private samples: number = 0;
  private lastLoggedInTime: Date | null = null;

  constructor(private id: UserId) {

  }

  public getId(): UserId {
    return this.id;
  }

  public userLoggedIn(date: Date) {
    this.lastLoggedInTime = date;
  }

  public userLoggedOut(date: Date) {
    const lastLoggedInTime = this.lastLoggedInTime;
    if (!lastLoggedInTime) {
      throw new Error('User was never logged in');
    }
    const ms = date.getTime() - lastLoggedInTime.getTime();
    this.samples += 1;
    this.ms += ms;
  }

  public getAverageInMinutes(): number {
    if (this.ms === 0) {
      return 0;
    }
    return (this.ms / this.samples) / (1000 * 60);
  }
}

class UserLoggedInDurationProjector implements Projector {

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
    model.userLoggedIn(message.recordedOn);
    await this.repository.save(model);
  }

  @HandleDomainEvent
  public async userLoggedOut(_event: UserHasLoggedOut, message: DomainMessage) {
    const model = await this.repository.get(message.aggregateId);
    model.userLoggedOut(message.recordedOn);
    await this.repository.save(model);
  }

}

it('Can test with time changes', async () => {
  const id = UserId.create();
  await EventSourcingTestBench
    .create('1986-02-10T00:00:00Z')
    .givenEventListener((testBench) => {
      return new UserLoggedInDurationProjector(testBench.getReadModelRepository(UserLogInStatistics));
    })
    .whenEventsHappened(id, [
      new UserRegistered(),
      new UserHasLoggedIn(),
    ])
    .whenTimeChanges('1986-02-10T17:00:00Z')
    .whenEventsHappened(id, [
      new UserHasLoggedOut(),
    ])
    .thenAssertModel(UserLogInStatistics, id, async (model, _testBench: EventSourcingTestBench) => {
      expect(model.getAverageInMinutes()).toEqual(1020);
    });
});
