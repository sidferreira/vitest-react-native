import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'url';
import type { Plugin } from 'vite';

const pluginDir = resolve(fileURLToPath(import.meta.url), '..');
// Resolve from cwd (the app directory when vitest runs) so that packages in
// the app's node_modules are found, not the plugin's node_modules.
const nodeRequireActual = createRequire(pathToFileURL(resolve(process.cwd(), 'package.json')));

function getWorkletsVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(nodeRequireActual.resolve('react-native-worklets/package.json'), 'utf-8')
    );
    return pkg.version as string;
  } catch {
    return '0.0.0';
  }
}

function toVersionInt(version: string): number {
  const [major, minor, patch] = version.split('.').map(Number);
  return major * 1_000_000 + minor * 1_000 + patch;
}

export default function workletsPlugin(): Plugin {
  const version = getWorkletsVersion();
  const useUpstream = toVersionInt(version) >= toVersionInt('0.7.0');

  return {
    name: 'vitest-plugin-react-native:worklets',
    enforce: 'pre',
    config: () => ({
      test: {
        server: {
          deps: {
            inline: ['react-native-worklets'],
          },
        },
      },
    }),
    resolveId(id) {
      if (id !== 'react-native-worklets') return;
      if (useUpstream) {
        return nodeRequireActual.resolve('react-native-worklets/src/mock.ts');
      }
      return resolve(pluginDir, 'mock@0.5.ts');
    },
  };
}
