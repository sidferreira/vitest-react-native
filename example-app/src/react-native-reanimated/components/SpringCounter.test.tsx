import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { SpringCounter } from './SpringCounter';

describe('SpringCounter', () => {
  test('displays initialValue on render', () => {
    render(<SpringCounter initialValue={42} />);
    expect(screen.getByTestId('value-display')).toHaveTextContent('42');
  });

  test('spring-btn increases value by step; compounds across presses', () => {
    render(<SpringCounter initialValue={0} step={10} />);
    fireEvent.press(screen.getByTestId('spring-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('10');
    fireEvent.press(screen.getByTestId('spring-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('20');
  });

  test('timing-btn decreases value; can go negative', () => {
    render(<SpringCounter initialValue={5} step={10} />);
    fireEvent.press(screen.getByTestId('timing-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('-5');
  });

  test('custom step prop applies to spring and timing', () => {
    render(<SpringCounter initialValue={0} step={5} />);
    fireEvent.press(screen.getByTestId('spring-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('5');
    fireEvent.press(screen.getByTestId('timing-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('0');
  });

  test('delay-btn increases value by step (withDelay passes through animation)', () => {
    render(<SpringCounter initialValue={0} step={10} />);
    fireEvent.press(screen.getByTestId('delay-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('10');
  });

  test('reset-btn calls cancelAnimation and restores initialValue', () => {
    const spy = jest.spyOn(Reanimated, 'cancelAnimation');
    render(<SpringCounter initialValue={5} step={10} />);
    fireEvent.press(screen.getByTestId('spring-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('15');
    fireEvent.press(screen.getByTestId('reset-btn'));
    expect(screen.getByTestId('value-display')).toHaveTextContent('5');
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('animatedStyle scale = 1 + |value| × 0.01 and updates with counter', () => {
    render(<SpringCounter initialValue={0} step={10} />);
    const view = () => screen.getByTestId('counter-animated-view');

    // Initial: scale = 1 + |0| × 0.01 = 1
    expect(view().props.style.transform).toEqual([{ scale: 1 }]);

    // After spring (+10): scale = 1 + 10 × 0.01 = 1.1
    fireEvent.press(screen.getByTestId('spring-btn'));
    expect(view().props.style.transform).toEqual([{ scale: 1.1 }]);

    // After timing (−10 → back to 0): scale = 1
    fireEvent.press(screen.getByTestId('timing-btn'));
    expect(view().props.style.transform).toEqual([{ scale: 1 }]);

    // Negative values: timing from 0 → -10; |−10| × 0.01 = 0.1, scale = 1.1
    fireEvent.press(screen.getByTestId('timing-btn'));
    expect(view().props.style.transform).toEqual([{ scale: 1.1 }]);

    // Reset restores scale = 1
    fireEvent.press(screen.getByTestId('reset-btn'));
    expect(view().props.style.transform).toEqual([{ scale: 1 }]);
  });

  test('withSpring called with correct target on spring-btn', () => {
    const spy = jest.spyOn(Reanimated, 'withSpring');
    render(<SpringCounter initialValue={0} step={10} />);
    fireEvent.press(screen.getByTestId('spring-btn'));
    expect(spy).toHaveBeenCalledWith(10);
    spy.mockRestore();
  });

  test('withTiming called with correct target on timing-btn', () => {
    const spy = jest.spyOn(Reanimated, 'withTiming');
    render(<SpringCounter initialValue={20} step={10} />);
    fireEvent.press(screen.getByTestId('timing-btn'));
    expect(spy).toHaveBeenCalledWith(10);
    spy.mockRestore();
  });
});
