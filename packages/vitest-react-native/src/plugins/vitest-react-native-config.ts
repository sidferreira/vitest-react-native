import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import type { ReactNativePluginOptions } from '../index.ts';

const _dirname = fileURLToPath(new URL('..', import.meta.url));

export function createVitestReactNativeConfigPlugin(options?: ReactNativePluginOptions): Plugin {
  return {
    name: 'vitest-plugin-react-native',
    enforce: 'pre',
    config: () => ({
      resolve: {
        extensions: [
          '.native.js', '.native.jsx', '.native.ts', '.native.tsx',
          '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json',
          '.ios.js', '.ios.jsx', '.ios.ts', '.ios.tsx',
        ],
        conditions: ['react-native'],
      },
      test: {
        env: {
          JEST_WORKER_ID: '1',
        },
        setupFiles: [resolve(_dirname, 'setup/index.js')],
        globals: true,
        server: {
          deps: {
            inline: [
              'react-native',
              /@react-native\//,
              // react-native-reanimated → vitest-react-native-reanimated
              // react-native-worklets   → vitest-react-native-worklets
              // react-native-gesture-handler → vitest-react-native-gesture-handler
            ],
          },
        },
      },
    }),
  };
}

/** @deprecated Use createVitestReactNativeConfigPlugin instead */
export const vitestReactNativeConfigPlugin = createVitestReactNativeConfigPlugin();
