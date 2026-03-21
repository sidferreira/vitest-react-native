/**
 * Pure unit tests for every symbol exported by the react-native-worklets mock.
 * No components — just the raw API.
 */

import {
  getRuntimeKind,
  RuntimeKind,
  isWorkletFunction,
  isShareableRef,
  makeShareable,
  makeShareableCloneRecursive,
  createSerializable,
  isSynchronizable,
  runOnUI,
  runOnUIAsync,
  runOnUISync,
  runOnJS,
  scheduleOnUI,
  scheduleOnRN,
  executeOnUIRuntimeSync,
  callMicrotasks,
  getStaticFeatureFlag,
  setDynamicFeatureFlag,
  createWorkletRuntime,
  runOnRuntime,
  scheduleOnRuntime,
} from 'react-native-worklets';

// ─── getRuntimeKind ───────────────────────────────────────────────────────────

describe('getRuntimeKind', () => {
  test('returns RuntimeKind.ReactNative (1) in test env', () => {
    expect(getRuntimeKind()).toBe(RuntimeKind.ReactNative);
    expect(getRuntimeKind()).toBe(1);
  });
});

// ─── RuntimeKind enum ─────────────────────────────────────────────────────────

describe('RuntimeKind enum', () => {
  test('ReactNative = 1', () => {
    expect(RuntimeKind.ReactNative).toBe(1);
  });

  test('UI = 2', () => {
    expect(RuntimeKind.UI).toBe(2);
  });

  test('Worker = 3', () => {
    expect(RuntimeKind.Worker).toBe(3);
  });
});

// ─── isWorkletFunction ────────────────────────────────────────────────────────

describe('isWorkletFunction', () => {
  test('returns false for a plain function', () => {
    expect(isWorkletFunction(() => {})).toBe(false);
  });

  test('returns false for a non-function', () => {
    expect(isWorkletFunction(42 as unknown as () => void)).toBe(false);
  });

  test('returns true when __workletHash is set', () => {
    const fn = () => {};
    (fn as unknown as Record<string, unknown>).__workletHash = 123;
    expect(isWorkletFunction(fn)).toBe(true);
  });
});

// ─── makeShareable / isShareableRef ──────────────────────────────────────────

describe('makeShareable family', () => {
  test('makeShareable returns the same value (identity)', () => {
    const obj = { x: 1 };
    expect(makeShareable(obj)).toBe(obj);
  });

  test('makeShareable works with primitives', () => {
    expect(makeShareable(42)).toBe(42);
    expect(makeShareable('hello')).toBe('hello');
  });

  test('isShareableRef always returns true', () => {
    expect(isShareableRef({})).toBe(true);
    expect(isShareableRef(null)).toBe(true);
    expect(isShareableRef(42)).toBe(true);
  });

  test('makeShareableCloneRecursive is identity', () => {
    const arr = [1, 2, 3];
    expect(makeShareableCloneRecursive(arr)).toBe(arr);
  });

  test('createSerializable is identity', () => {
    const val = { key: 'val' };
    expect(createSerializable(val)).toBe(val);
  });

  test('isSynchronizable always returns false', () => {
    expect(isSynchronizable({} as never)).toBe(false);
  });
});

// ─── runOnUI ──────────────────────────────────────────────────────────────────

describe('runOnUI', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('worklet is not called synchronously', () => {
    const worklet = jest.fn();
    runOnUI(worklet)();
    expect(worklet).not.toHaveBeenCalled();
  });

  test('worklet is called after timer flush', () => {
    const worklet = jest.fn();
    runOnUI(worklet)();
    jest.runAllTimers();
    expect(worklet).toHaveBeenCalledTimes(1);
  });

  test('passes arguments to worklet', () => {
    const worklet = jest.fn();
    runOnUI(worklet)(10, 'hello');
    jest.runAllTimers();
    expect(worklet).toHaveBeenCalledWith(10, 'hello');
  });

  test('multiple independent calls each schedule independently', () => {
    const worklet = jest.fn();
    runOnUI(worklet)(1);
    runOnUI(worklet)(2);
    jest.runAllTimers();
    expect(worklet).toHaveBeenCalledTimes(2);
    expect(worklet).toHaveBeenNthCalledWith(1, 1);
    expect(worklet).toHaveBeenNthCalledWith(2, 2);
  });
});

// ─── runOnUIAsync ─────────────────────────────────────────────────────────────

describe('runOnUIAsync', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('calling the curried fn returns a Promise', () => {
    const p = runOnUIAsync((n: number) => n)(5);
    expect(p).toBeInstanceOf(Promise);
  });

  test('Promise resolves with worklet return value after timer flush', async () => {
    let resolved: number | undefined;
    runOnUIAsync((n: number) => n * 2)(7).then((v) => { resolved = v; });
    expect(resolved).toBeUndefined();
    jest.runAllTimers();
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(14);
  });

  test('multiple concurrent calls resolve independently', async () => {
    const results: number[] = [];
    runOnUIAsync((n: number) => n + 1)(10).then((v) => results.push(v));
    runOnUIAsync((n: number) => n + 1)(20).then((v) => results.push(v));
    jest.runAllTimers();
    await Promise.resolve();
    expect(results).toContain(11);
    expect(results).toContain(21);
  });
});

// ─── runOnUISync ──────────────────────────────────────────────────────────────

describe('runOnUISync', () => {
  test('executes callback synchronously', () => {
    const fn = jest.fn();
    runOnUISync(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('returns the value returned by the callback', () => {
    const result = runOnUISync(() => 42);
    expect(result).toBe(42);
  });
});

// ─── runOnJS ──────────────────────────────────────────────────────────────────

describe('runOnJS', () => {
  test('fn is not called synchronously', () => {
    const fn = jest.fn();
    runOnJS(fn)();
    expect(fn).not.toHaveBeenCalled();
  });

  test('fn is called after microtask flush', async () => {
    const fn = jest.fn();
    runOnJS(fn)();
    await Promise.resolve();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('passes arguments to fn', async () => {
    const fn = jest.fn();
    runOnJS(fn)(42, 'test');
    await Promise.resolve();
    expect(fn).toHaveBeenCalledWith(42, 'test');
  });
});

// ─── scheduleOnUI / scheduleOnRN ──────────────────────────────────────────────

describe('scheduleOnUI', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('fires worklet with args after timer flush', () => {
    const worklet = jest.fn();
    scheduleOnUI(worklet, 'a', 'b');
    expect(worklet).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(worklet).toHaveBeenCalledWith('a', 'b');
  });
});

describe('scheduleOnRN', () => {
  test('fires fn with args after microtask flush', async () => {
    const fn = jest.fn();
    scheduleOnRN(fn, 99);
    expect(fn).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(fn).toHaveBeenCalledWith(99);
  });
});

// ─── executeOnUIRuntimeSync ───────────────────────────────────────────────────

describe('executeOnUIRuntimeSync', () => {
  test('is identity — returns the argument as-is', () => {
    const fn = () => 42;
    expect(executeOnUIRuntimeSync(fn)).toBe(fn);
  });
});

// ─── callMicrotasks ───────────────────────────────────────────────────────────

describe('callMicrotasks', () => {
  test('is a no-op that does not throw', () => {
    expect(() => callMicrotasks()).not.toThrow();
  });
});

// ─── Feature flags ────────────────────────────────────────────────────────────

describe('feature flags', () => {
  test('getStaticFeatureFlag always returns false', () => {
    expect(getStaticFeatureFlag('anything' as never)).toBe(false);
  });

  test('setDynamicFeatureFlag is a no-op that does not throw', () => {
    expect(() => setDynamicFeatureFlag('anything' as never, true as never)).not.toThrow();
  });
});

// ─── Runtimes ─────────────────────────────────────────────────────────────────

describe('runtimes', () => {
  test('createWorkletRuntime returns a callable no-op', () => {
    const runtime = createWorkletRuntime('test');
    expect(typeof runtime).toBe('function');
    expect(() => (runtime as unknown as () => void)()).not.toThrow();
  });

  test('runOnRuntime is identity on its first argument', () => {
    const rt = {} as never;
    expect(runOnRuntime(rt)).toBe(rt);
  });

  test('scheduleOnRuntime executes callback synchronously', () => {
    const fn = jest.fn(() => 'result');
    scheduleOnRuntime(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
