// react-native-reanimated checks JEST_WORKER_ID to detect a test environment.
// Without it, it tries to instantiate a native module and crashes.
process.env.JEST_WORKER_ID ??= '1'

// Capture native queueMicrotask before setUpTimers.js can replace global.queueMicrotask
// with a broken getter from NativeMicrotasksCxx. We provide a real implementation
// via NativeMicrotasksCxx turbo mock (below) so the polyfillGlobal call succeeds.
const _nativeQueueMicrotask = globalThis.queueMicrotask?.bind(globalThis)
  ?? ((fn) => Promise.resolve().then(fn))

// Set these BEFORE any require() that could transitively load TurboModuleRegistry.
// TurboModuleRegistry.js captures `global.__turboModuleProxy` as a module-level
// variable at load time — if it's undefined when first loaded it stays undefined
// forever in that module instance, causing NativeModules[name] to crash.
// RN$Bridgeless=true prevents the legacy NativeModules fallback path.
globalThis.RN$Bridgeless = true
globalThis.__turboModuleProxy = (name) => null   // replaced with full mock below

// Side-channel map from absolute file path → real (un-mocked) module.exports.
// Populated by processReactNative before mock code runs, so that
// jest.requireActual can return real exports without going through Node's
// module cache (which would return a partially-initialised module and cause a
// circular dependency when upstream mockComponent loads a mocked component).
globalThis.__realExportsMap__ = new Map()

// adapted from https://github.com/facebook/react-native/blob/main/jest/setup.js
require("@react-native/polyfills/Object.es8");

// RN$registerCallableModule: called by registerCallableModule.js when
// ReactNativeRenderer loads via CJS/pirates. Without it, the renderer throws
// immediately and cascades 893k unhandled rejections that OOM the process.
globalThis.RN$registerCallableModule ??= () => {}

Object.defineProperties(globalThis, {
  // Expo 54: __ExpoImportMetaRegistry global
  // Prevents lazy-require errors when expo's import.meta polyfill is accessed
  __ExpoImportMetaRegistry: {
    configurable: true,
    enumerable: false,
    value: { url: null },
    writable: true,
  },
  __DEV__: {
    configurable: true,
    enumerable: true,
    value: true,
    writable: true,
  },
  IS_REACT_NATIVE_TEST_ENVIRONMENT: {
    configurable: true,
    enumerable: true,
    value: true,
    writable: true,
  },
  IS_REACT_ACT_ENVIRONMENT: {
    configurable: true,
    enumerable: true,
    value: true,
    writable: true,
  },
  nativeFabricUIManager: {
    configurable: true,
    enumerable: true,
    value: {},
    writable: true,
  },
  cancelAnimationFrame: {
    configurable: true,
    enumerable: true,
    value: id => clearTimeout(id),
    writable: true,
  },
  performance: {
    configurable: true,
    enumerable: true,
    value: {
      now: vi.fn(Date.now),
    },
    writable: true,
  },
  regeneratorRuntime: {
    configurable: true,
    enumerable: true,
    value: require('regenerator-runtime/runtime'),
    writable: true,
  },
  ensureNativeMethodsAreSynced: {
    configurable: true,
    enumerable: true,
    value: {
      now: vi.fn(),
    },
    writable: true,
  },
  requestAnimationFrame: {
    configurable: true,
    enumerable: true,
    value: callback => setTimeout(() => callback(vi.getRealSystemTime()), 0),
    writable: true,
  },
  window: {
    configurable: true,
    enumerable: true,
    value: global,
    writable: true,
  },
})

// __turboModuleProxy: TurboModuleRegistry reads this at module load time.
// Handles all New Architecture TurboModule.get() / getEnforcing() calls.
const turboModuleMocks = {
  NativeReactNativeFeatureFlagsCxx: { getConstants: () => ({}) },
  DeviceInfo: {
    getConstants: () => ({
      Dimensions: {
        window: { fontScale: 2, height: 1334, scale: 2, width: 750 },
        screen: { fontScale: 2, height: 1334, scale: 2, width: 750 },
      },
    }),
  },
  PlatformConstants: {
    getConstants: () => ({
      forceTouchAvailable: false, interfaceIdiom: 'handset', isTesting: true,
      osVersion: '17.0',
      reactNativeVersion: { major: 0, minor: 81, patch: 4, prerelease: null },
      systemName: 'iOS',
    }),
  },
  SoundManager: { playTouchSound: () => {} },
  KeyboardObserver: { addListener: () => {}, removeListeners: () => {} },
  StatusBarManager: {
    getConstants: () => ({ HEIGHT: 42, DEFAULT_BACKGROUND_COLOR: 0 }),
    setColor: () => {}, setStyle: () => {}, setHidden: () => {},
    setNetworkActivityIndicatorVisible: () => {},
    setBackgroundColor: () => {}, setTranslucent: () => {},
  },
  Appearance: {
    getColorScheme: () => 'light',
    addChangeListener: () => ({ remove: () => {} }),
  },
  NativeAnimatedTurboModule: {
    startOperationBatch: () => {}, finishOperationBatch: () => {},
    createAnimatedNode: () => {}, startListeningToAnimatedNodeValue: () => {},
    stopListeningToAnimatedNodeValue: () => {},
    connectAnimatedNodes: () => {}, disconnectAnimatedNodes: () => {},
    startAnimatingNode: () => {}, stopAnimation: () => {},
    setAnimatedNodeValue: () => {}, setAnimatedNodeOffset: () => {},
    flattenAnimatedNodeOffset: () => {}, extractAnimatedNodeOffset: () => {},
    connectAnimatedNodeToView: () => {}, disconnectAnimatedNodeFromView: () => {},
    dropAnimatedNode: () => {}, addAnimatedEventToView: () => {},
    removeAnimatedEventFromView: () => {},
    restoreDefaultValues: () => {},
    getValue: (_tag, cb) => cb(0),
  },
  AlertManager: { alertWithArgs: vi.fn() },
  ActionSheetManager: {
    showShareActionSheetWithOptions: vi.fn((_opts, _errorCb, successCb) => successCb(true, 'sharedAction')),
    showActionSheetWithOptions: vi.fn((_opts, cb) => cb(0)),
  },
  AsyncLocalStorage: {
    multiGet: vi.fn((keys, cb) => process.nextTick(() => cb(null, []))),
    multiSet: vi.fn((entries, cb) => process.nextTick(() => cb(null))),
    multiRemove: vi.fn((keys, cb) => process.nextTick(() => cb(null))),
    multiMerge: vi.fn((entries, cb) => process.nextTick(() => cb(null))),
    clear: vi.fn((cb) => process.nextTick(() => cb(null))),
    getAllKeys: vi.fn((cb) => process.nextTick(() => cb(null, []))),
  },
  DevSettings: { addMenuItem: vi.fn(), reload: vi.fn() },
  ImageLoader: {
    getSize: vi.fn(() => Promise.resolve([320, 240])),
    prefetchImage: vi.fn(), queryCache: vi.fn(),
  },
  Networking: {
    sendRequest: vi.fn(), abortRequest: vi.fn(),
    addListener: vi.fn(), removeListeners: vi.fn(),
  },
  SourceCode: { getConstants: () => ({ scriptURL: null }) },
  Timing: { createTimer: vi.fn(), deleteTimer: vi.fn() },
  BlobModule: {
    getConstants: () => ({ BLOB_URI_SCHEME: 'content', BLOB_URI_HOST: null }),
    addNetworkingHandler: vi.fn(), createFromParts: vi.fn(), release: vi.fn(),
  },
  WebSocketModule: {
    connect: vi.fn(), send: vi.fn(), sendBinary: vi.fn(),
    ping: vi.fn(), close: vi.fn(),
    addListener: vi.fn(), removeListeners: vi.fn(),
  },
  RNSModule: {
    getConstants: () => ({}),
    startTransition: () => {},
    finishTransition: () => {},
    dismissModal: () => {},
    setStackAnimation: () => {},
  },
  RNGestureHandlerModule: {
    handleSetJSResponder: () => {},
    handleClearJSResponder: () => {},
    createGestureHandler: () => {},
    attachGestureHandler: () => {},
    updateGestureHandler: () => {},
    dropGestureHandler: () => {},
    install: () => true,
    flushOperations: () => {},
  },
  // setUpTimers.js (loaded when RN$Bridgeless=true) replaces global.queueMicrotask
  // with a getter from NativeMicrotasksCxx. Without this mock, the getter throws
  // (getEnforcing fails) → global.queueMicrotask becomes broken → promise@8.3.0
  // setImmediate → immediateShim → queueMicrotask fails → 890k cascade + OOM.
  // setUpTimers.js (runs when RN$Bridgeless=true) polyfills these globals from
  // TurboModules. Without these entries, getEnforcing throws when the getter is
  // accessed — which breaks queueMicrotask (OOM cascade) and requestIdleCallback.
  NativeMicrotasksCxx: { queueMicrotask: _nativeQueueMicrotask },
  NativeIdleCallbacksCxx: {
    requestIdleCallback: (cb) => setTimeout(() => cb({ timeRemaining: () => 50, didTimeout: false }), 0),
    cancelIdleCallback: (id) => clearTimeout(id),
  },
  NativeI18nManager: {
    allowRTL: vi.fn(), forceRTL: vi.fn(), swapLeftAndRightInRTL: vi.fn(),
    getConstants: () => ({ isRTL: false, doLeftAndRightSwapInRTL: true }),
  },
}
globalThis.__turboModuleProxy = (name) => turboModuleMocks[name] ?? null

// Pre-populate Platform in require cache to avoid circular-require crashes
try {
  const platformPath = require.resolve('react-native/Libraries/Utilities/Platform.js')
  const platformMock = {
    OS: 'ios', Version: '17.0', isTesting: true,
    isPad: false, isTV: false, isVision: false, isMacCatalyst: false,
    select: (spec) => spec.ios ?? spec.native ?? spec.default,
  }
  require.cache[platformPath] = {
    id: platformPath, filename: platformPath, loaded: true,
    exports: { __esModule: true, default: platformMock, ...platformMock },
  }
} catch (_e) {}

// Suppress NativeEventEmitter warnings that fire when a mock module lacks the
// addListener / removeListeners methods. These are expected in the test env.
const _warn = console.warn.bind(console)
console.warn = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : ''
  if (msg.includes('`new NativeEventEmitter()`')) return
  // codegenNativeComponent warns when RN$Bridgeless=true and codegen hasn't run.
  // RN$Bridgeless must be true in tests (to activate TurboModules), but codegen
  // never runs in a test env — this warning is expected and not actionable.
  if (msg.startsWith("Codegen didn't run for")) return
  _warn(...args)
}
