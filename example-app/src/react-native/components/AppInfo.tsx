import React from 'react';
import { View, Text, Platform, Dimensions } from 'react-native';

export function AppInfo() {
  const { width, height } = Dimensions.get('window');
  const vendor = Platform.select({ ios: 'Apple', android: 'Google', default: 'Unknown' });

  return (
    <View>
      <Text testID="platform-os">{Platform.OS}</Text>
      <Text testID="platform-version">{String(Platform.Version)}</Text>
      <Text testID="platform-vendor">{vendor}</Text>
      <Text testID="window-width">{width}</Text>
      <Text testID="window-height">{height}</Text>
    </View>
  );
}
