import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FormField } from './FormField';

describe('FormField', () => {
  test('renders without crash; label visible', () => {
    render(<FormField label="Name" />);
    expect(screen.getByTestId('field-label')).toHaveTextContent('Name');
  });

  test('default input is empty', () => {
    render(<FormField />);
    expect(screen.getByTestId('field-input').props.value).toBe('');
  });

  test('changeText updates input value', () => {
    render(<FormField />);
    fireEvent.changeText(screen.getByTestId('field-input'), 'hello');
    expect(screen.getByTestId('field-input').props.value).toBe('hello');
  });

  test('submit with empty input shows error-msg', () => {
    render(<FormField />);
    fireEvent.press(screen.getByTestId('submit-btn'));
    expect(screen.getByTestId('error-msg')).toBeTruthy();
  });

  test('error-msg absent before submit', () => {
    render(<FormField />);
    expect(screen.queryByTestId('error-msg')).toBeNull();
  });

  test('submit calls onSubmit with trimmed value', () => {
    const onSubmit = jest.fn();
    render(<FormField onSubmit={onSubmit} />);
    fireEvent.changeText(screen.getByTestId('field-input'), 'hello');
    fireEvent.press(screen.getByTestId('submit-btn'));
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });

  test('whitespace-only input shows error', () => {
    render(<FormField />);
    fireEvent.changeText(screen.getByTestId('field-input'), '   ');
    fireEvent.press(screen.getByTestId('submit-btn'));
    expect(screen.getByTestId('error-msg')).toBeTruthy();
  });

  test('clear resets input to empty string', () => {
    render(<FormField />);
    fireEvent.changeText(screen.getByTestId('field-input'), 'some text');
    fireEvent.press(screen.getByTestId('clear-btn'));
    expect(screen.getByTestId('field-input').props.value).toBe('');
  });

  test('clear removes error-msg', () => {
    render(<FormField />);
    fireEvent.press(screen.getByTestId('submit-btn')); // trigger error
    fireEvent.press(screen.getByTestId('clear-btn'));
    expect(screen.queryByTestId('error-msg')).toBeNull();
  });

  test('after successful submit, input is cleared', () => {
    render(<FormField onSubmit={() => {}} />);
    fireEvent.changeText(screen.getByTestId('field-input'), 'hello');
    fireEvent.press(screen.getByTestId('submit-btn'));
    expect(screen.getByTestId('field-input').props.value).toBe('');
  });

  test('onSubmit not called when input is empty', () => {
    const onSubmit = jest.fn();
    render(<FormField onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('submit-btn'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submitting "  hello  " calls onSubmit("hello")', () => {
    const onSubmit = jest.fn();
    render(<FormField onSubmit={onSubmit} />);
    fireEvent.changeText(screen.getByTestId('field-input'), '  hello  ');
    fireEvent.press(screen.getByTestId('submit-btn'));
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });
});
