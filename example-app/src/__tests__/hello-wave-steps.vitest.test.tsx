/**
 * Regression tests for HelloWave and its import chain (RN primitives → ThemedText → reanimated → HelloWave).
 *
 * Run with:
 *   VITEST_REACT_NATIVE=0.81.4 npx vitest run --config toolchain/vitest/vitest.config.ts src/__tests__/hello-wave-steps.test.tsx
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { View, Text, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'

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

// ─── reanimated named imports ─────────────────────────────────────────────
describe('reanimated named imports', () => {
  it('imports useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming', async () => {
    const {
      useSharedValue,
      useAnimatedStyle,
      withRepeat,
      withSequence,
      withTiming,
    } = await import('react-native-reanimated')
    expect(typeof useSharedValue).toBe('function')
    expect(typeof useAnimatedStyle).toBe('function')
    expect(typeof withRepeat).toBe('function')
    expect(typeof withSequence).toBe('function')
    expect(typeof withTiming).toBe('function')
  })
})

// ─── reanimated module shape ──────────────────────────────────────────────
describe('reanimated module shape', () => {
  it('default export is an object', async () => {
    const Animated = (await import('react-native-reanimated')).default
    expect(typeof Animated).toBe('object')
  })

  it('Animated.View is a function (via default)', async () => {
    const Animated = (await import('react-native-reanimated')).default
    expect(typeof Animated?.View).toBe('function')
  })

  it('View exists somewhere in the module', async () => {
    const ns = await import('react-native-reanimated')
    // Check both top-level and nested .default.View
    const topLevel = (ns as any).View
    const nested = (ns as any).default?.View
    expect(typeof topLevel === 'function' || typeof nested === 'function').toBe(true)
  })
})

// ─── reanimated Animated.View render ─────────────────────────────────────
describe('reanimated Animated.View render', () => {
  it('renders <Animated.View>', async () => {
    const Animated = (await import('react-native-reanimated')).default
    render(<Animated.View />)
  })

  it('renders <Animated.View> with child ThemedText', async () => {
    const Animated = (await import('react-native-reanimated')).default
    render(
      <Animated.View>
        <ThemedText style={{ fontSize: 28 }}>👋</ThemedText>
      </Animated.View>
    )
  })
})

// ─── reanimated hooks ─────────────────────────────────────────────────────
describe('reanimated hooks', () => {
  it('useSharedValue returns a mutable ref', async () => {
    const { useSharedValue } = await import('react-native-reanimated')
    function Comp() {
      const v = useSharedValue(0)
      return <View testID={String(v.value)} />
    }
    render(<Comp />)
    expect(screen.getByTestId('0')).toBeTruthy()
  })

  it('useAnimatedStyle returns a style object', async () => {
    const { useSharedValue, useAnimatedStyle } = await import('react-native-reanimated')
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
  it('renders without crash', async () => {
    const { HelloWave } = await import('@/components/HelloWave')
    render(<HelloWave />)
    expect(screen.toJSON()).toBeTruthy()
  })

  it('renders the wave emoji', async () => {
    const { HelloWave } = await import('@/components/HelloWave')
    render(<HelloWave />)
    expect(screen.getByText('👋')).toBeTruthy()
  })
})
