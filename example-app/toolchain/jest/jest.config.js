/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../../',
  testPathIgnorePatterns: [
    '<rootDir>/tmp/',
    // These tests import directly from 'vitest' and cannot run under Jest
    '<rootDir>/src/old-tests/',
    // Vitest-only tests (use import.meta, await import(), or vitest-specific globals)
    '\\.vitest\\.test\\.[tj]sx?$',
  ],
  preset: 'jest-expo',
  setupFiles: [
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
    '<rootDir>/toolchain/jest/setup.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/toolchain/jest/setup.afterFramework.js'],
  moduleNameMapper: {
    // Upstream mocks — use the packages' own official mock files
    '^react-native-worklets$': '<rootDir>/node_modules/react-native-worklets/src/mock.ts',
    '^react-native-reanimated$': '<rootDir>/node_modules/react-native-reanimated/mock.js',
    // expo-symbols: SymbolView is a native iOS component; stub it with a View
    '^expo-symbols$': '<rootDir>/toolchain/jest/mocks/expo-symbols.js',
    // expo-haptics: native module; stub with jest.fn() so tests can spy on calls
    '^expo-haptics$': '<rootDir>/toolchain/jest/mocks/expo-haptics.js',
  },
  transformIgnorePatterns: [
    // pnpm stores packages under node_modules/.pnpm/<pkg@version>/node_modules/<pkg>.
    // The nested structure produces two node_modules/ segments in the path:
    //   .../node_modules/.pnpm/@react-navigation+native@7.x/node_modules/@react-navigation/native
    // We need (.pnpm/[^/]+/node_modules/)? to skip over the entire .pnpm/<encoded> segment
    // so the lookahead sees the real package name (e.g. @react-navigation/native).
    'node_modules/(?!(\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-gesture-handler|react-native-reanimated|react-native-worklets))',
  ],
};
