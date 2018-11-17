import { ProcessLogger } from '../ProcessLogger';
import * as os from 'os';

it('should pass log message to stdout and stderror logger', () => {

  const process = {
    stderr: {
      write: jest.fn(),
    },
    stdout: {
      write: jest.fn(),
    },
  };

  const logger = new ProcessLogger(process as any);

  /* tslint:disable:no-console */
  logger.info('test info', 1);
  expect(process.stdout.write).toBeCalledWith(`test info 1 ${os.EOL}`);
  logger.warn('test warning', 2);
  expect(process.stdout.write).toBeCalledWith(`test warning 2 ${os.EOL}`);
  logger.debug('test debug', 3);
  expect(process.stdout.write).toBeCalledWith(`test debug 3 ${os.EOL}`);
  logger.error('test error', 4);
  expect(process.stderr.write).toBeCalledWith(`test error 4 ${os.EOL}`);
});
