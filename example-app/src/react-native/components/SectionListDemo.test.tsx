import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SectionListDemo } from './SectionListDemo';

describe('SectionListDemo', () => {
  test('renders without crashing', () => {
    render(<SectionListDemo />);
    expect(screen.getByTestId('section-list')).toBeTruthy();
  });

  test('renders section headers', () => {
    render(<SectionListDemo />);
    expect(screen.getByTestId('header-Fruits')).toBeTruthy();
    expect(screen.getByTestId('header-Veggies')).toBeTruthy();
  });

  test('renders header titles', () => {
    render(<SectionListDemo />);
    expect(screen.getByTestId('header-title-Fruits')).toHaveTextContent('Fruits');
    expect(screen.getByTestId('header-title-Veggies')).toHaveTextContent('Veggies');
  });

  test('renders row items', () => {
    render(<SectionListDemo />);
    expect(screen.getByTestId('row-Apple')).toBeTruthy();
    expect(screen.getByTestId('row-Banana')).toBeTruthy();
    expect(screen.getByTestId('row-Carrot')).toBeTruthy();
    expect(screen.getByTestId('row-Daikon')).toBeTruthy();
  });

  test('renders custom sections prop', () => {
    const sections = [
      { title: 'Colors', data: ['Red', 'Blue'] },
    ];
    render(<SectionListDemo sections={sections} />);
    expect(screen.getByTestId('header-title-Colors')).toHaveTextContent('Colors');
    expect(screen.getByTestId('row-Red')).toBeTruthy();
    expect(screen.getByTestId('row-Blue')).toBeTruthy();
  });
});
