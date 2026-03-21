import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { IconSymbol } from './IconSymbol'


describe('IconSymbol', () => {
  it('renders without crash', () => {
    render(<IconSymbol name="star" size={24} color="#000" />)
    expect(screen.toJSON()).toBeTruthy()
  })

  it('sets accessibilityLabel to name prop', () => {
    render(<IconSymbol name="heart" size={24} color="#000" />)
    expect(screen.getByLabelText('heart')).toBeTruthy()
  })

  it('applies size as width/height style', () => {
    render(<IconSymbol name="star" size={24} color="#000" />)
    expect(screen.getByLabelText('star')).toHaveStyle({ width: 24, height: 24 })
  })
})
