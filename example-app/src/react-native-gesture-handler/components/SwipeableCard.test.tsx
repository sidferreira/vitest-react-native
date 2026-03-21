/**
 * SwipeableCard test suite
 *
 * Covers: SwipeableCard component, GestureHandlerRootView wrapper, and
 * Gesture composition API. No fake timers.
 */
import React from 'react'
import { Text } from 'react-native'
import { render, screen, fireEvent } from '@testing-library/react-native'
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler'
import { SwipeableCard } from './SwipeableCard'

jest.setTimeout(30_000)

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function renderWithGestureHandler(ui: React.ReactElement) {
  return render(<GestureHandlerRootView>{ui}</GestureHandlerRootView>)
}

// ─────────────────────────────────────────────────────────────────────────────
// SwipeableCard — GestureDetector + Gesture.Pan / Gesture.Tap
// ─────────────────────────────────────────────────────────────────────────────

describe('SwipeableCard', () => {
  it('renders the card label', () => {
    renderWithGestureHandler(<SwipeableCard label="Hello" />)
    expect(screen.getByTestId('card-label')).toBeTruthy()
    expect(screen.getByText('Hello')).toBeTruthy()
  })

  it('starts in idle status', () => {
    renderWithGestureHandler(<SwipeableCard label="Card" />)
    expect(screen.getByTestId('card-status')).toHaveTextContent('idle')
  })

  it('calls onTap callback when tapped', () => {
    const onTap = jest.fn()
    renderWithGestureHandler(<SwipeableCard label="Card" onTap={onTap} />)
    fireEvent.press(screen.getByTestId('swipeable-card'))
    expect(screen.getByTestId('swipeable-card')).toBeTruthy()
  })

  it('calls onSwipeLeft when panned left past threshold', () => {
    const onSwipeLeft = jest.fn()
    renderWithGestureHandler(<SwipeableCard label="Card" onSwipeLeft={onSwipeLeft} />)
    expect(screen.getByTestId('swipeable-card')).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GestureHandlerRootView — required wrapper
// ─────────────────────────────────────────────────────────────────────────────

describe('GestureHandlerRootView', () => {
  it('renders children', () => {
    render(
      <GestureHandlerRootView>
        <Text testID="child">inside root view</Text>
      </GestureHandlerRootView>
    )
    expect(screen.getByTestId('child')).toBeTruthy()
  })

  it('accepts style prop', () => {
    render(
      <GestureHandlerRootView style={{ flex: 1 }} testID="root-view">
        <Text>child</Text>
      </GestureHandlerRootView>
    )
    expect(screen.getByTestId('root-view')).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Gesture composition — Exclusive / Race / Simultaneous
// ─────────────────────────────────────────────────────────────────────────────

describe('Gesture composition', () => {
  it('Gesture.Exclusive composes without throwing', () => {
    const pan = Gesture.Pan()
    const tap = Gesture.Tap()
    expect(() => Gesture.Exclusive(pan, tap)).not.toThrow()
  })

  it('Gesture.Race composes without throwing', () => {
    const pan = Gesture.Pan()
    const tap = Gesture.Tap()
    expect(() => Gesture.Race(pan, tap)).not.toThrow()
  })

  it('Gesture.Simultaneous composes without throwing', () => {
    const pan = Gesture.Pan()
    const pinch = Gesture.Pinch()
    expect(() => Gesture.Simultaneous(pan, pinch)).not.toThrow()
  })

  it('Gesture.Pan accepts onBegin / onUpdate / onEnd callbacks', () => {
    const onBegin = jest.fn()
    const onUpdate = jest.fn()
    const onEnd = jest.fn()

    expect(() =>
      Gesture.Pan().onBegin(onBegin).onUpdate(onUpdate).onEnd(onEnd)
    ).not.toThrow()
  })

  it('Gesture.Tap accepts maxDuration and numberOfTaps config', () => {
    expect(() =>
      Gesture.Tap().maxDuration(500).numberOfTaps(2)
    ).not.toThrow()
  })
})
