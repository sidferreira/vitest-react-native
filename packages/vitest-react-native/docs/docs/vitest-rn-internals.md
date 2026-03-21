# Vitest React Native Internals

Two recurring problems when wiring up Vitest for React Native 0.81+.

---

## 1. The `jest.requireActual` circular-reference problem

### Background

React Native ships ready-made Jest mocks under `react-native/jest/mocks/`.
Each mock file delegates to a shared helper `react-native/jest/mockComponent.js`
to build a stub class that wraps the real component.
The chain looks like this (e.g. for `Text`):

```
jest/mocks/Text.js
  → calls jest.requireActual('../mockComponent')
      → mockComponent.js receives moduleName = '../Libraries/Text/Text'
          → calls jest.requireActual('../Libraries/Text/Text')
              → needs the REAL Text component
```

In real Jest this works because `jest.requireActual` completely bypasses the
mock registry and loads a pristine copy of the module.

### What our setup does

We intercept React Native modules using a **pirates** hook
(`setup@0.81.js` → `processReactNative`).
When a test `require`s a mocked RN file, we return a mock code string instead
of the real source.

Because we are not in Jest, we shim the `jest` global in `vitest-setup-file.ts`:

```ts
globalThis.jest = {
  fn: vi.fn,
  requireActual: require,   // ← plain Node require
  // ...
}
```

`requireActual` is just `require`.

### Why `require` breaks here

Node's `require` uses a **module cache** keyed by absolute path.
When a module is being loaded it is added to the cache immediately with
`exports = {}` so that circular requires resolve to the partial object
instead of crashing outright.

Here is the execution order when a test touches `Text`:

```
1. require('react-native/Libraries/Text/Text')
      Node adds Text.js to cache: { exports: {} }   ← empty, loading in progress

2. pirates fires → processReactNative(realCode, '/abs/Text.js')
      returns mock code string:
        module.exports = require('react-native/jest/mocks/Text.js').default

3. Node evaluates that mock code string (mod._compile)...

4.   require('react-native/jest/mocks/Text.js')
         pirates transforms the mock file normally (no mock entry for it)
         mocks/Text.js runs:
           const mockComponent = jest.requireActual('../mockComponent').default
           const Text = mockComponent('../Libraries/Text/Text', ...)
             → inside mockComponent.js:
                 const RealComponent = jest.requireActual('../Libraries/Text/Text')
                                     = require('/abs/Text.js')     ← same path as step 1!

5.   Node looks up /abs/Text.js in cache → finds the entry from step 1
         returns { exports: {} }   ← still empty, loading hasn't finished yet

6. RealComponent = {}.default = undefined

7. mockComponent tries to inspect RealComponent → crashes
```

The problem is that **`require` returns the cache entry, which is still
`{}` because we are mid-load**.
Real Jest avoids this by keeping a separate "real module" registry that is
populated before mocks run; plain `require` has no such mechanism.

### The fix: `__realExportsMap__`

Before returning the mock code string, `processReactNative` evaluates the
**real** source code in a throw-away sandbox and stores the result in a
global map keyed by absolute path:

```js
// setup@0.81.js — inside processReactNative, before the cache early-return
const mock = getMocked(filename);
if (mock && !globalThis.__realExportsMap__.has(filename)) {
  const m = { exports: {} }
  try {
    // Module.createRequire so relative requires inside the real file
    // (e.g. '../TextAncestorContext') resolve from the file's own directory.
    const fileRequire = Module.createRequire(filename)
    const fn = new Function(
      'module', 'exports', 'require', '__filename', '__dirname',
      transformCode(code)   // strips Flow, converts ESM → CJS
    )
    fn(m, m.exports, fileRequire, filename, path.dirname(filename))
    // Only store on success — a failed eval leaves m.exports = {}
    // which would mislead requireActual into returning empty exports.
    globalThis.__realExportsMap__.set(filename, m.exports)
  } catch (_e) {
    // Transitive dep unavailable at this stage; leave map unpopulated.
    // jest.requireActual falls back to require() which may still work.
  }
}
```

Then `jest.requireActual` in `vitest-setup-file.ts` checks the map first:

```ts
requireActual: (id: string) => {
  // Walk Error().stack to find the caller's directory so that a relative id
  // like '../Libraries/Text/Text' (called from inside mockComponent.js)
  // resolves correctly — not relative to vitest-setup-file.ts.
  let callerDir = process.cwd()
  for (const line of (new Error().stack?.split('\n') ?? []).slice(2)) {
    if (line.includes('node:internal') || line.includes('node:vm')) continue
    const m = line.match(/\((.+):\d+:\d+\)/) ?? line.match(/at (.+):\d+:\d+/)
    if (!m?.[1]) continue
    const framePath = m[1]
    if (framePath.startsWith('node:') || framePath === _thisFile) continue
    callerDir = dirname(framePath)
    break
  }

  let resolved: string
  try { resolved = require.resolve(id, { paths: [callerDir] }) }
  catch { try { resolved = require.resolve(id) } catch { return require(id) } }

  // ← this is the key: return pre-computed real exports, bypassing the cache
  const map = (globalThis as any).__realExportsMap__
  if (map?.has(resolved)) return map.get(resolved)

  return require(resolved)   // fallback
},
```

With this in place the chain that was circular becomes linear:

```
1. require('Text.js')
      processReactNative evaluates real Text.js in new Function sandbox
      __realExportsMap__.set('/abs/Text.js', { default: RealTextFn, ... })
      returns mock code string

2. mock code: require('jest/mocks/Text.js').default
      mocks/Text.js → mockComponent('../Libraries/Text/Text')
        → jest.requireActual('../Libraries/Text/Text')
            stack frame = mockComponent.js  →  callerDir = react-native/jest/
            resolved = /abs/react-native/Libraries/Text/Text.js
            __realExportsMap__.has(resolved) = true  ✓
            returns { default: RealTextFn }   ← no cache involved
        → RealComponent = RealTextFn          ← correct real component
```

### Why `Module.createRequire(filename)` matters

The sandbox `new Function` receives a `require` argument.
If we pass the `require` from `setup@0.81.js`, relative paths like
`require('../TextAncestorContext')` would resolve relative to
`toolchain/vitest/vitest-react-native-plugin/` — wrong.

`Module.createRequire(filename)` returns a `require` that resolves relative
to `filename`'s directory, exactly like the file would see at normal load
time. Pirates hooks are global, so this require still goes through all
existing hooks.

### Why the stack walk matters

`mockComponent.js` calls `jest.requireActual('../Libraries/Text/Text')`.
That `../` is relative to `react-native/jest/mockComponent.js`.
Our `requireActual` implementation runs in `vitest-setup-file.ts`, so a plain
`require.resolve('../Libraries/Text/Text')` would resolve relative to
`toolchain/vitest/` — completely wrong path.

By inspecting `Error().stack` we find the actual call site inside
`mockComponent.js`, extract its directory, and use
`require.resolve(id, { paths: [callerDir] })`.

---

## 2. `mockComponent.js` incompatibility with RN 0.81+ functional components

### Background

`react-native/jest/mockComponent.js` is the upstream helper that builds a
stub wrapper around a real component. It determines how to extend the real
component with this logic:

```js
// mockComponent.js ~line 40
const SuperClass =
  typeof RealComponent === 'function' &&
  RealComponent.prototype.constructor instanceof React.Component
    ? RealComponent        // class component → extend it directly
    : React.Component;     // anything else → extend React.Component
```

The intent: if `RealComponent` is a React class component, use it as the
superclass so the stub inherits its static methods and default props.
Otherwise fall back to a plain `React.Component` base.

### What RN 0.81+ exports

React Native 0.81 migrated most components from class components to
functional components defined with Flow's new `component` declaration syntax:

```js
// Libraries/Text/Text.js (RN 0.81, simplified)
const TextImpl: component(
  ref?: React.RefSetter<TextForwardRef>,
  ...props: TextProps
) = (ref, props) => {
  // functional component body
};
TextImpl.displayName = 'Text';
export default TextImpl;
```

After Flow types are stripped and ESM is converted to CJS, `TextImpl` is
an **arrow function**:

```js
const TextImpl = (ref, props) => { /* ... */ };
```

Similarly, `View.js` uses Flow's `component View(` declaration which after
our preprocessing (`component Foo(` → `function Foo(`) becomes a regular
function declaration — but still without class semantics.

### Why this crashes `mockComponent.js`

JavaScript arrow functions do **not** have a `prototype` property:

```js
const arrow = () => {}
typeof arrow            // 'function'   → true
arrow.prototype         // undefined    ← no prototype on arrow functions
arrow.prototype.constructor  // TypeError: Cannot read properties of undefined
```

Regular class declarations do:

```js
class Foo extends React.Component {}
typeof Foo              // 'function'   → true
Foo.prototype           // { constructor: Foo }
Foo.prototype.constructor instanceof React.Component  // true
```

`mockComponent.js` evaluates the `&&` chain:

```
typeof RealComponent === 'function'
  → true (it is a function, even arrow functions pass this)

RealComponent.prototype.constructor instanceof React.Component
  → RealComponent.prototype  =  undefined  (arrow fn)
  → undefined.constructor    =  TypeError ← crash
```

If the component were a `React.forwardRef` result, `typeof result` would be
`'object'`, the short-circuit would save it, and it would land on
`React.Component`. Only **bare arrow functions** crash this check.

### Example comparison

```js
// Class component — works fine
class OldText extends React.Component {
  render() { return <RCTText {...this.props} /> }
}
// typeof OldText === 'function' ✓
// OldText.prototype.constructor === OldText ✓
// OldText.prototype.constructor instanceof React.Component ✓

// Arrow function component — crashes
const NewText = (ref, props) => { /* ... */ }
// typeof NewText === 'function' ✓
// NewText.prototype === undefined
// undefined.constructor → TypeError 💥
```

### Why our old custom `mockComponent` didn't have this problem

Our hand-rolled code string in `setup@0.81.js` used a simpler guard:

```js
const SuperClass =
  typeof RealComponent === 'function' ? RealComponent : React.Component;
```

No `.prototype` access, no crash, works for arrow functions, classes, and
forwardRef alike.

### Implications for upstream mock delegation

Because `mockComponent.js` crashes on RN 0.81+ functional components, the
upstream mock files that call `mockComponent` — `mocks/Text.js`,
`mocks/View.js`, `mocks/Image.js`, `mocks/TextInput.js`,
`mocks/ActivityIndicator.js`, `mocks/Modal.js`, `mocks/ScrollView.js` —
**cannot be used as-is** for RN 0.81+.

### The fix applied

`processReactNative` in `setup@0.81.js` transforms every file under
`/node_modules/react-native/` — including `jest/mockComponent.js`. After
`transformCode()` we apply a targeted string replacement:

```js
if (normalize(filename).endsWith('/react-native/jest/mockComponent.js')) {
  transformed = transformed.replace(
    /RealComponent\.prototype\.constructor instanceof React\.Component/g,
    'RealComponent.prototype != null && RealComponent.prototype.constructor instanceof React.Component'
  );
}
```

This adds the null guard without touching the upstream file on disk, and the
patched result is cached so it only runs once per version. All component mocks
(`Text`, `View`, `Image`, `TextInput`, `Modal`, `ScrollView`,
`ActivityIndicator`, `RefreshControl`) can now be safely delegated to upstream
`react-native/jest/mocks/*.js`.

### Other options (not taken)

| Option | How |
|---|---|
| Keep custom mocks | The hand-rolled stubs in `setup@0.81.js` already handle arrow functions correctly via the simpler `typeof` check |
| Intercept in requireActual | Return a patched version when `resolved` ends with `mockComponent.js` — more complex |
| Contribute upstream | Fix `mockComponent.js` in `react-native` to guard `RealComponent.prototype` before accessing `.constructor` |
