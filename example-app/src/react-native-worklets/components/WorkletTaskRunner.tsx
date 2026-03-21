import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { runOnUIAsync } from 'react-native-worklets';

interface WorkletTaskRunnerProps {
  compute?: (n: number) => number;
  initialInput?: number;
}

export function WorkletTaskRunner({
  compute = (n) => n * 2,
  initialInput = 5,
}: WorkletTaskRunnerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    setLoading(true);
    setError(null);
    setResult(null);
    runOnUIAsync(compute)(initialInput)
      .then((r) => {
        setResult(r);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  };

  return (
    <View>
      <Pressable testID="run-btn" onPress={handleRun}>
        <Text>Run</Text>
      </Pressable>
      {loading && <ActivityIndicator testID="loading-indicator" />}
      {result !== null && <Text testID="result-display">{result}</Text>}
      {error !== null && <Text testID="error-display">{error}</Text>}
    </View>
  );
}
