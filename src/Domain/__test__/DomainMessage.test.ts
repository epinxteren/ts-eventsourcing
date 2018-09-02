import { DomainMessage } from '..';
import { Identity } from '../../Identity';

it('Can print a domain message', () => {
  class DomainEvent {

  }

  const identity = new Identity('34982348');
  const domainMessage = new DomainMessage(identity, 1, new DomainEvent(), new Date());

  expect(domainMessage.toString()).toBe('34982348:1:DomainEvent');
});
