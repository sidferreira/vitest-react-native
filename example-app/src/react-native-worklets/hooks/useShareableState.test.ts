import { renderHook, act } from '@testing-library/react-native';
import * as Worklets from 'react-native-worklets';
import { useShareableState } from './useShareableState';

describe('useShareableState', () => {
  test('returns a [value, setter] tuple', () => {
    const { result } = renderHook(() => useShareableState(0));
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
  });

  test('initial value equals the provided initial input (identity via mock)', () => {
    const { result } = renderHook(() => useShareableState(42));
    expect(result.current[0]).toBe(42);
  });

  test('makeShareable is called on init', () => {
    const spy = jest.spyOn(Worklets, 'makeShareable');
    renderHook(() => useShareableState('hello'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('setter updates the returned value', () => {
    const { result } = renderHook(() => useShareableState(0));
    act(() => { result.current[1](99); });
    expect(result.current[0]).toBe(99);
  });

  test('makeShareable is called on each setter call', () => {
    const spy = jest.spyOn(Worklets, 'makeShareable');
    spy.mockClear();
    const { result } = renderHook(() => useShareableState(0));
    spy.mockClear(); // ignore init calls
    act(() => { result.current[1](5); });
    expect(spy).toHaveBeenCalledWith(5);
    spy.mockRestore();
  });

  test('works with objects', () => {
    const initial = { name: 'Alice' };
    const { result } = renderHook(() => useShareableState(initial));
    expect(result.current[0]).toBe(initial); // identity via mock
  });

  test('works with arrays', () => {
    const { result } = renderHook(() => useShareableState([1, 2, 3]));
    act(() => { result.current[1]([4, 5, 6]); });
    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  test('works with primitives (string)', () => {
    const { result } = renderHook(() => useShareableState('a'));
    act(() => { result.current[1]('b'); });
    expect(result.current[0]).toBe('b');
  });
});
