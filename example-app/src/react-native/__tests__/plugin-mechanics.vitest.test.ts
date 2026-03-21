/**
 * Tests for the plugin's own infrastructure:
 * globals setup, TurboModule proxy, requireNativeComponent mock,
 * NativeComponentRegistry, and jest.requireActual bypass mechanism.
 *
 * These tests fail when the setup files, globals, or pirate mocks are broken.
 */

// requireNativeComponent and NativeComponentRegistry are pirate-mocked (CJS path).
// They are undefined when imported via ESM, so load them via createRequire so the
// pirates hooks apply and we get the mocked implementations.
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
const requireNativeComponent: (name: string) => any =
  _require('react-native/Libraries/ReactNative/requireNativeComponent');
const NativeComponentRegistry: { get: (n: string, f: () => object) => any; setRuntimeConfigProvider: (...a: unknown[]) => void } =
  _require('react-native/Libraries/NativeComponent/NativeComponentRegistry');

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

  test('__turboModuleProxy is a function', () => {
    expect(typeof (globalThis as any).__turboModuleProxy).toBe('function');
  });

  test('__realExportsMap__ is a Map instance', () => {
    expect((globalThis as any).__realExportsMap__).toBeInstanceOf(Map);
  });
});

// ─── TurboModule proxy ────────────────────────────────────────────────────────

describe('TurboModule proxy', () => {
  test('returns a non-null object for a known module', () => {
    const proxy = (globalThis as any).__turboModuleProxy;
    const mod = proxy('Appearance');
    expect(mod).not.toBeNull();
    expect(typeof mod).toBe('object');
  });

  test('returns null for an unknown module name', () => {
    const proxy = (globalThis as any).__turboModuleProxy;
    expect(proxy('DoesNotExist99')).toBeNull();
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

// ─── jest.requireActual bypasses mock ────────────────────────────────────────

describe('jest.requireActual bypasses mock', () => {
  test('__realExportsMap__ is populated (has entries)', () => {
    const map: Map<string, unknown> = (globalThis as any).__realExportsMap__;
    expect(map.size).toBeGreaterThan(0);
  });

  test('jest.requireActual returns real Text module with a function default', () => {
    const mod = (globalThis as any).jest.requireActual('react-native/Libraries/Text/Text');
    expect(typeof mod.default).toBe('function');
  });
});
