import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Worklets from 'react-native-worklets';
import { ShareableDataView } from './ShareableDataView';

describe('ShareableDataView', () => {
  test('renders without crash', () => {
    render(<ShareableDataView />);
  });

  test('renders empty — no items initially', () => {
    render(<ShareableDataView />);
    expect(screen.queryByTestId('item-0')).toBeNull();
  });

  test('all primary testIDs are present', () => {
    render(<ShareableDataView />);
    expect(screen.getByTestId('item-input')).toBeTruthy();
    expect(screen.getByTestId('add-btn')).toBeTruthy();
    expect(screen.getByTestId('share-all-btn')).toBeTruthy();
  });

  test('no last-shared display initially', () => {
    render(<ShareableDataView />);
    expect(screen.queryByTestId('last-shared')).toBeNull();
  });

  test('input updates on changeText', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'hello');
    expect(screen.getByTestId('item-input').props.value).toBe('hello');
  });

  test('adding empty input does nothing', () => {
    render(<ShareableDataView />);
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.queryByTestId('item-0')).toBeNull();
  });

  test('adding an item shows it in the list', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'apple');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('item-0')).toBeTruthy();
    expect(screen.getByTestId('item-value-0')).toHaveTextContent('apple');
  });

  test('added item shows "shared" (isShareableRef always true)', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'apple');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('item-shared-0')).toHaveTextContent('shared');
  });

  test('last-shared updates after each add', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'first');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('last-shared')).toBeTruthy();
  });

  test('multiple items appear in correct order', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'first');
    fireEvent.press(screen.getByTestId('add-btn'));
    fireEvent.changeText(screen.getByTestId('item-input'), 'second');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('item-value-0')).toHaveTextContent('first');
    expect(screen.getByTestId('item-value-1')).toHaveTextContent('second');
  });

  test('makeShareable is called for each added item', () => {
    const spy = jest.spyOn(Worklets, 'makeShareable');
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'x');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('shareAll updates last-shared display', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'item1');
    fireEvent.press(screen.getByTestId('add-btn'));
    fireEvent.press(screen.getByTestId('share-all-btn'));
    expect(screen.getByTestId('last-shared')).toBeTruthy();
  });

  test('input is cleared after add', () => {
    render(<ShareableDataView />);
    fireEvent.changeText(screen.getByTestId('item-input'), 'hello');
    fireEvent.press(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('item-input').props.value).toBe('');
  });
});
