import { EventSourcingTestBench, EventSourcingFluidTestBench } from '..';

describe('should proxy all given, when, then functions', () => {
  const testBench: EventSourcingTestBench = new EventSourcingTestBench();
  const fluidTestBench = new EventSourcingFluidTestBench(testBench, () => Promise.resolve());
  const names = Object.getOwnPropertyNames(EventSourcingTestBench.prototype);
  // Maybe not the best idea to logic in test, but now we don't forget any test function.
  for (const name of names) {
    if (name.indexOf('given') === 0 || name.indexOf('when') === 0 || name.indexOf('then') === 0) {
      it(name, async () => {
        const stub = jest.fn();
        (testBench as any)[name] = stub;
        expect((fluidTestBench as any)[name]()).toBe(fluidTestBench);
        await fluidTestBench;
        expect(stub).toBeCalled();
      });
    }
  }
});

it('should be able to catch exceptions', () => {
  const testBench: EventSourcingTestBench = new EventSourcingTestBench();
  const fluidTestBench = new EventSourcingFluidTestBench(testBench, () => Promise.reject('Pew!'));
  return expect(fluidTestBench).rejects.toBe('Pew!');
});

it('should be able to catch exceptions on test bench', (done) => {
  const testBench: EventSourcingTestBench = new EventSourcingTestBench();
  const fluidTestBench = new EventSourcingFluidTestBench(testBench, () => Promise.reject('Pew!'));
  fluidTestBench.catch((error) => {
    expect(error).toBe('Pew!');
    done();
  });
});

it('should be able to try to catch exceptions when there are none', async () => {
  const testBench: EventSourcingTestBench = new EventSourcingTestBench();
  const fluidTestBench = new EventSourcingFluidTestBench(testBench, () => Promise.resolve());
  const spy = jest.fn();
  await fluidTestBench.catch(spy);
  expect(spy).not.toBeCalled();
});
