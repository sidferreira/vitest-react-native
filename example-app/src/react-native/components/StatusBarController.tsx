import React, { useState } from 'react';
import { View, Text, Pressable, StatusBar } from 'react-native';

type BarStyle = 'default' | 'light-content' | 'dark-content';

export function StatusBarController() {
  const [barStyle, setBarStyle] = useState<BarStyle>('default');
  const [bgColor, setBgColor] = useState('#000000');
  const [hidden, setHidden] = useState(false);

  const handleSetLight = () => {
    StatusBar.setBarStyle('light-content');
    setBarStyle('light-content');
  };

  const handleSetDark = () => {
    StatusBar.setBarStyle('dark-content');
    setBarStyle('dark-content');
  };

  const handleSetRed = () => {
    StatusBar.setBackgroundColor('#FF0000');
    setBgColor('#FF0000');
  };

  const handleSetBlue = () => {
    StatusBar.setBackgroundColor('#0000FF');
    setBgColor('#0000FF');
  };

  const handleToggleVisible = () => {
    const next = !hidden;
    StatusBar.setHidden(next);
    setHidden(next);
  };

  return (
    <View>
      <Text testID="current-style">{barStyle}</Text>
      <Text testID="current-color">{bgColor}</Text>
      <Text testID="visibility-display">{hidden ? 'hidden' : 'visible'}</Text>
      <Pressable testID="set-light-btn" onPress={handleSetLight}>
        <Text>Light</Text>
      </Pressable>
      <Pressable testID="set-dark-btn" onPress={handleSetDark}>
        <Text>Dark</Text>
      </Pressable>
      <Pressable testID="set-red-btn" onPress={handleSetRed}>
        <Text>Red</Text>
      </Pressable>
      <Pressable testID="set-blue-btn" onPress={handleSetBlue}>
        <Text>Blue</Text>
      </Pressable>
      <Pressable testID="toggle-visible-btn" onPress={handleToggleVisible}>
        <Text>Toggle</Text>
      </Pressable>
    </View>
  );
}
