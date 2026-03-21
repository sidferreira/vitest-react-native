/**
 * Verifies that the specific named imports used by react-native-reanimated's
 * src/mock.ts are all valid React components (or functions) when loaded
 * through the ESM/Vite pipeline.
 *
 *   import { Animated, Image, processColor, Text, View } from 'react-native'
 *
 * Each component must:
 *  - be non-null / non-undefined
 *  - have typeof === 'function' (React host components)
 *  - have a truthy displayName or function name (React DevTools / error messages)
 *  - render without throwing "Element type is invalid"
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import {
  Animated as AnimatedRN,
  Image as ImageRN,
  processColor as processColorRN,
  Text as TextRN,
  View as ViewRN,
} from 'react-native'

// ─── shape ────────────────────────────────────────────────────────────────────

describe('react-native named imports — shape', () => {
  test('ViewRN is a function', () => {
    expect(ViewRN).toBeDefined()
    expect(typeof ViewRN).toBe('function')
  })

  test('ViewRN has a displayName or function name', () => {
    const label = (ViewRN as any).displayName ?? (ViewRN as Function).name
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  test('TextRN is a function', () => {
    expect(TextRN).toBeDefined()
    expect(typeof TextRN).toBe('function')
  })

  test('TextRN has a displayName or function name', () => {
    const label = (TextRN as any).displayName ?? (TextRN as Function).name
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  test('ImageRN is a function', () => {
    expect(ImageRN).toBeDefined()
    expect(typeof ImageRN).toBe('function')
  })

  test('ImageRN has a displayName or function name', () => {
    const label = (ImageRN as any).displayName ?? (ImageRN as Function).name
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  test('processColorRN is a function', () => {
    expect(processColorRN).toBeDefined()
    expect(typeof processColorRN).toBe('function')
  })

  test('AnimatedRN is an object', () => {
    expect(AnimatedRN).toBeDefined()
    expect(typeof AnimatedRN).toBe('object')
  })

  test('AnimatedRN.View is a function', () => {
    expect(AnimatedRN.View).toBeDefined()
    expect(typeof AnimatedRN.View).toBe('function')
  })

  test('AnimatedRN.Text is a function', () => {
    expect(AnimatedRN.Text).toBeDefined()
    expect(typeof AnimatedRN.Text).toBe('function')
  })

  test('AnimatedRN.Image is a function', () => {
    expect(AnimatedRN.Image).toBeDefined()
    expect(typeof AnimatedRN.Image).toBe('function')
  })
})

// ─── render smoke (catches "Element type is invalid") ─────────────────────────

describe('react-native named imports — render smoke', () => {
  test('renders <ViewRN>', () => {
    render(<ViewRN testID="v" />)
    expect(screen.toJSON()).not.toBeNull()
    expect(screen.toJSON()).toMatchObject({ type: 'View', props: { testID: 'v' } })
  })

  test('renders <TextRN>', () => {
    render(<TextRN>hello</TextRN>)
    expect(screen.getByText('hello')).toBeTruthy()
  })

  test('renders <ImageRN>', () => {
    render(<ImageRN source={{ uri: 'https://example.com/img.png' }} />)
    expect(screen.toJSON()).not.toBeNull()
  })

  test('renders <AnimatedRN.View>', () => {
    render(<AnimatedRN.View testID="av" />)
    expect(screen.toJSON()).not.toBeNull()
    expect(screen.toJSON()).toMatchObject({ props: { testID: 'av' } })
  })

  test('renders <AnimatedRN.Text>', () => {
    render(<AnimatedRN.Text>hello</AnimatedRN.Text>)
    expect(screen.getByText('hello')).toBeTruthy()
  })

  test('renders <AnimatedRN.Image>', () => {
    render(<AnimatedRN.Image source={{ uri: 'https://example.com/img.png' }} />)
    expect(screen.toJSON()).not.toBeNull()
  })

  test('renders <AnimatedRN.ScrollView>', () => {
    render(<AnimatedRN.ScrollView><TextRN>hello</TextRN></AnimatedRN.ScrollView>)
    expect(screen.toJSON()).not.toBeNull()
    expect(screen.getByText('hello')).toBeTruthy()
  })
})

// ─── react-native-reanimated Animated.View ───────────────────────────────────
// These mirror the exact imports in reanimated's src/mock.ts and the components
// that HelloWave / ParallaxScrollView use at runtime.

import Animated from 'react-native-reanimated'

describe('reanimated Animated — shape', () => {
  test('Animated default export is an object', () => {
    expect(Animated).toBeDefined()
    expect(typeof Animated).toBe('object')
  })

  test('Animated.View is a function', () => {
    expect(Animated.View).toBeDefined()
    expect(typeof Animated.View).toBe('function')
  })

  test('Animated.View has a displayName or function name', () => {
    const label = (Animated.View as any).displayName ?? (Animated.View as any).name
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  test('Animated.Text is a function', () => {
    expect(Animated.Text).toBeDefined()
    expect(typeof Animated.Text).toBe('function')
  })

  test('Animated.Image is a function', () => {
    expect(Animated.Image).toBeDefined()
    expect(typeof Animated.Image).toBe('function')
  })

  test('Animated.ScrollView is a function', () => {
    expect(Animated.ScrollView).toBeDefined()
    expect(typeof Animated.ScrollView).toBe('function')
  })
})

describe('reanimated Animated — render smoke', () => {
  test('renders <Animated.View>', () => {
    render(<Animated.View testID="rv" />)
    expect(screen.toJSON()).not.toBeNull()
    expect(screen.toJSON()).toMatchObject({ props: { testID: 'rv' } })
  })

  test('renders <Animated.Text>', () => {
    render(<Animated.Text>hello</Animated.Text>)
    expect(screen.getByText('hello')).toBeTruthy()
  })

  test('renders <Animated.Image>', () => {
    render(<Animated.Image source={{ uri: 'https://example.com/img.png' }} />)
    expect(screen.toJSON()).not.toBeNull()
  })

  test('renders <Animated.ScrollView> 1', () => {
    render(<Animated.ScrollView><Animated.Text>hello</Animated.Text></Animated.ScrollView>)
    expect(screen.toJSON()).not.toBeNull()
    expect(screen.getByText('hello')).toBeTruthy()
  })

  test('renders <Animated.ScrollView> 2', () => {
    render(<Animated.ScrollView><Animated.View /></Animated.ScrollView>)
  })

  test('renders <Animated.ScrollView> 3', () => {
    render(<Animated.ScrollView><ViewRN /></Animated.ScrollView>)
  })
})

// ─── processColor sanity ──────────────────────────────────────────────────────

describe('processColorRN', () => {
  test('returns a number or null for a known color string', () => {
    const result = processColorRN('red')
    // In a test environment processColor may return a number or null/undefined —
    // either is acceptable as long as it does not throw.
    expect(['number', 'object']).toContain(typeof result)
  })
})
