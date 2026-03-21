import { readFileSync } from 'fs';
import { transformSync } from 'esbuild';
import type { Plugin } from 'vite';
import { stripFlow } from './index.cjs';

const isReactNative = (id: string) =>
  (id.includes('/react-native/') || id.includes('/@react-native/')) && id.endsWith('.js');

// Heuristic: detect JSX in a .js file without a full parse.
// Matches `return <Foo` / `return (<Foo` / `return <foo.` patterns.
const hasJSX = (code: string) => /return\s*\(?\s*<[A-Za-z]/.test(code);

export const stripFlowPlugin: Plugin = {
  name: 'vitest-plugin-react-native:strip-flow',
  enforce: 'pre',
  load(id) {
    if (!isReactNative(id)) return null;
    const code = readFileSync(id, 'utf-8');
    const stripped = stripFlow(code);
    return stripped !== code ? { code: stripped } : null;
  },
  transform(code, id) {
    if (!id.includes('/node_modules/') || !id.endsWith('.js')) return null;

    // Strip Flow types if present.
    const stripped = code.includes('@flow') ? stripFlow(code) : code;

    // If the file (after Flow stripping) still contains JSX, run it through
    // esbuild with the JSX loader so Rolldown can parse it.
    // This covers packages like @expo/vector-icons whose build output retains JSX.
    if (hasJSX(stripped)) {
      return transformSync(stripped, { loader: 'jsx', target: 'esnext' }).code;
    }

    return stripped !== code ? { code: stripped } : null;
  },
};
