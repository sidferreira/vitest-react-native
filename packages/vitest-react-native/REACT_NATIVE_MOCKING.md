# React Native Mocking in Vitest

This document explains how React Native's jest preset is bridged into Vitest, covering the two loading paths, all mocked modules, global definitions, RN 0.81+ patches, and how to add new mocks.

---

## Two Loading Paths

There are two distinct module loading pipelines and it is critical to understand which one a given file uses:

```
Test file (src/**/*.test.ts)  →  Vite module runner (ESM)
  └─ react-native imports      →  server.deps.inline → Vite transform → strip-flow plugin

setupFiles (setup@0.81.js)    →  Node require() (CJS)
  └─ react-native require()   →  Pirates hook → esbuild+Flow → mock substitution
```

### CJS path (pirates)
- Activated for `require()` calls in setup files and transitively loaded node_modules.
- Handled by `setup@0.81.js` via `addHook` from the `pirates` library.
- Applies Flow stripping, esbuild transpilation, and mock substitution.
- **Mocks defined here apply to this path only.**

### ESM path (Vite)
- Activated for `import` statements in test files (`src/**/*.test.ts`).
- `server.deps.inline: [/react-native|expo/]` in `vitest.config.ts` forces react-native packages through Vite's transform pipeline instead of Node's resolver.
- The `vitest-plugin-react-native:strip-flow` plugin in `plugin.ts` strips Flow types.
- `resolve.conditions: ['react-native']` prefers the `react-native` export condition from package.json.
- **Mocks do NOT apply via this path** — the CJS-mocked module is executed once and its result is made available through Vite's CJS interop.

---

## Global Definitions

All globals are set in `setup@0.81.js` via `Object.defineProperties(globalThis, ...)` before any `require()` is called.

| Global | Value | Source |
|---|---|---|
| `__DEV__` | `true` | RN preset requirement |
| `IS_REACT_ACT_ENVIRONMENT` | `true` | RN preset requirement |
| `IS_REACT_NATIVE_TEST_ENVIRONMENT` | `true` | RN preset requirement |
| `window` | `global` | RN preset requirement |
| `performance.now` | `vi.fn(Date.now)` | RN preset requirement |
| `regeneratorRuntime` | `require('regenerator-runtime/runtime')` | RN preset requirement |
| `requestAnimationFrame` | `cb => setTimeout(() => cb(vi.getRealSystemTime()), 0)` | RN preset requirement |
| `cancelAnimationFrame` | `id => clearTimeout(id)` | RN preset requirement |
| `nativeFabricUIManager` | `{}` | RN preset requirement |
| `RN$Bridgeless` | `true` | Custom: prevents legacy NativeModules fallback |
| `__turboModuleProxy` | function returning mock by name | Custom: TurboModule support (see below) |
| `__ExpoImportMetaRegistry` | `{ url: null }` | Custom: Expo 54 polyfill |

### TurboModule Mock (`__turboModuleProxy`)

`TurboModuleRegistry.js` captures `global.__turboModuleProxy` as a module-level variable at load time. If it is undefined when first loaded it stays undefined forever. Therefore it must be set before any `require()` that could transitively load `TurboModuleRegistry`.

The proxy is a function `(name) => turboModuleMocks[name] ?? null` where `turboModuleMocks` contains stubs for:
`NativeReactNativeFeatureFlagsCxx`, `DeviceInfo`, `PlatformConstants`, `SoundManager`, `KeyboardObserver`, `StatusBarManager`, `Appearance`, `NativeAnimatedTurboModule`, `AlertManager`, `AsyncLocalStorage`, `DevSettings`, `ImageLoader`, `Networking`, `SourceCode`, `Timing`, `BlobModule`, `WebSocketModule`, `NativeI18nManager`.

---

## Module Mocks

All mocks are registered via the `mock(path, factory)` helper in `setup@0.81.js`, which pushes entries into the `mocked` array. The pirates hook checks this array via `getMocked(filename)` using **suffix matching** (not substring) to avoid false matches.

### All 21 `jest/mocks/` modules + extras

| Module | Library Path | Mock Strategy |
|---|---|---|
| AccessibilityInfo | `Libraries/Components/AccessibilityInfo/AccessibilityInfo` | Delegates to `jest/mocks/AccessibilityInfo` |
| ActivityIndicator | `Libraries/Components/ActivityIndicator/ActivityIndicator` | Delegates to `jest/mocks/ActivityIndicator.js` |
| AppState | `Libraries/AppState/AppState` | Delegates to `jest/mocks/AppState` |
| Clipboard | `Libraries/Components/Clipboard/Clipboard` | Delegates to `jest/mocks/Clipboard` |
| Image | `Libraries/Image/Image` | Delegates to `jest/mocks/Image.js` |
| InitializeCore | `Libraries/Core/InitializeCore` | Returns `{}` (no-op) |
| Linking | `Libraries/Linking/Linking` | Delegates to `jest/mocks/Linking` |
| Modal | `Libraries/Modal/Modal` | Delegates to `jest/mocks/Modal.js` |
| NativeComponentRegistry | `Libraries/NativeComponent/NativeComponentRegistry` | Custom: calls `requireNativeComponent` |
| NativeModules | `Libraries/BatchedBridge/NativeModules` | Delegates to `jest/mocks/NativeModules` |
| RefreshControl | `Libraries/Components/RefreshControl/RefreshControl` | Delegates to `jest/mocks/RefreshControl.js` |
| requireNativeComponent | `Libraries/ReactNative/requireNativeComponent` | Custom: class-based component factory |
| ScrollView | `Libraries/Components/ScrollView/ScrollView` | Delegates to `jest/mocks/ScrollView.js` |
| Text | `Libraries/Text/Text` | Delegates to `jest/mocks/Text.js` |
| TextInput | `Libraries/Components/TextInput/TextInput` | Delegates to `jest/mocks/TextInput.js` |
| UIManager | `Libraries/ReactNative/UIManager` | Delegates to `jest/mocks/UIManager` |
| useColorScheme | `Libraries/Utilities/useColorScheme` | Custom: `vi.fn(() => 'light')` |
| Vibration | `Libraries/Utilities/Vibration` | Delegates to `jest/mocks/Vibration` |
| View | `Libraries/Components/View/View` | Delegates to `jest/mocks/View.js` |
| ViewNativeComponent | `Libraries/Components/View/ViewNativeComponent` | Custom: class-based View component |
| verifyComponentAttributeEquivalence | `Libraries/Utilities/verifyComponentAttributeEquivalence` | Returns no-op function |

**Additional non-preset mocks:**

| Module | Mock Strategy |
|---|---|
| `Libraries/Core/NativeExceptionsManager` | Custom: stub with `vi.fn()` methods |
| `src/private/featureflags/specs/NativeReactNativeFeatureFlags` | Returns `null` |

**Note on RendererProxy:** `jest/mocks/RendererProxy.js` in upstream delegates to the real `ReactNativeRenderer-prod`. We don't intercept this path and rely on Vite inlining the real renderer.

---

## RN 0.81+ Specific Patches

### `mockComponent.js` crash on arrow-function components

Upstream `jest/mockComponent.js` line 43 does:
```js
RealComponent.prototype.constructor instanceof React.Component
```
RN 0.81+ uses arrow functions for `Text`, `View`, etc. Arrow functions have no `.prototype`, causing a `TypeError`. The pirates hook patches the transformed code with a null guard:
```js
RealComponent.prototype != null && RealComponent.prototype.constructor instanceof React.Component
```

### Flow `component Foo(` syntax

RN 0.81+ uses Flow's component declaration syntax (`component Foo(...) { ... }`), which `flow-remove-types` does not strip. `transformCode()` pre-processes the source with a regex before passing it to `flow-remove-types`:
```js
code.replace(/\bcomponent\s+(\w+)\s*\(/g, 'function $1(')
```

### `useColorScheme` without native bridge

`useColorScheme()` calls `NativeAppearance` which requires a native bridge. Our mock returns `vi.fn(() => 'light')` matching the upstream `jest/mocks/useColorScheme.js` behaviour.

---

## `__realExportsMap__` Mechanism

**Problem:** `jest.requireActual` is called from within `jest/mocks/*.js` (e.g., `mockComponent.js` calls `jest.requireActual('../Libraries/Components/View/View')`). If `require()` is used naively, Node's module cache returns the partially-initialised mock instead of real exports — causing a circular dependency.

**Solution:** Before the mock code runs, `processReactNative()` evaluates the real source with `new Function` + `Module.createRequire(filename)` and stores the result in `globalThis.__realExportsMap__` (keyed by absolute file path).

`jest.requireActual` in `vitest-setup-file.ts`:
1. Walks the call stack to find the caller's directory (so relative IDs resolve correctly).
2. Resolves the module ID to an absolute path via `require.resolve(id, { paths: [callerDir] })`.
3. Checks `__realExportsMap__` first — if present, returns that directly.
4. Falls back to `require(resolved)` if not in the map.

---

## How to Add a New Mock

1. **Find the library path** in `node_modules/react-native/Libraries/...`.
2. **Add a `mock()` call** in `setup@0.81.js`:

   ```js
   // Delegating to an existing jest mock:
   mock(
     "react-native/Libraries/Path/To/Module",
     () => `{ __esModule: true, default: require('react-native/jest/mocks/Module').default }`
   );

   // Custom mock:
   mock(
     "react-native/Libraries/Path/To/Module",
     () => `{ __esModule: true, default: vi.fn() }`
   );
   ```

3. **Important:** The factory function must return a string of JavaScript source code (not an object). The string is injected as `module.exports = <string>` into the pirates-transformed file.

4. **Check for `mockComponent` issues:** If the upstream mock calls `mockComponent`, and the real component is an arrow function (RN 0.81+), the patch in `processReactNative()` handles it automatically. If you write a custom mock, use a class component or a plain functional component directly.

5. **Clear the cache** after changes (the cache is version-keyed by `reactNativePkg.version + pluginPkg.version` in `tmp/vrn/`). Either bump the plugin version or delete `tmp/vrn/` manually.

---

## Running Tests

```sh
VITEST_REACT_NATIVE=0.81.4 npx vitest run --config toolchain/vitest/vitest.config.ts
```

`VITEST_REACT_NATIVE=0.81.4` is required — without it, `setup@main.js` loads instead of `setup@0.81.js` and the results are wrong.
