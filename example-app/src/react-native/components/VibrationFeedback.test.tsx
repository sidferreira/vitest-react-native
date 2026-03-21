import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Vibration } from 'react-native';
import { VibrationFeedback } from './VibrationFeedback';

describe('VibrationFeedback', () => {
  afterEach(() => {
    jest.mocked(Vibration.vibrate).mockClear();
    jest.mocked(Vibration.cancel).mockClear();
  });

  test('renders; initial status is "idle"', () => {
    render(<VibrationFeedback />);
    expect(screen.getByTestId('status-display')).toHaveTextContent('idle');
  });

  test('vibrate press calls Vibration.vibrate', () => {
    const spy = jest.spyOn(Vibration, 'vibrate');
    render(<VibrationFeedback />);
    fireEvent.press(screen.getByTestId('vibrate-btn'));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('status becomes "vibrating" after vibrate press', () => {
    render(<VibrationFeedback />);
    fireEvent.press(screen.getByTestId('vibrate-btn'));
    expect(screen.getByTestId('status-display')).toHaveTextContent('vibrating');
  });

  test('cancel press calls Vibration.cancel', () => {
    const spy = jest.spyOn(Vibration, 'cancel');
    render(<VibrationFeedback />);
    fireEvent.press(screen.getByTestId('cancel-btn'));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('status becomes "cancelled" after cancel press', () => {
    render(<VibrationFeedback />);
    fireEvent.press(screen.getByTestId('cancel-btn'));
    expect(screen.getByTestId('status-display')).toHaveTextContent('cancelled');
  });

  test('default pattern [0, 100, 100, 100] passed to Vibration.vibrate', () => {
    const spy = jest.spyOn(Vibration, 'vibrate');
    render(<VibrationFeedback />);
    fireEvent.press(screen.getByTestId('vibrate-btn'));
    expect(spy).toHaveBeenCalledWith([0, 100, 100, 100]);
    spy.mockRestore();
  });

  test('custom pattern prop passed to Vibration.vibrate', () => {
    const spy = jest.spyOn(Vibration, 'vibrate');
    render(<VibrationFeedback pattern={[0, 200, 50, 200]} />);
    fireEvent.press(screen.getByTestId('vibrate-btn'));
    expect(spy).toHaveBeenCalledWith([0, 200, 50, 200]);
    spy.mockRestore();
  });

  test('cancel after vibrate changes status from "vibrating" to "cancelled"', () => {
    render(<VibrationFeedback />);
    fireEvent.press(screen.getByTestId('vibrate-btn'));
    expect(screen.getByTestId('status-display')).toHaveTextContent('vibrating');
    fireEvent.press(screen.getByTestId('cancel-btn'));
    expect(screen.getByTestId('status-display')).toHaveTextContent('cancelled');
  });
});
