/**
 * Jest-only tests for shared test infrastructure:
 * globals setup, requireNativeComponent mock, NativeComponentRegistry.
 *
 * Vitest-specific globals (__turboModuleProxy, __realExportsMap__) are covered
 * in plugin-mechanics.vitest.test.ts instead.
 */

import { createRequire } from 'node:module';
// __filename is available as a CJS global in Jest.
const _require = createRequire(__filename);
// Babel CJS wraps `export default` as { default: fn }; unwrap with .default.
const _rncMod = _require('react-native/Libraries/ReactNative/requireNativeComponent');
const requireNativeComponent: (name: string) => any = _rncMod?.default ?? _rncMod;
const _ncrMod = _require('react-native/Libraries/NativeComponent/NativeComponentRegistry');
const NativeComponentRegistry: { get: (n: string, f: () => object) => any; setRuntimeConfigProvider: (...a: unknown[]) => void } =
  _ncrMod?.default ?? _ncrMod;

// ─── Plugin globals ───────────────────────────────────────────────────────────

describe('Plugin globals', () => {
  test('__DEV__ is true', () => {
    expect((globalThis as any).__DEV__).toBe(true);
  });

  test('IS_REACT_NATIVE_TEST_ENVIRONMENT is true', () => {
    expect((globalThis as any).IS_REACT_NATIVE_TEST_ENVIRONMENT).toBe(true);
  });

  test('IS_REACT_ACT_ENVIRONMENT is true', () => {
    expect((globalThis as any).IS_REACT_ACT_ENVIRONMENT).toBe(true);
  });

  test('process.env.JEST_WORKER_ID is set', () => {
    expect(process.env.JEST_WORKER_ID).toBeTruthy();
  });
});

// ─── requireNativeComponent mock ─────────────────────────────────────────────

describe('requireNativeComponent mock', () => {
  test('returns a constructor/class', () => {
    const Component = requireNativeComponent('RCTMyView');
    expect(typeof Component).toBe('function');
  });

  test('instances expose host component methods', () => {
    const Component = requireNativeComponent('RCTMyView') as any;
    const instance = new Component({});
    expect(typeof instance.blur).toBe('function');
    expect(typeof instance.focus).toBe('function');
    expect(typeof instance.measure).toBe('function');
    expect(typeof instance.measureInWindow).toBe('function');
    expect(typeof instance.measureLayout).toBe('function');
    expect(typeof instance.setNativeProps).toBe('function');
  });

  test('displayName is the view name passed in', () => {
    const Component = requireNativeComponent('RCTMyView') as any;
    expect(Component.displayName).toBe('RCTMyView');
  });
});

// ─── NativeComponentRegistry ──────────────────────────────────────────────────

describe('NativeComponentRegistry', () => {
  test('get() returns a component (not null)', () => {
    const Component = NativeComponentRegistry.get('RCTView', () => ({}));
    expect(Component).not.toBeNull();
    expect(typeof Component).toBe('function');
  });

  test('setRuntimeConfigProvider is a function', () => {
    expect(typeof NativeComponentRegistry.setRuntimeConfigProvider).toBe('function');
  });
});
