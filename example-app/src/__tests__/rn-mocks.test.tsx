/**
 * Regression tests — verifies React Native mock exports and render behaviour.
 *
 * Run with:
 *   VITEST_REACT_NATIVE=0.81.4 npx vitest run --config toolchain/vitest/vitest.config.ts src/__tests__/rn-mocks.test.tsx
 */

import React from 'react'
import { render } from '@testing-library/react-native'
import {
  View,
  Text,
  Image,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native'

// ─── RN component mocks ────────────────────────────────────────────────────

describe('react-native component mocks — shape', () => {
  test('View', () => {
    expect(typeof View).toBe('function')
  })

  test('Text', () => {
    expect(typeof Text).toBe('function')
  })

  test('Image', () => {
    expect(typeof Image).toBe('function')
  })

  test('TextInput', () => {
    expect(typeof TextInput).toBe('function')
  })

  test('Modal', () => {
    expect(typeof Modal).toBe('function')
  })

  test('ScrollView', () => {
    expect(typeof ScrollView).toBe('function')
  })

  test('ActivityIndicator', () => {
    expect(typeof ActivityIndicator).toBe('function')
  })

  test('RefreshControl', () => {
    expect(typeof RefreshControl).toBe('function')
  })
})

// ─── render smoke tests ───────────────────────────────────────────────────
// These trigger "Element type is invalid" if any component is undefined/null.

describe('react-native component mocks — render smoke', () => {
  test('renders <View>', () => {
    render(<View />)
  })

  test('renders <Text>', () => {
    render(<Text>hello</Text>)
  })

  test('renders <Image>', () => {
    render(<Image source={{ uri: 'https://example.com/img.png' }} />)
  })

  test('renders <TextInput>', () => {
    render(<TextInput />)
  })

  test('renders <Modal>', () => {
    render(<Modal><View /></Modal>)
  })

  test('renders <ScrollView>', () => {
    render(<ScrollView><View /></ScrollView>)
  })

  test('renders <ActivityIndicator>', () => {
    render(<ActivityIndicator />)
  })

  test('renders <ScrollView refreshControl>', () => {
    render(
      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      />
    )
  })
})

// ─── Named exports from 'react-native' (lazy getters) ────────────────────
// react-native/index.js exposes components via Object.defineProperty getters.
// Each getter calls require('./Libraries/...').default internally.
// This verifies the lazy getter chain works end-to-end.

describe("require('react-native') named exports", () => {
  const RN = require('react-native') as typeof import('react-native')

  test('RN.View', () => {
    expect(typeof RN.View).toBe('function')
  })

  test('RN.Text', () => {
    expect(typeof RN.Text).toBe('function')
  })

  test('RN.Image', () => {
    expect(typeof RN.Image).toBe('function')
  })

  test('RN.TextInput', () => {
    expect(typeof RN.TextInput).toBe('function')
  })

  test('RN.Modal', () => {
    expect(typeof RN.Modal).toBe('function')
  })

  test('RN.ScrollView', () => {
    expect(typeof RN.ScrollView).toBe('function')
  })

  test('RN.ActivityIndicator', () => {
    expect(typeof RN.ActivityIndicator).toBe('function')
  })

  test('RN.RefreshControl', () => {
    expect(typeof RN.RefreshControl).toBe('function')
  })

  test('RN.Animated', () => {
    expect(typeof RN.Animated).toBe('object')
  })

  test('RN.Animated.View', () => {
    expect(typeof RN.Animated.View).toBe('function')
  })

  test('RN.Animated.Text', () => {
    expect(typeof RN.Animated.Text).toBe('function')
  })

  test('RN.Animated.Image', () => {
    expect(typeof RN.Animated.Image).toBe('function')
  })

  test('RN.Animated.ScrollView', () => {
    expect(typeof RN.Animated.ScrollView).toBe('function')
  })
})

// ─── Direct require() of the Library paths ────────────────────────────────
// This shows what module.exports / .default the mock sets on each file.

describe('direct require of library paths', () => {
  test('View library path', () => {
    const mod = require('react-native/Libraries/Components/View/View')
    expect(typeof (mod.default ?? mod)).toBe('function')
  })

  test('Text library path', () => {
    const mod = require('react-native/Libraries/Text/Text')
    expect(typeof (mod.default ?? mod)).toBe('function')
  })

  test('TextInput library path', () => {
    const mod = require('react-native/Libraries/Components/TextInput/TextInput')
    expect(typeof (mod.default ?? mod)).toBe('function')
  })

  test('Modal library path', () => {
    const mod = require('react-native/Libraries/Modal/Modal')
    expect(typeof (mod.default ?? mod)).toBe('function')
  })

  test('ScrollView library path', () => {
    const mod = require('react-native/Libraries/Components/ScrollView/ScrollView')
    expect(typeof (mod.default ?? mod)).toBe('function')
  })
})

// ─── Animated — shape ─────────────────────────────────────────────────────

describe('Animated — shape', () => {
  test('Animated is an object', () => {
    expect(typeof Animated).toBe('object')
  })

  test('Animated.View', () => {
    expect(typeof Animated.View).toBe('function')
  })

  test('Animated.Text', () => {
    expect(typeof Animated.Text).toBe('function')
  })

  test('Animated.Image', () => {
    expect(typeof Animated.Image).toBe('function')
  })

  test('Animated.ScrollView', () => {
    expect(typeof Animated.ScrollView).toBe('function')
  })

  test('Animated.createAnimatedComponent is a function', () => {
    expect(typeof Animated.createAnimatedComponent).toBe('function')
  })

  test('Animated.createAnimatedComponent(View) returns a component', () => {
    const AnimatedView = Animated.createAnimatedComponent(View)
    expect(typeof AnimatedView).toBe('function')
  })
})

// ─── Animated — render smoke ──────────────────────────────────────────────

describe('Animated — render smoke', () => {
  test('renders <Animated.View>', () => {
    render(<Animated.View />)
  })

  test('renders <Animated.Text>', () => {
    render(<Animated.Text>hello</Animated.Text>)
  })

  test('renders <Animated.Image>', () => {
    render(<Animated.Image source={{ uri: 'https://example.com/img.png' }} />)
  })

  test('renders <Animated.ScrollView>', () => {
    render(<Animated.ScrollView><View /></Animated.ScrollView>)
  })

  test('renders createAnimatedComponent(View)', () => {
    const AnimatedView = Animated.createAnimatedComponent(View)
    render(<AnimatedView />)
  })

  test('renders createAnimatedComponent(Text)', () => {
    const AnimatedText = Animated.createAnimatedComponent(Text)
    render(<AnimatedText>hello</AnimatedText>)
  })
})
