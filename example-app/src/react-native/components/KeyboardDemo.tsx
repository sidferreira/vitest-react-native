import React, { useEffect, useState } from 'react';
import { Keyboard, Text, View } from 'react-native';

export function KeyboardDemo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View>
      <Text testID="keyboard-status">{visible ? 'shown' : 'hidden'}</Text>
    </View>
  );
}
