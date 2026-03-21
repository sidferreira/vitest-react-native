import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { NotFound } from './NotFound'

jest.mock('@react-navigation/elements', () => {
  const React = require('react')
  const { Text: RNText, Pressable } = require('react-native')
  return {
    Text: ({ children, style }: any) => React.createElement(RNText, { style }, children),
    Button: ({ children }: any) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button' },
        React.createElement(RNText, null, children)
      ),
  }
})

describe('NotFound', () => {
  it('renders 404 text', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeTruthy()
  })

  it('renders a navigation button', () => {
    render(<NotFound />)
    expect(screen.getByRole('button')).toBeTruthy()
  })
})
