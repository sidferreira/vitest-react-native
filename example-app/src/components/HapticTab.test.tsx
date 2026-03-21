import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { HapticTab } from './HapticTab'

// PlatformPressable calls useTheme() which needs NavigationContainer.
// Stub it here so HapticTab renders standalone without a navigation tree.
jest.mock('@react-navigation/elements', () => {
  const React = require('react')
  const { Pressable } = require('react-native')
  return {
    PlatformPressable: ({ onPressIn, children, ...p }: any) =>
      React.createElement(Pressable, { ...p, testID: 'pressable', onPressIn }, children),
  }
})

const mockImpactAsync = impactAsync as jest.Mock

describe('HapticTab', () => {
  beforeEach(() => {
    process.env.EXPO_OS = 'ios'
    mockImpactAsync.mockClear()
  })

  it('renders without crash', () => {
    render(<HapticTab />)
    expect(screen.getByTestId('pressable')).toBeTruthy()
  })

  it('calls impactAsync with Light on pressIn', () => {
    render(<HapticTab />)
    fireEvent(screen.getByTestId('pressable'), 'pressIn')
    expect(mockImpactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light)
  })

  it('forwards onPressIn prop', () => {
    const onPressIn = jest.fn()
    render(<HapticTab onPressIn={onPressIn} />)
    fireEvent(screen.getByTestId('pressable'), 'pressIn')
    expect(onPressIn).toHaveBeenCalled()
  })
})
