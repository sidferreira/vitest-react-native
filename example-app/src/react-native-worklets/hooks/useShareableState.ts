import { useState } from 'react';
import { makeShareable } from 'react-native-worklets';

export function useShareableState<T>(initialValue: T): [T, (newValue: T) => void] {
  const [value, setValue] = useState<T>(() => makeShareable(initialValue) as T);

  const setter = (newValue: T) => {
    setValue(makeShareable(newValue) as T);
  };

  return [value, setter];
}
