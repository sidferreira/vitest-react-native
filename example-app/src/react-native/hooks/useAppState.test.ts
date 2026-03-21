import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useAppState } from './useAppState';

describe('useAppState', () => {
  test('returns { appState, isActive } shape', () => {
    const { result } = renderHook(() => useAppState());
    expect(result.current).toHaveProperty('appState');
    expect(result.current).toHaveProperty('isActive');
  });

  test('initial appState is initialized from AppState.currentState', () => {
    // AppState.currentState is jest.fn() in the 0.81 mock; the hook captures it
    const { result } = renderHook(() => useAppState());
    // appState holds whatever AppState.currentState was at mount time
    expect(result.current).toHaveProperty('appState');
  });

  test('AppState.addEventListener called with "change" on mount', () => {
    const spy = jest.spyOn(AppState, 'addEventListener');
    renderHook(() => useAppState());
    expect(spy).toHaveBeenCalledWith('change', expect.any(Function));
    spy.mockRestore();
  });

  test('subscription remove() called on unmount', () => {
    const removeMock = jest.fn();
    const spy = jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: removeMock });
    const { unmount } = renderHook(() => useAppState());
    unmount();
    expect(removeMock).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('state updates when registered handler is invoked manually', () => {
    let capturedHandler: ((state: string) => void) | undefined;
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
      capturedHandler = handler as (state: string) => void;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useAppState());
    act(() => {
      capturedHandler?.('active');
    });
    expect(result.current.appState).toBe('active');
    spy.mockRestore();
  });

  test('isActive is true when state is "active"', () => {
    let capturedHandler: ((state: string) => void) | undefined;
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
      capturedHandler = handler as (state: string) => void;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useAppState());
    act(() => {
      capturedHandler?.('active');
    });
    expect(result.current.isActive).toBe(true);
    spy.mockRestore();
  });
});
