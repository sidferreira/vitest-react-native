import { InteractionManager } from 'react-native';

describe('InteractionManager', () => {
  test('runAfterInteractions is a function', () => {
    expect(typeof InteractionManager.runAfterInteractions).toBe('function');
  });

  test('createInteractionHandle is a function', () => {
    expect(typeof InteractionManager.createInteractionHandle).toBe('function');
  });

  test('clearInteractionHandle is a function', () => {
    expect(typeof InteractionManager.clearInteractionHandle).toBe('function');
  });

  test('runAfterInteractions calls the callback', () => {
    const cb = jest.fn();
    InteractionManager.runAfterInteractions(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('runAfterInteractions returns a handle with cancel()', () => {
    const handle = InteractionManager.runAfterInteractions(() => {});
    expect(handle).toBeDefined();
    expect(typeof handle.cancel).toBe('function');
  });

  test('cancel() does not throw', () => {
    const handle = InteractionManager.runAfterInteractions(() => {});
    expect(() => handle.cancel()).not.toThrow();
  });

  test('createInteractionHandle returns a handle (number)', () => {
    const handle = InteractionManager.createInteractionHandle();
    expect(typeof handle).toBe('number');
  });

  test('clearInteractionHandle does not throw', () => {
    const handle = InteractionManager.createInteractionHandle();
    expect(() => InteractionManager.clearInteractionHandle(handle)).not.toThrow();
  });
});
