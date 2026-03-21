import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'

interface SwipeableCardProps {
  label: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
}

export function SwipeableCard({ label, onSwipeLeft, onSwipeRight, onTap }: SwipeableCardProps) {
  const [status, setStatus] = useState<'idle' | 'swiped-left' | 'swiped-right' | 'tapped'>('idle')

  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationX < -50) {
        setStatus('swiped-left')
        onSwipeLeft?.()
      } else if (e.translationX > 50) {
        setStatus('swiped-right')
        onSwipeRight?.()
      }
    })

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setStatus('tapped')
      onTap?.()
    })

  const composed = Gesture.Exclusive(panGesture, tapGesture)

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={composed}>
        <View style={styles.card} testID="swipeable-card">
          <Text testID="card-label">{label}</Text>
          <Text testID="card-status">{status}</Text>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
})
