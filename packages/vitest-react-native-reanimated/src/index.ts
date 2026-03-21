import { readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Plugin } from 'vite';

// Resolve from cwd (the app directory when vitest runs) so that packages in
// the app's node_modules are found, not the plugin's node_modules.
const nodeRequireActual = createRequire(pathToFileURL(resolve(process.cwd(), 'package.json')));

// Redirect react-native-reanimated directly to src/mock.ts so it loads as a
// first-class ESM module inside Vite's module runner (same registry as the
// test file's own react-native imports). This avoids the mock.js CJS wrapper
// which would exit the Vite runner into Node's CJS/pirates system, where the
// View getter resolves to a different registry and can come back undefined.
//
// react-native-worklets interception is handled by vitest-react-native-worklets,
// which must be registered before this plugin.
export default function reactNativeReanimatedPlugin(): Plugin {
  return {
    name: 'vitest-plugin-react-native:reanimated',
    enforce: 'pre',
    config: () => ({
      test: {
        server: {
          deps: {
            inline: ['react-native-reanimated'],
          },
        },
      },
    }),
    resolveId(id) {
      if (id === 'react-native-reanimated')
        return nodeRequireActual.resolve('react-native-reanimated/src/mock.ts');
    },
    load(id) {
      if (!id.endsWith('react-native-reanimated/src/mock.ts')) return null;
      // src/mock.ts ends with `module.exports = { __esModule: true, ...Reanimated, default: Animated }`.
      // That CJS pattern makes Vite switch to CJS evaluation mode, causing imports
      // inside the module to exit the Vite module runner into Node's CJS/pirates.
      // Slice off everything from `\nmodule.exports` to end-of-file and replace
      // with proper ESM exports so everything stays in the Vite runner.
      const src = readFileSync(id, 'utf-8');
      const cutAt = src.lastIndexOf('\nmodule.exports');
      const head = cutAt >= 0 ? src.slice(0, cutAt) : src;

      // Collect names already bound in head so we don't re-declare them.
      // Value imports (not `import type`) are safe to re-export as-is.
      const importedNames = new Set<string>();
      for (const m of head.matchAll(/^import\s+\{([^}]*)\}\s*from/gm)) {
        for (const part of m[1].split(',')) {
          const alias = part.trim().split(/\s+as\s+/).at(-1)?.trim() ?? '';
          if (/^\w+$/.test(alias)) importedNames.add(alias);
        }
      }
      // Top-level `const X = ...` names — value differs from Reanimated[X] for spread containers.
      const constNames = new Set<string>();
      for (const m of head.matchAll(/^const\s+(\w+)\s*=/gm)) constNames.add(m[1]);

      // Discover which vars are spread into Reanimated, then extract their keys.
      const reanimatedBlock = head.match(/^const Reanimated\s*=\s*\{([\s\S]*?)\n\};/m)?.[1] ?? '';
      const spreadVars = [...reanimatedBlock.matchAll(/\.\.\.([\w]+)/g)].map(m => m[1]);
      const reanimatedKeys = new Set<string>();
      for (const varName of spreadVars) {
        const re = new RegExp(`\\bconst ${varName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm');
        const body = head.match(re)?.[1] ?? '';
        // Match top-level keys: exactly 2-space indent + identifier + `:` or `(`
        for (const km of body.matchAll(/^  (\w+)\s*[:(]/gm)) reanimatedKeys.add(km[1]);
      }

      // Generate export lines, avoiding re-declaration conflicts.
      const reExports: string[] = [];
      const aliasLines: string[] = [];
      const newKeys: string[] = [];
      for (const name of [...reanimatedKeys, 'reanimatedVersion']) {
        if (importedNames.has(name)) {
          reExports.push(name); // safe: re-export the existing import binding
        } else if (constNames.has(name)) {
          // Local const with same name is the spread container, not the value —
          // access Reanimated[name] directly to avoid TDZ / shadowing.
          aliasLines.push(`const _x_${name} = Reanimated.${name};\nexport { _x_${name} as ${name} };`);
        } else {
          newKeys.push(name); // not yet in scope, safe to destructure-export
        }
      }

      const parts = [
        reExports.length ? `export { ${reExports.join(', ')} };` : '',
        ...aliasLines,
        newKeys.length ? `export const {\n  ${newKeys.join(',\n  ')},\n} = Reanimated;` : '',
        'export default Animated;',
      ].filter(Boolean).join('\n');

      return { code: head + '\n' + parts + '\n' };
    },
  };
}
