/* tslint:disable:max-classes-per-file */

import 'jest';
import { TransitJSSerializer } from '../TransitJSSerializer';
import { Record } from 'immutable';
import { createClassHandlers } from '../createClassHandlers';
import { DeNormalize, Normalize } from '../../Serializeable';

describe('Serializer', () => {

  it('Can serialize normal javascript objects', () => {
    const serializer = new TransitJSSerializer([]);
    const date = new Date();
    date.setTime(1518770045540);
    const target = {
      date,
      arrays: [1, 2, 3],
      objects: { test: 2 },
    };
    const serialized = serializer.serialize(target);
    expect(serialized).toMatchSnapshot();
    const deSerialized = serializer.deserialize(serialized);
    expect(deSerialized).toEqual(target);
  });

  it('Can serialize records', () => {
    const testRecord = Record({ name: 'foo' }, 'test');
    const test = new testRecord({ name: 'bar' });
    const serializer = new TransitJSSerializer([testRecord]);
    const serialized = serializer.serialize(test);
    expect(serialized).toMatchSnapshot();
    const deSerialized = serializer.deserialize(serialized);
    expect(deSerialized).toEqual(test);
  });

  it('Should name a record', () => {
    const testRecord = Record({});
    expect(() => new TransitJSSerializer([testRecord])).toThrowError();
  });

  it('Name should not be empty', () => {
    const testRecord = Record({}, '');
    expect(() => new TransitJSSerializer([testRecord])).toThrowError();
  });

  it('Cannot name same class twice', () => {
    const testRecord = Record({}, 'test');
    expect(() => new TransitJSSerializer([testRecord, testRecord])).toThrowError();
  });

  it('Can serialize a random class', () => {
    class TestClass {
      public t = 2;
      public name = 55;
      public appel: string | undefined;
      public date: Date | undefined;

      constructor(public foo: string = 'bar') {

      }
    }

    const test = new TestClass('d');
    const date = new Date();
    date.setTime(1518770045540);
    test.date = date;
    const serializer = new TransitJSSerializer([], createClassHandlers({ TestClass }));
    const serialized = serializer.serialize(test);
    expect(serialized).toMatchSnapshot();
    const deSerialized: TestClass = serializer.deserialize(serialized) as any;
    expect(deSerialized).toEqual(test);
    expect(deSerialized).toBeInstanceOf(TestClass);
    expect(deSerialized.date).toBeInstanceOf(Date);
  });

  it('Can serialize a different classes', () => {
    class TestBase {
      public t = 2;
      public name = 55;
      public appel: string | undefined;
      public date: Date | undefined;

      constructor(public foo: string = 'bar') {

      }
    }

    class TestChild extends TestBase {

    }

    const test = new TestBase('d');
    const test2 = new TestChild('e');
    const date = new Date();
    date.setTime(1518770045540);
    test.date = date;
    const serializer = new TransitJSSerializer([], createClassHandlers({ TestClass2: TestChild, TestClass: TestBase }));
    const serialized = serializer.serialize([test, test2]);
    const deSerialized = serializer.deserialize(serialized) as any;
    expect(deSerialized).toEqual([test, test2]);
    expect(deSerialized[0]).toBeInstanceOf(TestBase);
    expect(deSerialized[1]).toBeInstanceOf(TestChild);
    expect(deSerialized[0]).not.toBeInstanceOf(TestChild);
  });

  class TestObject {

    @DeNormalize
    protected static deNormalize(data: any) {
      return new this(data.v);
    }

    constructor(public value: number) {
    }

    @Normalize
    protected normalize(): any {
      return { v: this.value };
    }
  }

  it('Can serialize with custom serializer functions', () => {
    const serializer = new TransitJSSerializer([], createClassHandlers({ TestObject }));
    const serialized = serializer.serialize(new TestObject(2323));

    expect(serialized).toMatch('["~#TestObject",["^ ","v",2323]]');

    const deSerialized = serializer.deserialize(serialized);
    expect(deSerialized).toBeInstanceOf(TestObject);
    expect(deSerialized).toEqual(new TestObject(2323));

  });

  it('Can serialize with custom serializer functions of extended class', () => {

    class TestObject2 extends TestObject {
    }

    const serializer = new TransitJSSerializer([], createClassHandlers({ TestObject2 }));
    const serialized = serializer.serialize(new TestObject2(2323));

    expect(serialized).toMatch('["~#TestObject2",["^ ","v",2323]]');

    const deSerialized = serializer.deserialize(serialized);
    expect(deSerialized).toBeInstanceOf(TestObject2);
    expect(deSerialized).toEqual(new TestObject2(2323));

  });

  it('Can serialize nested classes', () => {

    class Cat {
      constructor(public legs: Leg[]) {
      }

    }

    class Leg {
      constructor(public claws: Claw, public hairColor: string) {
      }
    }

    class Claw {

    }

    const serializer = new TransitJSSerializer([], createClassHandlers({ Cat, Leg, Claw }));
    const serialized = serializer.serialize(new Cat([
      new Leg(new Claw(), 'red'),
      new Leg(new Claw(), 'brown'),
      new Leg(new Claw(), 'white'),
      new Leg(new Claw(), 'black'),
    ]));

    const deserialized = serializer.deserialize(serialized);

    expect(deserialized).toEqual(new Cat([
      new Leg(new Claw(), 'red'),
      new Leg(new Claw(), 'brown'),
      new Leg(new Claw(), 'white'),
      new Leg(new Claw(), 'black'),
    ]));

  });

});
