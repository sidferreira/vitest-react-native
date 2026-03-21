import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';

interface LinkButtonProps {
  url: string;
  label?: string;
}

export function LinkButton({ url, label = 'Open Link' }: LinkButtonProps) {
  const [status, setStatus] = useState<'ready' | 'opened' | 'unavailable'>('ready');

  const handlePress = async () => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      setStatus('opened');
    } else {
      setStatus('unavailable');
    }
  };

  return (
    <View>
      <Pressable testID="link-btn" onPress={handlePress}>
        <Text>{label}</Text>
      </Pressable>
      <Text testID="link-status">{status}</Text>
    </View>
  );
}
