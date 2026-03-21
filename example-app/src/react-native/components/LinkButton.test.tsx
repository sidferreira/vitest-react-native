import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  afterEach(() => {
    jest.mocked(Linking.canOpenURL).mockClear();
    jest.mocked(Linking.openURL).mockClear();
  });

  test('renders label', () => {
    render(<LinkButton url="https://example.com" label="Visit Site" />);
    expect(screen.getByText('Visit Site')).toBeTruthy();
  });

  test('initial status is "ready"', () => {
    render(<LinkButton url="https://example.com" />);
    expect(screen.getByTestId('link-status')).toHaveTextContent('ready');
  });

  test('press calls Linking.canOpenURL with the url', async () => {
    const spy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    render(<LinkButton url="https://example.com" />);
    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); });
    expect(spy).toHaveBeenCalledWith('https://example.com');
    spy.mockRestore();
  });

  test('when canOpenURL resolves true, calls Linking.openURL', async () => {
    const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<LinkButton url="https://example.com" />);
    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(openSpy).toHaveBeenCalledWith('https://example.com');
    canOpenSpy.mockRestore();
    openSpy.mockRestore();
  });

  test('status becomes "opened" after successful open', async () => {
    const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<LinkButton url="https://example.com" />);
    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId('link-status')).toHaveTextContent('opened');
    canOpenSpy.mockRestore();
    openSpy.mockRestore();
  });

  test('when canOpenURL resolves false, status becomes "unavailable"', async () => {
    const spy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    render(<LinkButton url="myapp://deep-link" />);
    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId('link-status')).toHaveTextContent('unavailable');
    spy.mockRestore();
  });

  test('openURL NOT called when canOpenURL is false', async () => {
    const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<LinkButton url="myapp://deep-link" />);
    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(openSpy).not.toHaveBeenCalled();
    canOpenSpy.mockRestore();
    openSpy.mockRestore();
  });

  test('re-pressing after "opened" re-runs the flow', async () => {
    const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<LinkButton url="https://example.com" />);

    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId('link-status')).toHaveTextContent('opened');

    fireEvent.press(screen.getByTestId('link-btn'));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(canOpenSpy).toHaveBeenCalledTimes(2);

    canOpenSpy.mockRestore();
    openSpy.mockRestore();
  });
});
