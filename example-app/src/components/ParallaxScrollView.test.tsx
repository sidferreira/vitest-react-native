import React from 'react'
import { View, Text } from 'react-native'
import { render, screen } from '@testing-library/react-native'
import ParallaxScrollView from './ParallaxScrollView'

jest.mock('@/components/ui/TabBarBackground', () => ({
  default: undefined,
  useBottomTabOverflow: () => 0,
}))

describe('ParallaxScrollView', () => {
  const defaultProps = {
    headerImage: <View testID="header-img" />,
    headerBackgroundColor: { light: '#f0f0f0', dark: '#222' },
  }

  it('renders the header image', () => {
    render(
      <ParallaxScrollView {...defaultProps}>
        <Text>child content</Text>
      </ParallaxScrollView>
    )
    expect(screen.getByTestId('header-img')).toBeTruthy()
  })

  it('renders children content', () => {
    render(
      <ParallaxScrollView {...defaultProps}>
        <Text>child content</Text>
      </ParallaxScrollView>
    )
    expect(screen.getByText('child content')).toBeTruthy()
  })
})
