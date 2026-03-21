import { useState } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface AnimatedValueResult {
  sharedValue: ReturnType<typeof useSharedValue<number>>;
  animatedStyle: { opacity: number };
  set: (newValue: number) => void;
  animate: (newValue: number) => void;
}

export function useAnimatedValue(initialValue: number): AnimatedValueResult {
  // useState with a lazy initializer ensures the shared value is created once
  // and persists across re-renders (the mock creates a new proxy each call).
  const [sharedValue] = useState(() => useSharedValue(initialValue));
  const [, forceUpdate] = useState(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: clamp(sharedValue.value, 0, 1),
  }));

  const set = (newValue: number) => {
    sharedValue.value = newValue;
    forceUpdate((n) => n + 1);
  };

  const animate = (newValue: number) => {
    sharedValue.value = withSpring(newValue) as number;
    forceUpdate((n) => n + 1);
  };

  return { sharedValue, animatedStyle, set, animate };
}
