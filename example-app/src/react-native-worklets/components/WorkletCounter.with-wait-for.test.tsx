import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { WorkletCounter } from './WorkletCounter';

describe('WorkletCounter', () => {
  test('renders without crash', () => {
    render(<WorkletCounter />);
    expect(screen.getByTestId('worklet-counter')).toBeTruthy();
  });

  test('displays default count of 0', () => {
    render(<WorkletCounter />);
    expect(screen.getByTestId('count-display')).toHaveTextContent('0');
  });

  test('displays custom initialCount', () => {
    render(<WorkletCounter initialCount={10} />);
    expect(screen.getByTestId('count-display')).toHaveTextContent('10');
  });

  test('starts with idle status', () => {
    render(<WorkletCounter />);
    expect(screen.getByTestId('status-display')).toHaveTextContent('idle');
  });

  test('all testIDs are present', () => {
    render(<WorkletCounter />);
    expect(screen.getByTestId('count-display')).toBeTruthy();
    expect(screen.getByTestId('status-display')).toBeTruthy();
    expect(screen.getByTestId('increment-btn')).toBeTruthy();
    expect(screen.getByTestId('decrement-btn')).toBeTruthy();
    expect(screen.getByTestId('reset-btn')).toBeTruthy();
  });

  test('increment increases count after flush', async () => {
    render(<WorkletCounter />);
    fireEvent.press(screen.getByTestId('increment-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('1'));
  });

  test('decrement decreases count after flush', async () => {
    render(<WorkletCounter initialCount={5} />);
    fireEvent.press(screen.getByTestId('decrement-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('4'));
  });

  test('count can go below 0', async () => {
    render(<WorkletCounter initialCount={0} />);
    fireEvent.press(screen.getByTestId('decrement-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('-1'));
  });

  test('custom step applies to increment', async () => {
    render(<WorkletCounter step={5} />);
    fireEvent.press(screen.getByTestId('increment-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('5'));
  });

  test('multiple increments compound', async () => {
    render(<WorkletCounter />);
    fireEvent.press(screen.getByTestId('increment-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('1'));
    fireEvent.press(screen.getByTestId('increment-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('2'));
  });

  test('reset restores initialCount after flush', async () => {
    render(<WorkletCounter initialCount={7} />);
    fireEvent.press(screen.getByTestId('increment-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('8'));
    fireEvent.press(screen.getByTestId('reset-btn'));
    await waitFor(() => expect(screen.getByTestId('count-display')).toHaveTextContent('7'));
  });

  test('status transitions: idle → pending → idle on increment', async () => {
    render(<WorkletCounter />);
    expect(screen.getByTestId('status-display')).toHaveTextContent('idle');
    fireEvent.press(screen.getByTestId('increment-btn'));
    expect(screen.getByTestId('status-display')).toHaveTextContent('pending');
    await waitFor(() => expect(screen.getByTestId('status-display')).toHaveTextContent('idle'));
  });
});
