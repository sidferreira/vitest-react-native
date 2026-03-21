const addHook = require("pirates").addHook;
const esbuild = require("esbuild");
const { transformSync: oxcTransformSync } = require("oxc-transform");
const fs = require('fs')
const path = require('path')
const Module = require('module')
const { Buffer } = require('buffer')
const reactNativePkg = require('react-native/package.json')

const pluginPkg = require('../../../package.json')
const stripFlow = require("vitest-react-strip-flow").stripFlow;

const root = process.cwd()
const cacheDirBase = path.join(root, 'tmp', 'vrn')
const version = reactNativePkg.version + pluginPkg.version
const cacheDir = path.join(cacheDirBase, version)
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true })
}
const cacheDirFolders = fs.readdirSync(cacheDirBase)
cacheDirFolders.forEach(folder => {
  // remove old cache dirs that don't match the current version
  if (folder !== version) {
    fs.rmdirSync(path.join(cacheDirBase, folder))
  }
})

const mocked = [];
// Use suffix matching instead of substring to avoid false matches —
// e.g. TextAncestorContext.js must not match the "Text/Text" mock.
const getMocked = (filename) => {
  const normalFilename = normalize(filename);
  return mocked.find(([p]) => {
    const normalP = normalize(p);
    return (
      normalFilename.endsWith(normalP + '.js') ||
      normalFilename.endsWith(normalP + '.ios.js')
    );
  });
};

// we need to process react-native dependency, because they ship flow types
// removing types is not enough, we also need to convert ESM imports/exports into CJS
const transformCode = (code) => {
  // RN 0.81+ uses Flow's `component Foo(` declaration syntax which
  // flow-remove-types does not strip. Replace it with standard `function Foo(`
  // before running flow-remove-types so the rest of the type annotations are
  // stripped correctly and esbuild can parse the output.
  const preprocessed = code.includes('component ')
    ? code.replace(/\bcomponent\s+(\w+)\s*\(/g, 'function $1(')
    : code;
  const result = stripFlow(preprocessed).toString();
  return esbuild.transformSync(result, {
    loader: "jsx",
    format: "cjs",
    platform: "node",
    // Use the automatic JSX runtime so files that don't import React
    // (e.g. react-native/jest/mocks/Modal.js) still compile correctly.
    jsx: "automatic",
  }).code;
};

const normalize = (p) => p.replace(/\\/g, "/");

const cacheExists = (cachePath) => fs.existsSync(cachePath)
const readFromCache = (cachePath) => fs.readFileSync(cachePath, 'utf-8')
const writeToCache = (cachePath, code) => fs.writeFileSync(cachePath, code)

const processBinary = (code, filename) => {
  const b64 = Buffer.from(code).toString('base64')
  return `module.exports = Buffer.from("${b64}", "base64")`
}

addHook(
  (code, filename) => {
    return processBinary(code, filename)
  },
  {
    exts: [".png", ".jpg"],
    ignoreNodeModules: false
  }
)

require.extensions['.ios.js'] = require.extensions['.js']

const processReactNative = (code, filename) => {
  const cacheName = normalize(path.relative(root, filename)).replace(/\//g, '_')
  const cachePath = path.join(cacheDir, cacheName)

  // Check for a mock entry BEFORE the cache early-return so we can always
  // populate __realExportsMap__ with the real exports.  This map is consumed by
  // jest.requireActual (in vitest-setup-file.ts) to avoid circular dependencies
  // when upstream mockComponent.js calls jest.requireActual on a mocked file.
  const mock = getMocked(filename);
  if (mock && !globalThis.__realExportsMap__.has(filename)) {
    const m = { exports: {} }
    try {
      // Use Module.createRequire(filename) so that relative requires inside the
      // real file (e.g. '../TextAncestorContext') resolve from the file's own
      // directory, not from transform-hooks.js's directory.
      const fileRequire = Module.createRequire(filename)
      // eslint-disable-next-line no-new-func
      const fn = new Function('module', 'exports', 'require', '__filename', '__dirname',
                              transformCode(code))
      fn(m, m.exports, fileRequire, filename, path.dirname(filename))
      // Only populate the map on success — a failed evaluation leaves m.exports
      // as {} which would mislead jest.requireActual into returning empty exports.
      globalThis.__realExportsMap__.set(filename, m.exports)
    } catch (_e) {
      // Evaluation failed (e.g. a transitive dep is unavailable at this stage).
      // Leave the map unpopulated; jest.requireActual will fall back to require().
    }
  }

  if (cacheExists(cachePath))
    return readFromCache(cachePath, 'utf-8')

  if (mock) {
    const mockCode = `\n    ${mock[1]}\n    `;
    writeToCache(cachePath, mockCode)
    return mockCode;
  }
  let transformed = transformCode(code);

  // Patch mockComponent.js to handle arrow-function components (RN 0.81+).
  // Arrow functions have no .prototype, so the upstream check
  //   RealComponent.prototype.constructor instanceof React.Component
  // throws TypeError. Guard with a null check first.
  if (normalize(filename).endsWith('/react-native/jest/mockComponent.js')) {
    transformed = transformed.replace(
      /RealComponent\.prototype\.constructor instanceof React\.Component/g,
      'RealComponent.prototype != null && RealComponent.prototype.constructor instanceof React.Component'
    );
  }

  writeToCache(cachePath, transformed)
  return transformed
}

addHook(
  (code, filename) => processReactNative(code, filename),
  {
    exts: [".js", ".ios.js"],
    ignoreNodeModules: false,
    matcher: (id) => {
      const p = normalize(id)
      return (
        (p.includes("/node_modules/react-native/")
        || p.includes("/node_modules/@react-native/"))
        // renderer doesn't have jsx inside and it's too big to process
        && !p.includes('Renderer/implementations')
      )
    }
  }
);

addHook(
  (code, filename) => {
    const isTsx = filename.endsWith('.tsx');
    const flowStripped = stripFlow(code);
    const { code: tsStripped } = oxcTransformSync(filename, flowStripped, {
      jsx: isTsx ? {} : undefined,
    });
    return esbuild.transformSync(tsStripped, {
      loader: isTsx ? 'jsx' : 'js',
      format: 'cjs',
      platform: 'node',
    }).code;
  },
  {
    exts: ['.ts', '.tsx'],
    ignoreNodeModules: false,
    matcher: (id) => normalize(id).includes('/node_modules/'),
  }
);

const mock = (modulePath, fn) => {
  if (typeof fn !== "function") {
    throw new Error(
      `mock must be a function, got ${typeof fn} instead for ${modulePath}`
    );
  }
  mocked.push([modulePath, `module.exports = ${fn()}`]);
};

module.exports = { mock };
