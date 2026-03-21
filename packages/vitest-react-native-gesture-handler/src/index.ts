import { createRequire } from 'node:module';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Plugin } from 'vite';

// Resolve from cwd (the app directory when vitest runs) so that packages in
// the app's node_modules are found, not the plugin's node_modules.
const nodeRequireActual = createRequire(pathToFileURL(resolve(process.cwd(), 'package.json')));

/**
 * Redirect react-native-gesture-handler native-binding files to the upstream
 * compiled mocks, following the same pattern as jestSetup.js — but wired via
 * Vite's resolveId instead of jest.mock().
 *
 * Only the three native-binding touch points are redirected so that
 * GestureDetector, Gesture, Swipeable, fireGestureHandler, etc. all load from
 * real RNGH code and continue to work correctly in tests.
 */
export default function gestureHandlerPlugin(): Plugin {
  const mocksDir = resolve(nodeRequireActual.resolve('react-native-gesture-handler/package.json'), '../lib/commonjs/mocks');
  return {
    name: 'vitest-plugin-react-native:gesture-handler',
    enforce: 'pre',
    config: () => ({
      test: {
        server: {
          deps: {
            inline: ['react-native-gesture-handler'],
          },
        },
      },
    }),
    resolveId(id, importer) {
      // RNGestureHandlerModule and NativeRNGestureHandlerModule (TurboModule
      // binding) → NOOP mock so TurboModuleRegistry.getEnforcing doesn't throw
      if (
        id.endsWith('/RNGestureHandlerModule') ||
        id.endsWith('/RNGestureHandlerModule.js') ||
        id.includes('NativeRNGestureHandlerModule')
      ) {
        return resolve(mocksDir, 'mocks.js');
      }
      // GestureButtons (RawButton/BaseButton/RectButton native component wrappers)
      if (id.endsWith('/GestureButtons') || id.endsWith('/GestureButtons.js')) {
        return resolve(mocksDir, 'mocks.js');
      }
      // Pressable component — guard on importer to avoid intercepting other packages
      if (
        (id.endsWith('/Pressable') || id.endsWith('/Pressable.js')) &&
        importer?.includes('react-native-gesture-handler')
      ) {
        return resolve(mocksDir, 'Pressable.js');
      }
    },
  };
}
