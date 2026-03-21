import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

// Note: Animated.FlatList uses VirtualizedList which is incompatible with
// React 19's test renderer. We use ScrollView + map to demonstrate the same
// entering/exiting animation patterns with Animated.View.

interface AnimatedListProps {
  initialItems?: string[];
}

export function AnimatedList({ initialItems = [] }: AnimatedListProps) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [inputText, setInputText] = useState('');

  const handleAdd = () => {
    if (!inputText.trim()) return;
    setItems((prev) => [...prev, inputText.trim()]);
    setInputText('');
  };

  return (
    <View>
      <TextInput
        testID="item-input"
        value={inputText}
        onChangeText={setInputText}
        placeholder="Add item"
      />
      <Pressable testID="add-btn" onPress={handleAdd}>
        <Text>Add</Text>
      </Pressable>
      <Animated.ScrollView testID="items-list" entering={SlideInRight}>
        {items.map((item, index) => (
          <Animated.View key={index} testID={`item-${index}`} entering={FadeIn}>
            <Text testID={`item-text-${index}`}>{item}</Text>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}
