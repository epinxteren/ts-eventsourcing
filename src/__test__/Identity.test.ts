/* tslint:disable:max-classes-per-file */

import { Identity } from '../Identity';

it('Create identity', () => {
  const identity = Identity.create();
  expect(identity).toBeInstanceOf(Identity);
});

it('Create custom identity', () => {
  class UserId extends Identity {

  }

  const identity = UserId.create();
  expect(identity).toBeInstanceOf(UserId);
});

it('Convert to custom id', () => {
  class UserId extends Identity {

  }

  const identity = Identity.create();
  expect(UserId.of(identity)).toBeInstanceOf(UserId);

  const userId = UserId.create();
  expect(UserId.of(userId)).toBe(userId);
});

it('Know its the same', () => {
  const identity = Identity.create();
  expect(identity.equals(identity)).toBeTruthy();

});

it('Know its not the same', () => {
  const identity = Identity.create();
  const identity2 = new Identity('tes1');
  expect(identity.equals(identity2)).toBeFalsy();
});
