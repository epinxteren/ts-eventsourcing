import { ClassUtil } from '../ClassUtil';

class TestClass {

}

it('Knows name of constructor', async () => {
  expect(ClassUtil.nameOff(TestClass)).toBe('TestClass');
});

it('Knows name of instance', async () => {
  expect(ClassUtil.nameOff(new TestClass())).toBe('TestClass');
});
