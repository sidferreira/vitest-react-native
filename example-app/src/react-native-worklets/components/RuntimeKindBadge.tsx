import React from 'react';
import { View, Text } from 'react-native';
import { getRuntimeKind, RuntimeKind } from 'react-native-worklets';

const kindToLabel: Record<number, string> = {
  [RuntimeKind.ReactNative]: 'React Native',
  [RuntimeKind.UI]: 'UI Thread',
  [RuntimeKind.Worker]: 'Worker',
};

export function RuntimeKindBadge() {
  const kind = getRuntimeKind();
  const label = kindToLabel[kind] ?? 'Unknown';

  return (
    <View testID="runtime-badge">
      <Text testID="runtime-label">{label}</Text>
      <Text testID="runtime-value">{String(kind)}</Text>
    </View>
  );
}
