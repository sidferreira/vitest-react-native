import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AppInfo } from './AppInfo';

describe('AppInfo', () => {
  test('renders without crash', () => {
    render(<AppInfo />);
  });

  test('platform-os shows "ios"', () => {
    render(<AppInfo />);
    expect(screen.getByTestId('platform-os')).toHaveTextContent('ios');
  });

  test('platform-version shows a non-empty string', () => {
    render(<AppInfo />);
    const text = screen.getByTestId('platform-version').props.children;
    expect(String(text).length).toBeGreaterThan(0);
  });

  test('platform-vendor shows "Apple" (ios branch)', () => {
    render(<AppInfo />);
    expect(screen.getByTestId('platform-vendor')).toHaveTextContent('Apple');
  });

  test('window-width shows a positive number', () => {
    render(<AppInfo />);
    const text = screen.getByTestId('window-width').props.children;
    expect(Number(text)).toBeGreaterThan(0);
  });

  test('window-height shows a positive number', () => {
    render(<AppInfo />);
    const text = screen.getByTestId('window-height').props.children;
    expect(Number(text)).toBeGreaterThan(0);
  });

  test('all testIDs are present', () => {
    render(<AppInfo />);
    expect(screen.getByTestId('platform-os')).toBeTruthy();
    expect(screen.getByTestId('platform-version')).toBeTruthy();
    expect(screen.getByTestId('platform-vendor')).toBeTruthy();
    expect(screen.getByTestId('window-width')).toBeTruthy();
    expect(screen.getByTestId('window-height')).toBeTruthy();
  });
});
