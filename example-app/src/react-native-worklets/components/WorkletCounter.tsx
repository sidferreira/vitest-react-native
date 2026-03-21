import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { runOnUI, runOnJS, scheduleOnRN } from 'react-native-worklets';

interface WorkletCounterProps {
  initialCount?: number;
  step?: number;
}

export function WorkletCounter({ initialCount = 0, step = 1 }: WorkletCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');

  const increment = () => {
    setStatus('pending');
    runOnUI((c: number, s: number) => {
      const next = c + s;
      runOnJS((n: number) => {
        setCount(n);
        setStatus('idle');
      })(next);
    })(count, step);
  };

  const decrement = () => {
    setStatus('pending');
    runOnUI((c: number, s: number) => {
      const next = c - s;
      runOnJS((n: number) => {
        setCount(n);
        setStatus('idle');
      })(next);
    })(count, step);
  };

  const reset = () => {
    setStatus('pending');
    scheduleOnRN(() => {
      setCount(initialCount);
      setStatus('idle');
    });
  };

  return (
    <View testID="worklet-counter">
      <Text testID="count-display">{count}</Text>
      <Text testID="status-display">{status}</Text>
      <Pressable testID="increment-btn" onPress={increment}>
        <Text>+</Text>
      </Pressable>
      <Pressable testID="decrement-btn" onPress={decrement}>
        <Text>-</Text>
      </Pressable>
      <Pressable testID="reset-btn" onPress={reset}>
        <Text>Reset</Text>
      </Pressable>
    </View>
  );
}
