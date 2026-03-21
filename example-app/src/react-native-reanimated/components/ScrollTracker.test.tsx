import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { ScrollTracker } from './ScrollTracker';

describe('ScrollTracker', () => {
  test('renders scroll-view, parallax-header, and offset-display (offset=0)', () => {
    render(<ScrollTracker />);
    expect(screen.getByTestId('scroll-view')).toBeDefined();
    expect(screen.getByTestId('parallax-header')).toBeDefined();
    expect(screen.getByTestId('offset-display')).toHaveTextContent('0');
  });

  test('ScrollView renders its children', () => {
    render(<ScrollTracker />);
    expect(screen.getByText('Content')).toBeDefined();
  });

  test('useScrollViewOffset is called with the animated ref (a { current } object)', () => {
    const spy = jest.spyOn(Reanimated, 'useScrollViewOffset');
    render(<ScrollTracker />);
    expect(spy).toHaveBeenCalledTimes(1);
    // Verify a ref object (not a primitive) was passed
    const [refArg] = spy.mock.calls[0];
    expect(refArg).toHaveProperty('current');
    spy.mockRestore();
  });

  test('parallax-header style has transform driven by scroll offset (offset=0 → translateY=0)', () => {
    render(<ScrollTracker />);
    const header = screen.getByTestId('parallax-header');
    expect(header.props.style).toMatchObject({
      transform: [{ translateY: -0 }],
    });
  });
});
