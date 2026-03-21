import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaViewDemo } from './SafeAreaViewDemo';

describe('SafeAreaViewDemo', () => {
  test('renders without crashing', () => {
    render(<SafeAreaViewDemo />);
    expect(screen.getByTestId('safe-area')).toBeTruthy();
  });

  test('renders default content when no children', () => {
    render(<SafeAreaViewDemo />);
    expect(screen.getByTestId('default-content')).toHaveTextContent('Safe content');
  });

  test('renders custom children', () => {
    render(
      <SafeAreaViewDemo>
        <Text testID="custom-child">Hello inside safe area</Text>
      </SafeAreaViewDemo>
    );
    expect(screen.getByTestId('custom-child')).toHaveTextContent('Hello inside safe area');
  });

  test('default content is absent when children are provided', () => {
    render(
      <SafeAreaViewDemo>
        <Text testID="custom-child">Custom</Text>
      </SafeAreaViewDemo>
    );
    expect(screen.queryByTestId('default-content')).toBeNull();
  });
});
