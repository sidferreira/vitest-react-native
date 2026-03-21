import { useState } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { useDerivedCounter } from './useDerivedCounter';

describe('useDerivedCounter', () => {
  test('computes sum and product from initial values', () => {
    const { result } = renderHook(() => {
      const a = Reanimated.useSharedValue(3);
      const b = Reanimated.useSharedValue(4);
      return useDerivedCounter(a, b);
    });
    expect(result.current.sum.value).toBe(7);
    expect(result.current.product.value).toBe(12);
  });

  test('derived values expose .get() mirroring .value', () => {
    const { result } = renderHook(() => {
      const a = Reanimated.useSharedValue(3);
      const b = Reanimated.useSharedValue(4);
      return useDerivedCounter(a, b);
    });
    expect(result.current.sum.get()).toBe(7);
    expect(result.current.product.get()).toBe(12);
  });

  test('works with zero and negative values', () => {
    const { result } = renderHook(() => {
      const a = Reanimated.useSharedValue(-2);
      const b = Reanimated.useSharedValue(5);
      return useDerivedCounter(a, b);
    });
    expect(result.current.sum.value).toBe(3);
    expect(result.current.product.value).toBe(-10);
  });

  test('useDerivedValue is called exactly twice (sum and product)', () => {
    const spy = jest.spyOn(Reanimated, 'useDerivedValue');
    renderHook(() => {
      const a = Reanimated.useSharedValue(1);
      const b = Reanimated.useSharedValue(2);
      return useDerivedCounter(a, b);
    });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  test('re-render with mutated shared values recomputes sum and product', () => {
    const { result, rerender } = renderHook(() => {
      const [a] = useState(() => Reanimated.useSharedValue(2));
      const [b] = useState(() => Reanimated.useSharedValue(3));
      return { a, b, ...useDerivedCounter(a, b) };
    });

    expect(result.current.sum.value).toBe(5);
    expect(result.current.product.value).toBe(6);

    act(() => {
      result.current.a.value = 10;
      result.current.b.value = 5;
    });
    rerender({});

    expect(result.current.sum.value).toBe(15);
    expect(result.current.product.value).toBe(50);
  });
});
