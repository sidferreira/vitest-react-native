import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';

interface Props {
  title?: string;
  onPress?: () => void;
}

export function ButtonDemo({ title = 'Press me', onPress }: Props) {
  const [pressed, setPressed] = useState(false);

  function handlePress() {
    setPressed(true);
    onPress?.();
  }

  return (
    <View>
      <Text testID="press-status">{pressed ? 'pressed' : 'idle'}</Text>
      <Button testID="demo-button" title={title} onPress={handlePress} />
    </View>
  );
}
