import type { Plugin } from 'vite';

export const reactNativeMocksPlugin: Plugin = {
  name: 'vitest-plugin-react-native:rn-mocks',
  enforce: 'pre',
  load(id) {
    // InitializeCore and polyfillPromise are no-ops in the CJS/pirates path
    // (mocked to {} in mocks.js). Replicate that for the Vite/ESM path too —
    // otherwise polyfillPromise replaces global.Promise with promise@8.3.0
    // which uses setImmediate → immediateShim → queueMicrotask, causing
    // Vitest's own IPC promise handling to cascade into 890k+ errors + OOM.
    if (
      id.includes('/react-native/') && (
        id.endsWith('/Libraries/Core/InitializeCore.js') ||
        id.endsWith('/Libraries/Core/polyfillPromise.js') ||
        id.endsWith('/Libraries/Core/setUpTimers.js') ||
        id.endsWith('/src/private/setup/setUpDefaultReactNativeEnvironment.js')
      )
    ) {
      return 'export default {};';
    }

    // Delegate ESM imports of mocked RN modules to CJS (pirates-intercepted)
    // so mock definitions live only in setup/mocks/rn-0.81.js.
    if (id.includes('/react-native/') && id.endsWith('/Libraries/Utilities/useColorScheme.js')) {
      return `import { createRequire } from 'node:module';\nconst _mod = createRequire(import.meta.url)(${JSON.stringify(id)});\nexport default _mod.default ?? _mod;\n`;
    }
  },
};
