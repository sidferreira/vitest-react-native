import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { WorkletTaskRunner } from './WorkletTaskRunner';

describe('WorkletTaskRunner', () => {
  test('renders without crash', () => {
    render(<WorkletTaskRunner />);
    expect(screen.getByTestId('run-btn')).toBeTruthy();
  });

  test('no result display initially', () => {
    render(<WorkletTaskRunner />);
    expect(screen.queryByTestId('result-display')).toBeNull();
  });

  test('no loading indicator initially', () => {
    render(<WorkletTaskRunner />);
    expect(screen.queryByTestId('loading-indicator')).toBeNull();
  });

  test('run-btn testID is present', () => {
    render(<WorkletTaskRunner />);
    expect(screen.getByTestId('run-btn')).toBeTruthy();
  });

  test('pressing Run shows loading indicator', () => {
    render(<WorkletTaskRunner />);
    fireEvent.press(screen.getByTestId('run-btn'));
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  test('after timer flush, loading indicator disappears', async () => {
    render(<WorkletTaskRunner />);
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeNull());
  });

  test('after timer flush, result is displayed', async () => {
    render(<WorkletTaskRunner />);
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.getByTestId('result-display')).toBeTruthy());
  });

  test('default compute (×2) with default input (5) → result = 10', async () => {
    render(<WorkletTaskRunner />);
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.getByTestId('result-display')).toHaveTextContent('10'));
  });

  test('custom compute function works', async () => {
    render(<WorkletTaskRunner compute={(n) => n + 100} />);
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.getByTestId('result-display')).toHaveTextContent('105'));
  });

  test('custom initialInput works', async () => {
    render(<WorkletTaskRunner initialInput={3} />);
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.getByTestId('result-display')).toHaveTextContent('6'));
  });

  test('multiple Run presses update the result', async () => {
    render(<WorkletTaskRunner compute={(n) => n * 2} initialInput={1} />);
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.getByTestId('result-display')).toHaveTextContent('2'));
    fireEvent.press(screen.getByTestId('run-btn'));
    await waitFor(() => expect(screen.getByTestId('result-display')).toHaveTextContent('2'));
  });
});
