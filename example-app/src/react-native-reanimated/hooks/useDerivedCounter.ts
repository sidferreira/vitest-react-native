import { useDerivedValue } from 'react-native-reanimated';

type SharedValue<T> = { value: T };
type DerivedValue<T> = { value: T };

export function useDerivedCounter(
  a: SharedValue<number>,
  b: SharedValue<number>
): { sum: DerivedValue<number>; product: DerivedValue<number> } {
  const sum = useDerivedValue(() => a.value + b.value);
  const product = useDerivedValue(() => a.value * b.value);
  return { sum, product };
}
