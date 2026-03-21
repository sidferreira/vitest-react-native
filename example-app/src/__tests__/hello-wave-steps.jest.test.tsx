/**
 * Regression tests for HelloWave and its import chain (RN primitives → ThemedText → reanimated → HelloWave).
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { View, Text, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import * as ReanimatedNS from 'react-native-reanimated'
import { HelloWave } from '@/components/HelloWave'

// ─── bare RN primitives ───────────────────────────────────────────────────
describe('bare RN primitives', () => {
  it('renders <View>', () => {
    render(<View />)
  })
  it('renders <Text>', () => {
    render(<Text>hi</Text>)
  })
  it('StyleSheet.create works', () => {
    const s = StyleSheet.create({ box: { fontSize: 28 } })
    expect(s.box.fontSize).toBe(28)
  })
})

// ─── ThemedText ───────────────────────────────────────────────────────────
describe('ThemedText', () => {
  it('renders <ThemedText>', () => {
    render(<ThemedText>hello</ThemedText>)
  })
  it('renders <ThemedText> with emoji', () => {
    render(<ThemedText style={{ fontSize: 28 }}>👋</ThemedText>)
    expect(screen.getByText('👋')).toBeTruthy()
  })
})

const Animated = ReanimatedNS.default
const { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } = ReanimatedNS

// ─── reanimated named imports ─────────────────────────────────────────────
describe('reanimated named imports', () => {
  it('imports useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming', () => {
    expect(typeof useSharedValue).toBe('function')
    expect(typeof useAnimatedStyle).toBe('function')
    expect(typeof withRepeat).toBe('function')
    expect(typeof withSequence).toBe('function')
    expect(typeof withTiming).toBe('function')
  })
})

// ─── reanimated module shape ──────────────────────────────────────────────
describe('reanimated module shape', () => {
  it('default export is an object', () => {
    expect(typeof Animated).toBe('object')
  })

  it('Animated.View is a function (via default)', () => {
    expect(typeof Animated?.View).toBe('function')
  })

  it('View exists somewhere in the module', () => {
    // Check both top-level and nested .default.View
    const topLevel = (ReanimatedNS as any).View
    const nested = (ReanimatedNS as any).default?.View
    expect(typeof topLevel === 'function' || typeof nested === 'function').toBe(true)
  })
})

// ─── reanimated Animated.View render ─────────────────────────────────────
describe('reanimated Animated.View render', () => {
  it('renders <Animated.View>', () => {
    render(<Animated.View />)
  })

  it('renders <Animated.View> with child ThemedText', () => {
    render(
      <Animated.View>
        <ThemedText style={{ fontSize: 28 }}>👋</ThemedText>
      </Animated.View>
    )
  })
})

// ─── reanimated hooks ─────────────────────────────────────────────────────
describe('reanimated hooks', () => {
  it('useSharedValue returns a mutable ref', () => {
    function Comp() {
      const v = useSharedValue(0)
      return <View testID={String(v.value)} />
    }
    render(<Comp />)
    expect(screen.getByTestId('0')).toBeTruthy()
  })

  it('useAnimatedStyle returns a style object', () => {
    function Comp() {
      const v = useSharedValue(0)
      const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${v.value}deg` }] }))
      return <View style={style} />
    }
    render(<Comp />)
  })
})

// ─── HelloWave component ──────────────────────────────────────────────────
describe('HelloWave component', () => {
  it('renders without crash', () => {
    render(<HelloWave />)
    expect(screen.toJSON()).toBeTruthy()
  })

  it('renders the wave emoji', () => {
    render(<HelloWave />)
    expect(screen.getByText('👋')).toBeTruthy()
  })
})
