import { Dimensions, ScaledSize } from 'react-native';

interface UseDimensionsResult {
  window: ScaledSize;
  screen: ScaledSize;
}

export function useDimensions(): UseDimensionsResult {
  return {
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  };
}
