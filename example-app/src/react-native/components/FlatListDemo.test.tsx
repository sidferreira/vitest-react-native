import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FlatListDemo } from './FlatListDemo';

describe('FlatListDemo', () => {
  test('renders without crashing', () => {
    render(<FlatListDemo />);
    expect(screen.getByTestId('flat-list')).toBeTruthy();
  });

  test('renders all default items', () => {
    render(<FlatListDemo />);
    expect(screen.getByTestId('item-1')).toBeTruthy();
    expect(screen.getByTestId('item-2')).toBeTruthy();
    expect(screen.getByTestId('item-3')).toBeTruthy();
  });

  test('renders item labels', () => {
    render(<FlatListDemo />);
    expect(screen.getByTestId('label-1')).toHaveTextContent('Alpha');
    expect(screen.getByTestId('label-2')).toHaveTextContent('Beta');
    expect(screen.getByTestId('label-3')).toHaveTextContent('Gamma');
  });

  test('renders custom items prop', () => {
    const items = [
      { id: 'a', label: 'One' },
      { id: 'b', label: 'Two' },
    ];
    render(<FlatListDemo items={items} />);
    expect(screen.getByTestId('label-a')).toHaveTextContent('One');
    expect(screen.getByTestId('label-b')).toHaveTextContent('Two');
  });

  test('renders correct number of items', () => {
    const items = [
      { id: 'x', label: 'X' },
      { id: 'y', label: 'Y' },
    ];
    render(<FlatListDemo items={items} />);
    expect(screen.getAllByTestId(/^item-/).length).toBe(2);
  });
});
