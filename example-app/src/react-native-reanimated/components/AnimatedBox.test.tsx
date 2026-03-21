import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { AnimatedBox } from './AnimatedBox';

describe('AnimatedBox', () => {
  test('renders with correct initial display values and animatedStyle', () => {
    render(<AnimatedBox initialOpacity={0.5} initialTranslateY={100} />);

    // Display text reflects props
    expect(screen.getByTestId('opacity-display')).toHaveTextContent('0.5');
    expect(screen.getByTestId('translate-display')).toHaveTextContent('100');

    // Animated.View style is wired to the same values
    const box = screen.getByTestId('animated-box');
    expect(box.props.style).toMatchObject({ opacity: 0.5 });
    expect(box.props.style.transform).toEqual([{ translateY: 100 }]);
  });

  test('fade-out → opacity 0 in both display and animatedStyle; fade-in → back to 1', () => {
    render(<AnimatedBox initialOpacity={1} />);
    const box = () => screen.getByTestId('animated-box');

    fireEvent.press(screen.getByTestId('fade-out-btn'));
    expect(screen.getByTestId('opacity-display')).toHaveTextContent('0');
    expect(box().props.style).toMatchObject({ opacity: 0 });

    fireEvent.press(screen.getByTestId('fade-in-btn'));
    expect(screen.getByTestId('opacity-display')).toHaveTextContent('1');
    expect(box().props.style).toMatchObject({ opacity: 1 });
  });

  test('move-up → translateY -50 in both display and animatedStyle; reset → 0', () => {
    render(<AnimatedBox initialTranslateY={0} />);
    const box = () => screen.getByTestId('animated-box');

    fireEvent.press(screen.getByTestId('move-up-btn'));
    expect(screen.getByTestId('translate-display')).toHaveTextContent('-50');
    expect(box().props.style.transform).toEqual([{ translateY: -50 }]);

    fireEvent.press(screen.getByTestId('move-reset-btn'));
    expect(screen.getByTestId('translate-display')).toHaveTextContent('0');
    expect(box().props.style.transform).toEqual([{ translateY: 0 }]);
  });

  test('withTiming called with correct target for fade-out (0) and fade-in (1)', () => {
    const spy = jest.spyOn(Reanimated, 'withTiming');
    render(<AnimatedBox />);
    fireEvent.press(screen.getByTestId('fade-out-btn'));
    expect(spy).toHaveBeenCalledWith(0);
    fireEvent.press(screen.getByTestId('fade-in-btn'));
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  test('withSpring called with -50 when move-up pressed', () => {
    const spy = jest.spyOn(Reanimated, 'withSpring');
    render(<AnimatedBox />);
    fireEvent.press(screen.getByTestId('move-up-btn'));
    expect(spy).toHaveBeenCalledWith(-50);
    spy.mockRestore();
  });

  test('move-reset uses direct assignment (no animation function called)', () => {
    const timingSpy = jest.spyOn(Reanimated, 'withTiming');
    const springSpy = jest.spyOn(Reanimated, 'withSpring');
    render(<AnimatedBox initialTranslateY={0} />);
    fireEvent.press(screen.getByTestId('move-up-btn'));
    timingSpy.mockClear();
    springSpy.mockClear();

    fireEvent.press(screen.getByTestId('move-reset-btn'));
    // Reset is a direct assignment — no animation wrapper
    expect(timingSpy).not.toHaveBeenCalled();
    expect(springSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('translate-display')).toHaveTextContent('0');
    timingSpy.mockRestore();
    springSpy.mockRestore();
  });
});
