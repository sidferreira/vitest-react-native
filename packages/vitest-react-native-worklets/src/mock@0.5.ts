// Based on https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-worklets/src/mock.ts
// Compatible with react-native-worklets 0.5.x

const NOOP = () => {};
const NOOP_FACTORY = () => NOOP;
const ID = (value: unknown) => value;
const IMMEDIATE_CALLBACK_INVOCATION = (callback: () => void) => callback();

// From runLoop/uiRuntime/mockedRequestAnimationFrame.ts
function mockedRequestAnimationFrame(callback: (time: number) => void) {
  return +setTimeout(() => callback(performance.now()), 0);
}

// From runtimeKind.ts
const RuntimeKind = { ReactNative: 1, UI: 2, Worker: 3 };

// From workletFunction.ts
function isWorkletFunction(value: unknown) {
  return typeof value === 'function' && !!(value as unknown as Record<string, unknown>).__workletHash;
}

// Set global state expected by Reanimated internals
(globalThis as Record<string, unknown>)._WORKLET = false;
(globalThis as Record<string, unknown>).__RUNTIME_KIND = RuntimeKind.ReactNative;
(globalThis as Record<string, unknown>)._log = console.log;
(globalThis as Record<string, unknown>)._getAnimationTimestamp = () => performance.now();
globalThis.requestAnimationFrame = mockedRequestAnimationFrame;

export const isShareableRef = () => true;
export const makeShareable = ID;
export const makeShareableCloneOnUIRecursive = ID;
export const makeShareableCloneRecursive = ID;
export const shareableMappingCache = new Map();
export const getStaticFeatureFlag = () => false;
export const setDynamicFeatureFlag = NOOP;
export const isSynchronizable = () => false;
export const getRuntimeKind = () => RuntimeKind.ReactNative;
export { RuntimeKind };
export const createWorkletRuntime = NOOP_FACTORY;
export const runOnRuntime = ID;
export function runOnRuntimeAsync(_workletRuntime: unknown, worklet: (...args: unknown[]) => unknown, ...args: unknown[]) {
  return runOnUIAsync(worklet, ...args);
}
export const scheduleOnRuntime = IMMEDIATE_CALLBACK_INVOCATION;
export const createSerializable = ID;
export const isSerializableRef = ID;
export const serializableMappingCache = new Map();
export const createSynchronizable = ID;
export const callMicrotasks = NOOP;
export const executeOnUIRuntimeSync = ID;
export function runOnJS(fun: (...args: unknown[]) => unknown) {
  return (...args: unknown[]) =>
    queueMicrotask(args.length ? () => fun(...args) : (fun as () => void));
}
export function runOnUI(worklet: (...args: unknown[]) => unknown) {
  return (...args: unknown[]) => {
    mockedRequestAnimationFrame(() => worklet(...args));
  };
}
export function runOnUIAsync(worklet: (...args: unknown[]) => unknown, ...args: unknown[]) {
  return new Promise((resolve) => {
    mockedRequestAnimationFrame(() => resolve(worklet(...args)));
  });
}
export const runOnUISync = IMMEDIATE_CALLBACK_INVOCATION;
export function scheduleOnRN(fun: (...args: unknown[]) => unknown, ...args: unknown[]) {
  runOnJS(fun)(...args);
}
export function scheduleOnUI(worklet: (...args: unknown[]) => unknown, ...args: unknown[]) {
  runOnUI(worklet)(...args);
}
export { isWorkletFunction };
export const WorkletsModule = {};
