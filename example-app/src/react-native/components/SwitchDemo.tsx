import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';

interface Props {
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export function SwitchDemo({ initialValue = false, onToggle }: Props) {
  const [enabled, setEnabled] = useState(initialValue);

  function handleChange(value: boolean) {
    setEnabled(value);
    onToggle?.(value);
  }

  return (
    <View>
      <Text testID="switch-label">{enabled ? 'ON' : 'OFF'}</Text>
      <Switch
        testID="switch-control"
        value={enabled}
        onValueChange={handleChange}
      />
    </View>
  );
}
