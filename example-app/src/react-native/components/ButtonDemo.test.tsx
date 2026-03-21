import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ButtonDemo } from './ButtonDemo';

describe('ButtonDemo', () => {
  test('renders without crashing', () => {
    render(<ButtonDemo />);
    expect(screen.getByTestId('demo-button')).toBeTruthy();
  });

  test('initial status is "idle"', () => {
    render(<ButtonDemo />);
    expect(screen.getByTestId('press-status')).toHaveTextContent('idle');
  });

  test('renders custom title', () => {
    render(<ButtonDemo title="Click here" />);
    expect(screen.getByText('Click here')).toBeTruthy();
  });

  test('pressing button fires onPress callback', () => {
    const onPress = jest.fn();
    render(<ButtonDemo onPress={onPress} />);
    fireEvent.press(screen.getByTestId('demo-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('status becomes "pressed" after press', () => {
    render(<ButtonDemo />);
    fireEvent.press(screen.getByTestId('demo-button'));
    expect(screen.getByTestId('press-status')).toHaveTextContent('pressed');
  });

  test('onPress called only once per press', () => {
    const onPress = jest.fn();
    render(<ButtonDemo onPress={onPress} />);
    fireEvent.press(screen.getByTestId('demo-button'));
    fireEvent.press(screen.getByTestId('demo-button'));
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
