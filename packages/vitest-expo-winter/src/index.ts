import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const pluginDir = resolve(fileURLToPath(import.meta.url), '..');

export default function expoWinterPlugin(): Plugin {
  return {
    name: 'vitest-expo-winter',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'expo-winter') return resolve(pluginDir, 'mock.js');
    },
  };
}
