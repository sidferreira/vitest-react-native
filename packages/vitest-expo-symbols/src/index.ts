import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const pluginDir = resolve(fileURLToPath(import.meta.url), '..');

export default function expoSymbolsPlugin(): Plugin {
  return {
    name: 'vitest-expo-symbols',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'expo-symbols') return resolve(pluginDir, 'mock.tsx');
    },
  };
}
