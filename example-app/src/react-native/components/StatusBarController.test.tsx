import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StatusBar } from 'react-native';
import { StatusBarController } from './StatusBarController';

describe('StatusBarController', () => {
  test('renders without crash; all testIDs present', () => {
    render(<StatusBarController />);
    expect(screen.getByTestId('current-style')).toBeTruthy();
    expect(screen.getByTestId('current-color')).toBeTruthy();
    expect(screen.getByTestId('visibility-display')).toBeTruthy();
    expect(screen.getByTestId('set-light-btn')).toBeTruthy();
    expect(screen.getByTestId('set-dark-btn')).toBeTruthy();
    expect(screen.getByTestId('set-red-btn')).toBeTruthy();
    expect(screen.getByTestId('set-blue-btn')).toBeTruthy();
    expect(screen.getByTestId('toggle-visible-btn')).toBeTruthy();
  });

  test('initial style is "default"', () => {
    render(<StatusBarController />);
    expect(screen.getByTestId('current-style')).toHaveTextContent('default');
  });

  test('set-light-btn calls StatusBar.setBarStyle("light-content")', () => {
    const spy = jest.spyOn(StatusBar, 'setBarStyle');
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('set-light-btn'));
    expect(spy).toHaveBeenCalledWith('light-content');
    spy.mockRestore();
  });

  test('current-style updates to "light-content" after set-light-btn press', () => {
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('set-light-btn'));
    expect(screen.getByTestId('current-style')).toHaveTextContent('light-content');
  });

  test('set-dark-btn calls StatusBar.setBarStyle("dark-content")', () => {
    const spy = jest.spyOn(StatusBar, 'setBarStyle');
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('set-dark-btn'));
    expect(spy).toHaveBeenCalledWith('dark-content');
    spy.mockRestore();
  });

  test('current-style updates to "dark-content" after set-dark-btn press', () => {
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('set-dark-btn'));
    expect(screen.getByTestId('current-style')).toHaveTextContent('dark-content');
  });

  test('set-red-btn calls StatusBar.setBackgroundColor("#FF0000")', () => {
    const spy = jest.spyOn(StatusBar, 'setBackgroundColor');
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('set-red-btn'));
    expect(spy).toHaveBeenCalledWith('#FF0000');
    spy.mockRestore();
  });

  test('current-color updates to "#FF0000" after set-red-btn press', () => {
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('set-red-btn'));
    expect(screen.getByTestId('current-color')).toHaveTextContent('#FF0000');
  });

  test('initial visibility is "visible"; first toggle → "hidden" and calls setHidden(true)', () => {
    const spy = jest.spyOn(StatusBar, 'setHidden');
    render(<StatusBarController />);
    expect(screen.getByTestId('visibility-display')).toHaveTextContent('visible');
    fireEvent.press(screen.getByTestId('toggle-visible-btn'));
    expect(screen.getByTestId('visibility-display')).toHaveTextContent('hidden');
    expect(spy).toHaveBeenCalledWith(true);
    spy.mockRestore();
  });

  test('second toggle press → "visible" and calls setHidden(false)', () => {
    const spy = jest.spyOn(StatusBar, 'setHidden');
    render(<StatusBarController />);
    fireEvent.press(screen.getByTestId('toggle-visible-btn'));
    fireEvent.press(screen.getByTestId('toggle-visible-btn'));
    expect(screen.getByTestId('visibility-display')).toHaveTextContent('visible');
    expect(spy).toHaveBeenLastCalledWith(false);
    spy.mockRestore();
  });
});
