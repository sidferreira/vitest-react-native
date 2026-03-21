import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

export function ScrollTracker() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollOffset.value * 0.5 }],
  }));

  return (
    <View>
      <Animated.View testID="parallax-header" style={parallaxStyle}>
        <Text>Header</Text>
      </Animated.View>
      <Animated.ScrollView testID="scroll-view" ref={scrollRef}>
        <Text>Content</Text>
      </Animated.ScrollView>
      <Text testID="offset-display">{scrollOffset.value}</Text>
    </View>
  );
}
