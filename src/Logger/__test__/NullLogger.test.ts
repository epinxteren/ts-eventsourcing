import { NullLogger } from '../NullLogger';

it('Should do nothing', () => {
  const logger = new NullLogger();
  logger.info('test info', 1);
  logger.warn('test warning', 2);
  logger.debug('test debug', 3);
  logger.error('test error', 4);
  // can't expect nothing from nothing.
  expect(true).toBeTruthy();
});
