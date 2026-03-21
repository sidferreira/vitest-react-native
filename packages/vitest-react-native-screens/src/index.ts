import { existsSync, readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Plugin } from 'vite';

// Resolve from cwd (the app directory when vitest runs) so that packages in
// the app's node_modules are found, not the plugin's node_modules.
const nodeRequireActual = createRequire(pathToFileURL(resolve(process.cwd(), 'package.json')));

const VIRTUAL_ID = '\0vitest-rn-screens-mock';

/**
 * Mock react-native-screens so Screen renders as a plain RN View.
 *
 * The real CJS module is loaded via createRequire (which goes through the
 * pirates hooks already active in the test worker, so react-native and Fabric
 * native components are handled correctly). The module is then cloned with
 * Object.create to preserve all getter-based exports, and the Screen export
 * is overridden with react-native's View — the same approach recommended in
 * the react-native-screens testing docs.
 */
export default function screensPlugin(): Plugin {
  return {
    name: 'vitest-plugin-react-native:screens',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'react-native-screens') return VIRTUAL_ID;
    },
    load(id) {
      if (id !== VIRTUAL_ID) return null;

      const realPath = nodeRequireActual.resolve('react-native-screens/lib/commonjs/index.js');
      if (!existsSync(realPath)) return null;

      // Extract named exports from the _exportNames object declared in the file.
      // This is more robust than hardcoding and adapts to package updates.
      const content = readFileSync(realPath, 'utf-8');
      const match = content.match(/_exportNames\s*=\s*\{([^}]+)\}/);
      const exportNames: string[] = match
        ? [...match[1].matchAll(/(\w+)\s*:\s*true/g)].map(m => m[1])
        : [];

      const otherExports = exportNames
        .filter(n => n !== 'Screen')
        .map(n => `export const ${n} = screens.${n};`)
        .join('\n');

      return `
import { createRequire } from 'node:module';
import { View } from 'react-native';

// Load the real CJS module through the already-active pirates hooks so that
// react-native and Fabric native-component requires are handled correctly.
const _require = createRequire(${JSON.stringify(realPath)});
const _real = _require(${JSON.stringify(realPath)});

// Get all descriptors and override Screen before cloning.
// The real module defines Screen with configurable:false, so we cannot call
// Object.defineProperty on the clone after the fact — patch the descriptor
// map first, then hand it to Object.create.
const _descriptors = Object.getOwnPropertyDescriptors(_real);
_descriptors.Screen = { value: View, configurable: true, writable: true, enumerable: true };
const screens = Object.create(Object.getPrototypeOf(_real), _descriptors);

export default screens;
export const Screen = View;
${otherExports}
`;
    },
  };
}
