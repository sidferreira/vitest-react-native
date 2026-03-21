import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedBoxProps {
  initialOpacity?: number;
  initialTranslateY?: number;
}

export function AnimatedBox({
  initialOpacity = 1,
  initialTranslateY = 0,
}: AnimatedBoxProps) {
  // Use state to store display values — the reanimated mock creates a fresh
  // proxy each render, so shared value mutations are preserved via React state.
  const [opacityDisplay, setOpacityDisplay] = useState(initialOpacity);
  const [translateYDisplay, setTranslateYDisplay] = useState(initialTranslateY);

  const opacityValue = useSharedValue(opacityDisplay);
  const translateYValue = useSharedValue(translateYDisplay);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ translateY: translateYValue.value }],
  }));

  const handleFadeOut = () => {
    const newVal = withTiming(0);
    opacityValue.value = newVal;
    setOpacityDisplay(newVal as number);
  };

  const handleFadeIn = () => {
    const newVal = withTiming(1);
    opacityValue.value = newVal;
    setOpacityDisplay(newVal as number);
  };

  const handleMoveUp = () => {
    const newVal = withSpring(-50);
    translateYValue.value = newVal;
    setTranslateYDisplay(newVal as number);
  };

  const handleMoveReset = () => {
    translateYValue.value = 0;
    setTranslateYDisplay(0);
  };

  return (
    <View>
      <Animated.View testID="animated-box" style={animatedStyle} />
      <Text testID="opacity-display">{opacityDisplay}</Text>
      <Text testID="translate-display">{translateYDisplay}</Text>
      <Pressable testID="fade-out-btn" onPress={handleFadeOut}>
        <Text>Fade Out</Text>
      </Pressable>
      <Pressable testID="fade-in-btn" onPress={handleFadeIn}>
        <Text>Fade In</Text>
      </Pressable>
      <Pressable testID="move-up-btn" onPress={handleMoveUp}>
        <Text>Move Up</Text>
      </Pressable>
      <Pressable testID="move-reset-btn" onPress={handleMoveReset}>
        <Text>Reset</Text>
      </Pressable>
    </View>
  );
}
