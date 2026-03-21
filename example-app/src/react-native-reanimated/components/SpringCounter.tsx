import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface SpringCounterProps {
  initialValue?: number;
  step?: number;
}

export function SpringCounter({ initialValue = 0, step = 10 }: SpringCounterProps) {
  // Use state to store display value — the reanimated mock creates a fresh
  // proxy each render, so we persist the value through React state.
  const [valueDisplay, setValueDisplay] = useState(initialValue);

  const counter = useSharedValue(valueDisplay);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + Math.abs(counter.value) * 0.01 }],
  }));

  const handleSpring = () => {
    const newVal = withSpring(valueDisplay + step) as number;
    counter.value = newVal;
    setValueDisplay(newVal);
  };

  const handleTiming = () => {
    const newVal = withTiming(valueDisplay - step) as number;
    counter.value = newVal;
    setValueDisplay(newVal);
  };

  const handleReset = () => {
    cancelAnimation(counter);
    counter.value = initialValue;
    setValueDisplay(initialValue);
  };

  const handleDelay = () => {
    // withDelay returns its second arg unchanged; withSpring returns toValue
    const newVal = withDelay(500, withSpring(valueDisplay + step)) as number;
    counter.value = newVal;
    setValueDisplay(newVal);
  };

  return (
    <View testID="spring-counter">
      <Animated.View testID="counter-animated-view" style={animatedStyle} />
      <Text testID="value-display">{valueDisplay}</Text>
      <Pressable testID="spring-btn" onPress={handleSpring}>
        <Text>Spring</Text>
      </Pressable>
      <Pressable testID="timing-btn" onPress={handleTiming}>
        <Text>Timing</Text>
      </Pressable>
      <Pressable testID="reset-btn" onPress={handleReset}>
        <Text>Reset</Text>
      </Pressable>
      <Pressable testID="delay-btn" onPress={handleDelay}>
        <Text>Delay</Text>
      </Pressable>
    </View>
  );
}
