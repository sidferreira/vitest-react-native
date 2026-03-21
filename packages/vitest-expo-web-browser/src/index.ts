import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const pluginDir = resolve(fileURLToPath(import.meta.url), '..');

export default function expoWebBrowserPlugin(): Plugin {
  return {
    name: 'vitest-expo-web-browser',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'expo-web-browser') return resolve(pluginDir, 'mock.js');
    },
  };
}
