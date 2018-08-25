import {
  CommandHandler,
  HandleCommand,
  Command,
  CommandHandlerAlreadyRegisteredError,
  CommandHandlerNotRegisteredError,
  SimpleCommandBus
} from '../';

it('Should handle single command', () => {
  const simpleBus = new SimpleCommandBus();

  const handleCommandSpy = jest.fn();

  class TestCommand implements Command {

  }

  class TestCommandHandler implements CommandHandler {

    @HandleCommand
    public handle(command: TestCommand): void {
      handleCommandSpy(command);
    }
  }

  simpleBus.subscribe(new TestCommandHandler());

  let command = new TestCommand();
  simpleBus.dispatch(command);

  expect(handleCommandSpy).toBeCalledWith(command);
});

it('Should be able to handle multiple commands', () => {
  const simpleBus = new SimpleCommandBus();

  const handleCommandSpy = jest.fn();

  class TestCommandFoo implements Command {

  }

  class TestCommandBar implements Command {

  }

  class TestCommandHandler implements CommandHandler {

    @HandleCommand
    public handleFoo(command: TestCommandFoo): void {
      handleCommandSpy(command);
    }

    @HandleCommand
    public handleBar(command: TestCommandBar): void {
      handleCommandSpy(command);
    }
  }

  simpleBus.subscribe(new TestCommandHandler());

  const commandFoo = new TestCommandFoo();
  simpleBus.dispatch(commandFoo);

  const commandBar = new TestCommandBar();
  simpleBus.dispatch(commandBar);

  expect(handleCommandSpy).toBeCalledWith(commandFoo);
  expect(handleCommandSpy).toBeCalledWith(commandBar);
});

it('Should always be a handler for a command', () => {
  const simpleBus = new SimpleCommandBus();

  class TestCommand implements Command {

  }

  let command = new TestCommand();
  expect(() => {
    simpleBus.dispatch(command);
  }).toThrowError(CommandHandlerNotRegisteredError);
});

it('Cannot have 2 handlers for same command', () => {
  const simpleBus = new SimpleCommandBus();

  class TestCommand implements Command {

  }

  class TestCommandHandler implements CommandHandler {

    @HandleCommand
    public handle(_command: TestCommand): void {
    }
  }

  simpleBus.subscribe(new TestCommandHandler());

  expect(() => {
    simpleBus.subscribe(new TestCommandHandler());
  }).toThrowError(CommandHandlerAlreadyRegisteredError);
});