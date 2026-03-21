import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Worklets from 'react-native-worklets';
import { RuntimeKindBadge } from './RuntimeKindBadge';

describe('RuntimeKindBadge', () => {
  test('renders without crash', () => {
    render(<RuntimeKindBadge />);
    expect(screen.getByTestId('runtime-badge')).toBeTruthy();
  });

  test('all testIDs are present', () => {
    render(<RuntimeKindBadge />);
    expect(screen.getByTestId('runtime-badge')).toBeTruthy();
    expect(screen.getByTestId('runtime-label')).toBeTruthy();
    expect(screen.getByTestId('runtime-value')).toBeTruthy();
  });

  test('shows "React Native" label in test env', () => {
    render(<RuntimeKindBadge />);
    expect(screen.getByTestId('runtime-label')).toHaveTextContent('React Native');
  });

  test('shows numeric value "1" (ReactNative)', () => {
    render(<RuntimeKindBadge />);
    expect(screen.getByTestId('runtime-value')).toHaveTextContent('1');
  });

  test('getRuntimeKind is called once per render', () => {
    const spy = jest.spyOn(Worklets, 'getRuntimeKind');
    render(<RuntimeKindBadge />);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('RuntimeKind.ReactNative is 1', () => {
    expect(Worklets.RuntimeKind.ReactNative).toBe(1);
  });

  test('RuntimeKind.UI is 2', () => {
    expect(Worklets.RuntimeKind.UI).toBe(2);
  });

  test('RuntimeKind.Worker is 3', () => {
    expect(Worklets.RuntimeKind.Worker).toBe(3);
  });
});
