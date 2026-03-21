import type { Plugin } from 'vite';
import { createVitestReactNativeConfigPlugin } from './plugins/vitest-react-native-config.ts';
import { reactNativeMocksPlugin } from './plugins/react-native@0.81.ts';
import { stripFlowPlugin } from 'vitest-react-strip-flow/plugin';

export interface ReactNativePluginOptions {}

export default function reactNative(options?: ReactNativePluginOptions): Plugin[] {
  return [
    createVitestReactNativeConfigPlugin(options),
    reactNativeMocksPlugin,
    stripFlowPlugin,
  ];
}
