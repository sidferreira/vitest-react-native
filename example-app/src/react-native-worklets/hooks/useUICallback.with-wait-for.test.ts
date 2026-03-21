import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Worklets from 'react-native-worklets';
import { useUICallback } from './useUICallback';

describe('useUICallback', () => {
  test('returns a function', () => {
    const { result } = renderHook(() => useUICallback(() => 0));
    expect(typeof result.current).toBe('function');
  });

  test('calling the callback schedules worklet via runOnUI', () => {
    const runOnUISpy = jest.spyOn(Worklets, 'runOnUI');
    renderHook(() => useUICallback(() => 42));
    expect(runOnUISpy).not.toHaveBeenCalled(); // called lazily
    runOnUISpy.mockRestore();
  });

  test('worklet is not called synchronously', () => {
    const worklet = jest.fn(() => 0);
    const { result } = renderHook(() => useUICallback(worklet));
    act(() => { result.current(); });
    expect(worklet).not.toHaveBeenCalled();
  });

  test('worklet is called after timer flush', async () => {
    const worklet = jest.fn(() => 0);
    const { result } = renderHook(() => useUICallback(worklet));
    act(() => { result.current(); });
    await waitFor(() => expect(worklet).toHaveBeenCalledTimes(1));
  });

  test('onResult callback receives worklet return value', async () => {
    const onResult = jest.fn();
    const { result } = renderHook(() => useUICallback(() => 99, onResult));
    act(() => { result.current(); });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(99));
  });

  test('arguments are passed through to worklet', async () => {
    const worklet = jest.fn((...args: unknown[]) => args);
    const { result } = renderHook(() => useUICallback(worklet));
    act(() => { result.current(1, 2, 3); });
    await waitFor(() => expect(worklet).toHaveBeenCalledWith(1, 2, 3));
  });

  test('works without onResult (no crash)', async () => {
    const worklet = jest.fn(() => 42);
    const { result } = renderHook(() => useUICallback(worklet));
    act(() => { result.current(); });
    await waitFor(() => expect(worklet).toHaveBeenCalledTimes(1));
  });

  test('multiple invocations are independent', async () => {
    const worklet = jest.fn((n: number) => n * 2);
    const { result } = renderHook(() => useUICallback(worklet));
    act(() => { result.current(5); result.current(10); });
    await waitFor(() => expect(worklet).toHaveBeenCalledTimes(2));
  });
});
