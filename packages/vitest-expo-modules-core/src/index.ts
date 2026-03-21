import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const pluginDir = resolve(fileURLToPath(import.meta.url), '..');

export default function expoModulesCorePlugin(): Plugin {
  return {
    name: 'vitest-expo-modules-core',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'expo-modules-core' || id.startsWith('expo-modules-core/'))
        return resolve(pluginDir, 'mock.js');
    },
  };
}
