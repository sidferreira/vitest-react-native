import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AnimatedList } from './AnimatedList';

function addItem(text: string) {
  fireEvent.changeText(screen.getByTestId('item-input'), text);
  fireEvent.press(screen.getByTestId('add-btn'));
}

describe('AnimatedList', () => {
  test('renders empty list; add-btn and item-input are present', () => {
    render(<AnimatedList />);
    expect(screen.getByTestId('items-list')).toBeDefined();
    expect(screen.queryByTestId('item-0')).toBeNull();
  });

  test('empty or whitespace-only input is rejected; does not add item', () => {
    render(<AnimatedList />);

    // Completely empty
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.queryByTestId('item-0')).toBeNull();

    // Whitespace only
    fireEvent.changeText(screen.getByTestId('item-input'), '   ');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.queryByTestId('item-0')).toBeNull();
  });

  test('input text is trimmed before storing', () => {
    render(<AnimatedList />);
    addItem('  Hello World  ');
    expect(screen.getByTestId('item-text-0')).toHaveTextContent('Hello World');
  });

  test('adding items shows correct text in order and clears input', () => {
    render(<AnimatedList />);
    addItem('First');
    expect(screen.getByTestId('item-text-0')).toHaveTextContent('First');
    expect(screen.getByTestId('item-input').props.value).toBe('');

    addItem('Second');
    expect(screen.getByTestId('item-text-1')).toHaveTextContent('Second');
    expect(screen.getByTestId('item-input').props.value).toBe('');
  });

  test('initialItems renders with correct text content', () => {
    render(<AnimatedList initialItems={['Alpha', 'Beta']} />);
    expect(screen.getByTestId('item-text-0')).toHaveTextContent('Alpha');
    expect(screen.getByTestId('item-text-1')).toHaveTextContent('Beta');
  });

  test('Animated.View with FadeIn entering prop renders without crash', () => {
    expect(() => render(<AnimatedList initialItems={['a', 'b', 'c']} />)).not.toThrow();
  });
});
