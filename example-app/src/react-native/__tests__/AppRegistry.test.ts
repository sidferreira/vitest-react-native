import { AppRegistry } from 'react-native';

describe('AppRegistry', () => {
  test('registerComponent is a function', () => {
    expect(typeof AppRegistry.registerComponent).toBe('function');
  });

  test('runApplication is a function', () => {
    expect(typeof AppRegistry.runApplication).toBe('function');
  });

  test('getAppKeys is a function', () => {
    expect(typeof AppRegistry.getAppKeys).toBe('function');
  });

  test('registerHeadlessTask is a function', () => {
    expect(typeof AppRegistry.registerHeadlessTask).toBe('function');
  });

  test('registerComponent does not throw', () => {
    expect(() =>
      AppRegistry.registerComponent('MyApp', () => () => null)
    ).not.toThrow();
  });

  test('getAppKeys returns an array', () => {
    const keys = AppRegistry.getAppKeys();
    expect(Array.isArray(keys)).toBe(true);
  });
});
