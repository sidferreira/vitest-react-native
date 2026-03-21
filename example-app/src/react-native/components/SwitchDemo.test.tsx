import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SwitchDemo } from './SwitchDemo';

describe('SwitchDemo', () => {
  test('renders without crashing', () => {
    render(<SwitchDemo />);
    expect(screen.getByTestId('switch-control')).toBeTruthy();
  });

  test('initial state is OFF by default', () => {
    render(<SwitchDemo />);
    expect(screen.getByTestId('switch-label')).toHaveTextContent('OFF');
  });

  test('initialValue=true shows ON', () => {
    render(<SwitchDemo initialValue={true} />);
    expect(screen.getByTestId('switch-label')).toHaveTextContent('ON');
  });

  test('toggling fires onToggle callback', () => {
    const onToggle = jest.fn();
    render(<SwitchDemo onToggle={onToggle} />);
    fireEvent(screen.getByTestId('switch-control'), 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  test('toggling OFF→ON updates label to ON', () => {
    render(<SwitchDemo />);
    fireEvent(screen.getByTestId('switch-control'), 'valueChange', true);
    expect(screen.getByTestId('switch-label')).toHaveTextContent('ON');
  });

  test('toggling ON→OFF updates label to OFF', () => {
    render(<SwitchDemo initialValue={true} />);
    fireEvent(screen.getByTestId('switch-control'), 'valueChange', false);
    expect(screen.getByTestId('switch-label')).toHaveTextContent('OFF');
  });
});
