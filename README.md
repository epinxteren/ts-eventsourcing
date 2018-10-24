# TS Eventsourcing

Providing infrastructure and testing helpers for creating CQRS and event sourced applications. 
The project contains several loosely coupled components that can be used together to provide a full CQRS\ES experience.

[![Build Status](https://travis-ci.org/epinxteren/ts-eventsourcing.svg?branch=master)](https://travis-ci.org/epinxteren/ts-eventsourcing)

## Features
- Using Typescript
- Jest for testing

## Just the basics

If you brand new to Event sourcing, CQRS or Typescript and you want to understand the basics concepts, see

- **[Command Query Responsibility Segregation]( https://martinfowler.com/bliki/CQRS.html)** explanation by Martin Fowler
- Watch this **[Event sourcing](https://www.youtube.com/watch?v=I3uH3iiiDqY&t=192s)** video by Greg Young
- The **[Typescript introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)** 

## Installation

To install the stable version:

```
yarn install
```

This assumes you are using [yarn](https://yarnpkg.com) as your package manager.


See examples in **/src/__test/\*Example.ts**

## Tests

To Run the test-suites:

```
yarn test
```

## License

MIT