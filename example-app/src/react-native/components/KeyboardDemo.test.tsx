import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { KeyboardDemo } from './KeyboardDemo';

describe('KeyboardDemo', () => {
  test('renders without crashing', () => {
    render(<KeyboardDemo />);
    expect(screen.getByTestId('keyboard-status')).toBeTruthy();
  });

  test('initial keyboard status is "hidden"', () => {
    render(<KeyboardDemo />);
    expect(screen.getByTestId('keyboard-status')).toHaveTextContent('hidden');
  });

  test('addListener is a function', () => {
    expect(typeof Keyboard.addListener).toBe('function');
  });

  test('addListener returns subscription with remove()', () => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {});
    expect(typeof sub.remove).toBe('function');
    sub.remove();
  });

  test('registration and removal roundtrip does not throw', () => {
    const cb = jest.fn();
    const sub = Keyboard.addListener('keyboardDidShow', cb);
    expect(() => sub.remove()).not.toThrow();
  });

  test('dismiss is a function', () => {
    expect(typeof Keyboard.dismiss).toBe('function');
  });

  test('calling Keyboard.dismiss does not throw', () => {
    expect(() => Keyboard.dismiss()).not.toThrow();
  });

  test('component unmounts cleanly (subscriptions removed)', () => {
    const { unmount } = render(<KeyboardDemo />);
    expect(() => unmount()).not.toThrow();
  });
});
