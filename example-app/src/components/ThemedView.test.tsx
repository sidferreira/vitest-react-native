import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { ThemedView } from './ThemedView'

describe('ThemedView', () => {
  it('renders without crash', () => {
    render(<ThemedView />)
    expect(screen.toJSON()).toBeTruthy()
  })

  it('passes testID through', () => {
    render(<ThemedView testID="my-view" />)
    expect(screen.getByTestId('my-view')).toBeTruthy()
  })

  it('renders children', () => {
    render(
      <ThemedView>
        <Text>child</Text>
      </ThemedView>
    )
    expect(screen.getByText('child')).toBeTruthy()
  })

  it('applies light background color', () => {
    render(<ThemedView testID="themed" />)
    expect(screen.getByTestId('themed')).toHaveStyle({ backgroundColor: '#fff' })
  })
})
