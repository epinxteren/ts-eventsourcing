/* tslint:disable:max-classes-per-file */

import { UuidIdentity } from '../UuidIdentity';
import { UuidError } from '../Error/UuidError';

it('Create identity', () => {
  const identity = UuidIdentity.create();
  expect(identity).toBeInstanceOf(UuidIdentity);
});

it('Create custom identity', () => {
  class UserId extends UuidIdentity {

  }

  const identity = UserId.create();
  expect(identity).toBeInstanceOf(UserId);
});

it('Convert to custom id', () => {
  class UserId extends UuidIdentity {

  }

  const identity = UuidIdentity.create();
  expect(UserId.of(identity)).toBeInstanceOf(UserId);

  const userId = UserId.create();
  expect(UserId.of(userId)).toBe(userId);
});

it('Know its the same', () => {
  const identity = UuidIdentity.create();
  expect(identity.equals(identity)).toBeTruthy();

});

it('Know its not the same', () => {
  const identity = UuidIdentity.create();
  const identity2 = new UuidIdentity('00f88e96-0f37-44d9-9e10-e5c843a2fcec');
  expect(identity.equals(identity2)).toBeFalsy();
});

it('Know its not a valid uuid', () => {
  expect(() => new UuidIdentity('tes1')).toThrow(UuidError);
});
