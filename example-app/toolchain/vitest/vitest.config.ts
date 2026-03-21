import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { existsSync } from 'fs'
import { transformSync } from 'esbuild'
import reactNative from 'vitest-react-native'
import reactNativeWorklets from 'vitest-react-native-worklets'
import reactNativeReanimated from 'vitest-react-native-reanimated'
import reactNativeGestureHandler from 'vitest-react-native-gesture-handler'
import reactNativeScreens from 'vitest-react-native-screens'
import expoWebBrowser from 'vitest-expo-web-browser'
import expoModulesCore from 'vitest-expo-modules-core'
import expoSymbols from 'vitest-expo-symbols'
import expoHaptics from 'vitest-expo-haptics'
import expoWinter from 'vitest-expo-winter'
import reactNavigationElements from 'vitest-react-navigation-elements'
import jestCompat from 'vitest-jest-compat'

const repoRoot = resolve(__dirname, '../..')

export default defineConfig({
  plugins: [
    jestCompat(),
    {
      name: 'node-modules-ts',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/node_modules/')) return null
        // Compile .ts/.tsx files in node_modules
        if (id.endsWith('.ts') || id.endsWith('.tsx')) {
          return transformSync(code, {
            loader: id.endsWith('.tsx') ? 'tsx' : 'ts',
            target: 'esnext',
          }).code
        }
        // Rewrite extensionless relative requires to .ts/.tsx where the file exists,
        // so that Node's CJS resolver can find them (it doesn't try .ts by default)
        if (id.endsWith('.js') || id.endsWith('.cjs') || id.endsWith('.mjs')) {
          const rewritten = code.replace(
            /\brequire\(['"](\.[^'"]+)['"]\)/g,
            (match, rel) => {
              if (/\.\w+$/.test(rel)) return match // already has extension
              for (const ext of ['.ts', '.tsx']) {
                if (existsSync(resolve(dirname(id), rel + ext))) {
                  return match.replace(rel, rel + ext)
                }
              }
              return match
            }
          )
          return rewritten !== code ? rewritten : null
        }
        return null
      },
    },
    reactNative(),
    reactNativeWorklets(),
    reactNativeReanimated(),
    reactNativeGestureHandler(),
    reactNativeScreens(),
    expoSymbols(),
    expoHaptics(),
    expoWinter(),
    reactNavigationElements(),
    expoModulesCore(),
    expoWebBrowser(),
    react(), // automatic JSX runtime (React 17+, no React in scope needed)
  ],
  test: {
    globals: true,
    cache: false,
    testTimeout: 30000,
    pool: 'forks', // child_process forks → pirates require hooks work correctly
    root: repoRoot,
    isolate: false,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/*.jest.test.{ts,tsx}'],
    typecheck: {
      tsconfig: resolve(repoRoot, 'tsconfig.json'),
    },
    server: {
      deps: {
        inline: [/react-native|expo|@react-navigation/],
      },
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(repoRoot, 'src') },
    ],
  },
})
