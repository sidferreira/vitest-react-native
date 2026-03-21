import { renderHook, act } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { useAnimatedValue } from './useAnimatedValue';

describe('useAnimatedValue', () => {
  test('initial sharedValue and animatedStyle reflect initialValue', () => {
    const { result } = renderHook(() => useAnimatedValue(0.6));
    expect(result.current.sharedValue.value).toBe(0.6);
    expect(result.current.animatedStyle.opacity).toBe(0.6);
  });

  test('values > 1: sharedValue holds exact number, animatedStyle.opacity clamped to 1', () => {
    const { result } = renderHook(() => useAnimatedValue(2));
    expect(result.current.sharedValue.value).toBe(2);
    expect(result.current.animatedStyle.opacity).toBe(1);
  });

  test('negative values: sharedValue holds exact number, animatedStyle.opacity clamped to 0', () => {
    const { result } = renderHook(() => useAnimatedValue(-1));
    expect(result.current.sharedValue.value).toBe(-1);
    expect(result.current.animatedStyle.opacity).toBe(0);
  });

  test('boundary: initialValue=0 → opacity 0; initialValue=1 → opacity 1', () => {
    const { result: r0 } = renderHook(() => useAnimatedValue(0));
    expect(r0.current.animatedStyle.opacity).toBe(0);
    const { result: r1 } = renderHook(() => useAnimatedValue(1));
    expect(r1.current.animatedStyle.opacity).toBe(1);
  });

  test('set() updates sharedValue exactly and clamps animatedStyle.opacity', () => {
    const { result } = renderHook(() => useAnimatedValue(0));
    act(() => { result.current.set(0.8); });
    expect(result.current.sharedValue.value).toBe(0.8);
    expect(result.current.animatedStyle.opacity).toBe(0.8);

    // Out-of-range value: exact in sharedValue, clamped in style
    act(() => { result.current.set(5); });
    expect(result.current.sharedValue.value).toBe(5);
    expect(result.current.animatedStyle.opacity).toBe(1);
  });

  test('animate() calls withSpring, updates sharedValue exactly, clamps animatedStyle.opacity', () => {
    const spy = jest.spyOn(Reanimated, 'withSpring');
    const { result } = renderHook(() => useAnimatedValue(0));

    act(() => { result.current.animate(0.5); });
    expect(spy).toHaveBeenCalledWith(0.5);
    expect(result.current.sharedValue.value).toBe(0.5);
    expect(result.current.animatedStyle.opacity).toBe(0.5);

    // Out-of-range: sharedValue exact, style clamped
    act(() => { result.current.animate(3); });
    expect(spy).toHaveBeenCalledWith(3);
    expect(result.current.sharedValue.value).toBe(3);
    expect(result.current.animatedStyle.opacity).toBe(1);

    spy.mockRestore();
  });
});
