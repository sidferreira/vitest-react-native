/**
 * Pure unit tests for every symbol exported by the react-native-reanimated mock.
 * No components — just the raw API.
 */

import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  isReanimated3,
  measure,
  runOnJS,
  runOnUI,
  scrollTo,
  SlideInRight,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue,
  withDecay,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { renderHook } from '@testing-library/react-native';

// ─── useSharedValue ───────────────────────────────────────────────────────────

describe('useSharedValue', () => {
  test('proxy semantics: .value read/write, .get(), .set(value), .set(fn)', () => {
    const { result } = renderHook(() => useSharedValue(42));
    const sv = result.current;

    expect(sv.value).toBe(42);
    expect(sv.get()).toBe(42);

    sv.value = 99;
    expect(sv.value).toBe(99);
    expect(sv.get()).toBe(99);

    sv.set(0);
    expect(sv.value).toBe(0);

    // updater function form: .set((prev) => prev + 5)
    sv.value = 10;
    sv.set((prev: number) => prev + 5);
    expect(sv.value).toBe(15);
  });

  test('works with non-numeric initial value', () => {
    const { result } = renderHook(() => useSharedValue('hello'));
    expect(result.current.value).toBe('hello');
  });
});

// ─── useAnimatedStyle ─────────────────────────────────────────────────────────

describe('useAnimatedStyle', () => {
  test('calls style function exactly once and returns its result', () => {
    const spy = jest.fn(() => ({ opacity: 0.5, backgroundColor: 'red' }));
    const { result } = renderHook(() => useAnimatedStyle(spy));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ opacity: 0.5, backgroundColor: 'red' });
  });

  test('captures the current shared value at call time', () => {
    const { result } = renderHook(() => {
      const sv = useSharedValue(0.8);
      return useAnimatedStyle(() => ({ opacity: sv.value }));
    });
    expect(result.current).toMatchObject({ opacity: 0.8 });
  });

  test('re-evaluates when shared value is mutated before next call', () => {
    const { result } = renderHook(() => {
      const sv = useSharedValue(0.2);
      sv.value = 0.9; // mutate before useAnimatedStyle reads it
      return useAnimatedStyle(() => ({ opacity: sv.value }));
    });
    expect(result.current).toMatchObject({ opacity: 0.9 });
  });
});

// ─── useDerivedValue ──────────────────────────────────────────────────────────

describe('useDerivedValue', () => {
  test('calls processor once and returns { value, get() }', () => {
    const processor = jest.fn(() => 42);
    const { result } = renderHook(() => useDerivedValue(processor));
    expect(processor).toHaveBeenCalledTimes(1);
    expect(result.current.value).toBe(42);
    expect(result.current.get()).toBe(42);
  });

  test('reflects shared value at call time', () => {
    const { result } = renderHook(() => {
      const sv = useSharedValue(3);
      return useDerivedValue(() => sv.value * 2);
    });
    expect(result.current.value).toBe(6);
  });
});

// ─── useAnimatedProps ─────────────────────────────────────────────────────────

describe('useAnimatedProps', () => {
  test('calls callback once and returns its result', () => {
    const spy = jest.fn(() => ({ progress: 0.5 }));
    const { result } = renderHook(() => useAnimatedProps(spy));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ progress: 0.5 });
  });
});

// ─── withTiming ───────────────────────────────────────────────────────────────

describe('withTiming', () => {
  test('returns toValue synchronously', () => {
    expect(withTiming(100)).toBe(100);
    expect(withTiming(0)).toBe(0);
  });

  test('calls callback with true; config is accepted and ignored', () => {
    const cb = jest.fn();
    withTiming(50, { duration: 300, easing: Easing.linear }, cb);
    expect(cb).toHaveBeenCalledWith(true);
  });
});

// ─── withSpring ───────────────────────────────────────────────────────────────

describe('withSpring', () => {
  test('returns toValue synchronously', () => {
    expect(withSpring(200)).toBe(200);
  });

  test('calls callback with true; config is accepted and ignored', () => {
    const cb = jest.fn();
    withSpring(10, { damping: 20 }, cb);
    expect(cb).toHaveBeenCalledWith(true);
  });
});

// ─── withDelay ────────────────────────────────────────────────────────────────

describe('withDelay', () => {
  test('returns second argument unchanged regardless of delay', () => {
    expect(withDelay(500, 42)).toBe(42);
    expect(withDelay(0, 'anim')).toBe('anim');
    const obj = { type: 'spring' };
    expect(withDelay(1000, obj)).toBe(obj);
  });
});

// ─── withRepeat ───────────────────────────────────────────────────────────────

describe('withRepeat', () => {
  test('returns first argument unchanged (identity)', () => {
    expect(withRepeat(42 as never)).toBe(42);
    expect(withRepeat('anim' as never)).toBe('anim');
  });
});

// ─── withSequence ─────────────────────────────────────────────────────────────

describe('withSequence', () => {
  test('returns 0 regardless of args', () => {
    expect(withSequence()).toBe(0);
    expect(withSequence(withTiming(1), withSpring(2))).toBe(0);
  });
});

// ─── withDecay ────────────────────────────────────────────────────────────────

describe('withDecay', () => {
  test('returns 0 and calls callback with true', () => {
    const cb = jest.fn();
    expect(withDecay({ velocity: 5 }, cb)).toBe(0);
    expect(cb).toHaveBeenCalledWith(true);
  });
});

// ─── cancelAnimation ──────────────────────────────────────────────────────────

describe('cancelAnimation', () => {
  test('does not modify shared value and does not throw', () => {
    const { result } = renderHook(() => useSharedValue(7));
    cancelAnimation(result.current);
    expect(result.current.value).toBe(7);
  });
});

// ─── Animated components ──────────────────────────────────────────────────────

describe('Animated components', () => {
  test('View, Text, Image, ScrollView, FlatList are all functions', () => {
    expect(typeof Animated.View).toBe('function');
    expect(typeof Animated.Text).toBe('function');
    expect(typeof Animated.Image).toBe('function');
    expect(typeof Animated.ScrollView).toBe('function');
    expect(typeof Animated.FlatList).toBe('function');
  });

  test('createAnimatedComponent(C) returns C (identity)', () => {
    const MyComponent = () => null;
    expect(Animated.createAnimatedComponent(MyComponent as never)).toBe(MyComponent);
  });
});

// ─── Layout animations ────────────────────────────────────────────────────────

describe('Layout animations', () => {
  test('FadeIn is a builder: chainable and buildable', () => {
    const chained = FadeIn.duration(300);
    // chaining returns a builder (has .build)
    expect(typeof chained.build).toBe('function');
    // build returns something (the animation descriptor)
    expect(chained.build()).toBeDefined();
  });

  test('SlideInRight is a builder: delay() is chainable and buildable', () => {
    const chained = SlideInRight.delay(100);
    expect(typeof chained.build).toBe('function');
    expect(chained.build()).toBeDefined();
  });
});

// ─── Easing ───────────────────────────────────────────────────────────────────

describe('Easing', () => {
  test('linear, ease, in, out are identity-like functions', () => {
    expect(typeof Easing.linear).toBe('function');
    expect(Easing.linear(0.5)).toBe(0.5); // identity in mock
    expect(typeof Easing.ease).toBe('function');
    expect(typeof Easing.in).toBe('function');
    expect(typeof Easing.out).toBe('function');
  });

  test('bezier() returns an object with a factory property', () => {
    const result = Easing.bezier(0, 0, 1, 1);
    expect(result).toBeDefined();
    expect(typeof result.factory).toBe('function');
  });
});

// ─── Core ─────────────────────────────────────────────────────────────────────

describe('Core', () => {
  test('runOnJS(fn) and runOnUI(fn) return fn unchanged (identity)', () => {
    const fn = () => {};
    expect(runOnJS(fn)).toBe(fn);
    expect(runOnUI(fn)).toBe(fn);
  });

  test('isReanimated3() returns false', () => {
    expect(isReanimated3()).toBe(false);
  });
});

// ─── Platform ─────────────────────────────────────────────────────────────────

describe('Platform', () => {
  test('measure() returns zero-coord object', () => {
    expect(measure(null as never)).toEqual({
      x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0,
    });
  });

  test('scrollTo is a no-op that does not throw', () => {
    expect(() => scrollTo(null as never, 0, 100, false)).not.toThrow();
  });
});

// ─── Refs / Scroll ────────────────────────────────────────────────────────────

describe('useAnimatedRef', () => {
  test('returns { current: null }', () => {
    const { result } = renderHook(() => useAnimatedRef());
    expect(result.current).toEqual({ current: null });
  });
});

describe('useScrollViewOffset', () => {
  test('returns a shared-value-like object with value: 0', () => {
    const { result } = renderHook(() => {
      const ref = useAnimatedRef<Animated.ScrollView>();
      return useScrollViewOffset(ref);
    });
    expect(result.current.value).toBe(0);
  });
});
