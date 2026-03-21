import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const pluginDir = resolve(fileURLToPath(import.meta.url), '..');

export default function expoHapticsPlugin(): Plugin {
  return {
    name: 'vitest-expo-haptics',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'expo-haptics') return resolve(pluginDir, 'mock.js');
    },
  };
}
