import React, { useState } from 'react';
import { View, Text, Pressable, Vibration } from 'react-native';

interface VibrationFeedbackProps {
  pattern?: number[];
}

export function VibrationFeedback({ pattern = [0, 100, 100, 100] }: VibrationFeedbackProps) {
  const [status, setStatus] = useState<'idle' | 'vibrating' | 'cancelled'>('idle');

  const handleVibrate = () => {
    Vibration.vibrate(pattern);
    setStatus('vibrating');
  };

  const handleCancel = () => {
    Vibration.cancel();
    setStatus('cancelled');
  };

  return (
    <View>
      <Pressable testID="vibrate-btn" onPress={handleVibrate}>
        <Text>Vibrate</Text>
      </Pressable>
      <Pressable testID="cancel-btn" onPress={handleCancel}>
        <Text>Cancel</Text>
      </Pressable>
      <Text testID="status-display">{status}</Text>
    </View>
  );
}
