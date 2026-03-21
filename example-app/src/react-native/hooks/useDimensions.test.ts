import { renderHook } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { useDimensions } from './useDimensions';

describe('useDimensions', () => {
  test('returns { window, screen } shape', () => {
    const { result } = renderHook(() => useDimensions());
    expect(result.current).toHaveProperty('window');
    expect(result.current).toHaveProperty('screen');
  });

  test('window.width is a positive number', () => {
    const { result } = renderHook(() => useDimensions());
    expect(result.current.window.width).toBeGreaterThan(0);
  });

  test('window.height is a positive number', () => {
    const { result } = renderHook(() => useDimensions());
    expect(result.current.window.height).toBeGreaterThan(0);
  });

  test('screen has the same shape as window', () => {
    const { result } = renderHook(() => useDimensions());
    expect(typeof result.current.screen.width).toBe('number');
    expect(typeof result.current.screen.height).toBe('number');
    expect(typeof result.current.screen.scale).toBe('number');
    expect(typeof result.current.screen.fontScale).toBe('number');
  });

  test('Dimensions.get called with "window" and "screen"', () => {
    const spy = jest.spyOn(Dimensions, 'get');
    renderHook(() => useDimensions());
    expect(spy).toHaveBeenCalledWith('window');
    expect(spy).toHaveBeenCalledWith('screen');
    spy.mockRestore();
  });

  test('returned values match Dimensions.get("window") exactly', () => {
    const { result } = renderHook(() => useDimensions());
    expect(result.current.window).toEqual(Dimensions.get('window'));
  });
});
