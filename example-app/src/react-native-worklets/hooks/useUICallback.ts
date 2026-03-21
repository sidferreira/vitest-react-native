import { useCallback } from 'react';
import { runOnUI, runOnJS } from 'react-native-worklets';

export function useUICallback<TArgs extends unknown[], TReturn>(
  worklet: (...args: TArgs) => TReturn,
  onResult?: (result: TReturn) => void
): (...args: TArgs) => void {
  return useCallback(
    (...args: TArgs) => {
      runOnUI((...a: TArgs) => {
        const result = worklet(...a);
        if (onResult) {
          runOnJS(onResult)(result);
        }
      })(...args);
    },
    [worklet, onResult]
  );
}
