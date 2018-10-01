import { ScalarIdentity } from '../../ValueObject/ScalarIdentity';
import { DomainMessage } from '../DomainMessage';

it('Can print a domain message', () => {
  class DomainEvent {

  }

  const identity = new ScalarIdentity('34982348');
  const domainMessage = new DomainMessage(identity, 1, new DomainEvent(), new Date());

  expect(domainMessage.toString()).toBe('34982348:1:DomainEvent');
});
