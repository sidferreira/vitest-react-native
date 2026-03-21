import React from 'react';
import { SafeAreaView, Text } from 'react-native';

interface Props {
  children?: React.ReactNode;
}

export function SafeAreaViewDemo({ children }: Props) {
  return (
    <SafeAreaView testID="safe-area">
      {children ?? <Text testID="default-content">Safe content</Text>}
    </SafeAreaView>
  );
}
