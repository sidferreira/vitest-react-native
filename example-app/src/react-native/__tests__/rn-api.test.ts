/**
 * Pure unit tests for React Native's own built-in APIs.
 * No components — raw API surface only.
 */

import {
  StyleSheet,
  Platform,
  Dimensions,
  PixelRatio,
  Alert,
  Linking,
  Vibration,
  AppState,
  StatusBar,
  BackHandler,
  Share,
  AccessibilityInfo,
  Keyboard,
  I18nManager,
  Animated,
  processColor,
} from 'react-native';

// ─── StyleSheet ──────────────────────────────────────────────────────────────

describe('StyleSheet', () => {
  test('create() preserves all keys', () => {
    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: 'white' },
      text: { fontSize: 16, color: 'black' },
    });
    expect(styles.container).toMatchObject({ flex: 1, backgroundColor: 'white' });
    expect(styles.text).toMatchObject({ fontSize: 16, color: 'black' });
  });

  test('flatten([a, b]) merges styles into one object', () => {
    const a = { flex: 1, color: 'red' };
    const b = { color: 'blue', fontWeight: 'bold' as const };
    const merged = StyleSheet.flatten([a, b]);
    expect(merged).toMatchObject({ flex: 1, color: 'blue', fontWeight: 'bold' });
  });

  test('absoluteFill has position absolute and zero insets', () => {
    expect(StyleSheet.absoluteFill).toMatchObject({
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    });
  });

  test('hairlineWidth is a positive number', () => {
    expect(typeof StyleSheet.hairlineWidth).toBe('number');
    expect(StyleSheet.hairlineWidth).toBeGreaterThan(0);
  });
});

// ─── Platform ────────────────────────────────────────────────────────────────

describe('Platform', () => {
  test('OS is ios', () => {
    expect(Platform.OS).toBe('ios');
  });

  test('isTesting is true', () => {
    expect(Platform.isTesting).toBe(true);
  });

  test('select picks ios key', () => {
    expect(Platform.select({ ios: 'Apple', android: 'Google' })).toBe('Apple');
  });

  test('select falls back to default when platform key absent', () => {
    expect(Platform.select({ android: 'Google', default: 'fallback' })).toBe('fallback');
  });

  test('select returns value matching Platform.OS', () => {
    expect(Platform.select({ ios: Platform.OS, android: 'other' })).toBe('ios');
  });

  test('Version is defined', () => {
    expect(Platform.Version).toBeDefined();
  });
});

// ─── Dimensions ──────────────────────────────────────────────────────────────

describe('Dimensions', () => {
  test('get("window") has width, height, scale, fontScale', () => {
    const win = Dimensions.get('window');
    expect(typeof win.width).toBe('number');
    expect(typeof win.height).toBe('number');
    expect(typeof win.scale).toBe('number');
    expect(typeof win.fontScale).toBe('number');
  });

  test('get("window") values are positive', () => {
    const win = Dimensions.get('window');
    expect(win.width).toBeGreaterThan(0);
    expect(win.height).toBeGreaterThan(0);
    expect(win.scale).toBeGreaterThan(0);
    expect(win.fontScale).toBeGreaterThan(0);
  });

  test('get("screen") has same shape as window', () => {
    const screen = Dimensions.get('screen');
    expect(typeof screen.width).toBe('number');
    expect(typeof screen.height).toBe('number');
    expect(typeof screen.scale).toBe('number');
    expect(typeof screen.fontScale).toBe('number');
  });
});

// ─── PixelRatio ──────────────────────────────────────────────────────────────

describe('PixelRatio', () => {
  test('get() returns a positive number', () => {
    expect(typeof PixelRatio.get()).toBe('number');
    expect(PixelRatio.get()).toBeGreaterThan(0);
  });

  test('getFontScale() returns a positive number', () => {
    expect(typeof PixelRatio.getFontScale()).toBe('number');
    expect(PixelRatio.getFontScale()).toBeGreaterThan(0);
  });

  test('roundToNearestPixel() returns a number', () => {
    const result = PixelRatio.roundToNearestPixel(8.5);
    expect(typeof result).toBe('number');
  });
});

// ─── Alert ───────────────────────────────────────────────────────────────────

describe('Alert', () => {
  test('Alert.alert is a function', () => {
    expect(typeof Alert.alert).toBe('function');
  });

  test('Alert.alert is callable', () => {
    // Alert.alert delegates to NativeAlertManager; it's safe to call but may
    // be a no-op in the test environment if the native bridge is absent.
    expect(() => Alert.alert('Title', 'Message')).not.toThrow();
  });

  test('Alert.prompt is a function', () => {
    expect(typeof Alert.prompt).toBe('function');
  });
});

// ─── Linking ─────────────────────────────────────────────────────────────────

describe('Linking', () => {
  test('openURL is a function', () => {
    expect(typeof Linking.openURL).toBe('function');
  });

  test('canOpenURL is a function', () => {
    expect(typeof Linking.canOpenURL).toBe('function');
  });

  test('getInitialURL is a function', () => {
    expect(typeof Linking.getInitialURL).toBe('function');
  });

  test('openSettings is a function', () => {
    expect(typeof Linking.openSettings).toBe('function');
  });

  test('canOpenURL() returns a Promise', async () => {
    const result = Linking.canOpenURL('https://example.com');
    expect(result).toBeInstanceOf(Promise);
    const value = await result;
    expect(typeof value).toBe('boolean');
  });
});

// ─── Vibration ───────────────────────────────────────────────────────────────

describe('Vibration', () => {
  test('vibrate is a function', () => {
    expect(typeof Vibration.vibrate).toBe('function');
  });

  test('cancel is a function', () => {
    expect(typeof Vibration.cancel).toBe('function');
  });

  test('calling vibrate() does not throw', () => {
    expect(() => Vibration.vibrate()).not.toThrow();
  });

  test('calling vibrate() with pattern does not throw', () => {
    expect(() => Vibration.vibrate([0, 100, 100, 100])).not.toThrow();
  });

  test('calling cancel() does not throw', () => {
    expect(() => Vibration.cancel()).not.toThrow();
  });
});

// ─── AppState ────────────────────────────────────────────────────────────────

describe('AppState', () => {
  test('addEventListener is a function', () => {
    expect(typeof AppState.addEventListener).toBe('function');
  });

  test('currentState property exists on AppState', () => {
    // In the RN 0.81 mock, currentState is a jest.fn() (truthy)
    expect(AppState).toHaveProperty('currentState');
  });

  test('addEventListener returns a subscription with remove()', () => {
    const sub = AppState.addEventListener('change', () => {});
    expect(typeof sub.remove).toBe('function');
    sub.remove();
  });

  test('calling addEventListener does not throw', () => {
    expect(() => {
      const sub = AppState.addEventListener('change', () => {});
      sub.remove();
    }).not.toThrow();
  });
});

// ─── StatusBar ───────────────────────────────────────────────────────────────

describe('StatusBar', () => {
  test('setBarStyle is a function', () => {
    expect(typeof StatusBar.setBarStyle).toBe('function');
  });

  test('setBackgroundColor is a function', () => {
    expect(typeof StatusBar.setBackgroundColor).toBe('function');
  });

  test('setHidden is a function', () => {
    expect(typeof StatusBar.setHidden).toBe('function');
  });

  test('setTranslucent is a function', () => {
    expect(typeof StatusBar.setTranslucent).toBe('function');
  });

  test('calling setBarStyle does not throw', () => {
    expect(() => StatusBar.setBarStyle('dark-content')).not.toThrow();
  });

  test('calling setHidden does not throw', () => {
    expect(() => StatusBar.setHidden(true)).not.toThrow();
  });
});

// ─── BackHandler ─────────────────────────────────────────────────────────────

describe('BackHandler', () => {
  test('addEventListener is a function', () => {
    expect(typeof BackHandler.addEventListener).toBe('function');
  });

  test('addEventListener returns subscription with remove()', () => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => false);
    expect(typeof sub.remove).toBe('function');
    sub.remove();
  });

  test('exitApp is a function', () => {
    expect(typeof BackHandler.exitApp).toBe('function');
  });
});

// ─── Share ───────────────────────────────────────────────────────────────────

describe('Share', () => {
  test('share is a function', () => {
    expect(typeof Share.share).toBe('function');
  });

  test('share() returns a Promise', () => {
    const result = Share.share({ message: 'hello' });
    expect(result).toBeInstanceOf(Promise);
    // Don't await — just verify shape
  });

  test('sharedAction constant is defined', () => {
    expect(Share.sharedAction).toBeDefined();
  });

  test('dismissedAction constant is defined', () => {
    expect(Share.dismissedAction).toBeDefined();
  });
});

// ─── AccessibilityInfo ───────────────────────────────────────────────────────

describe('AccessibilityInfo', () => {
  test('isReduceMotionEnabled is a function', () => {
    expect(typeof AccessibilityInfo.isReduceMotionEnabled).toBe('function');
  });

  test('isBoldTextEnabled is a function', () => {
    expect(typeof AccessibilityInfo.isBoldTextEnabled).toBe('function');
  });

  test('isScreenReaderEnabled is a function returning a Promise', async () => {
    expect(typeof AccessibilityInfo.isScreenReaderEnabled).toBe('function');
    const result = AccessibilityInfo.isScreenReaderEnabled();
    expect(result).toBeInstanceOf(Promise);
    const value = await result;
    expect(typeof value).toBe('boolean');
  });

  test('addEventListener is a function', () => {
    expect(typeof AccessibilityInfo.addEventListener).toBe('function');
  });
});

// ─── Keyboard ────────────────────────────────────────────────────────────────

describe('Keyboard', () => {
  test('dismiss is a function', () => {
    expect(typeof Keyboard.dismiss).toBe('function');
  });

  test('addListener is a function', () => {
    expect(typeof Keyboard.addListener).toBe('function');
  });

  test('calling dismiss() does not throw', () => {
    expect(() => Keyboard.dismiss()).not.toThrow();
  });
});

// ─── I18nManager ─────────────────────────────────────────────────────────────

describe('I18nManager', () => {
  test('isRTL is a boolean', () => {
    expect(typeof I18nManager.isRTL).toBe('boolean');
  });

  test('allowRTL is a function', () => {
    expect(typeof I18nManager.allowRTL).toBe('function');
  });

  test('forceRTL is a function', () => {
    expect(typeof I18nManager.forceRTL).toBe('function');
  });
});

// ─── Animated.Value ──────────────────────────────────────────────────────────

describe('Animated.Value', () => {
  test('new Animated.Value(5).__getValue() === 5', () => {
    const val = new Animated.Value(5);
    expect(val.__getValue()).toBe(5);
  });

  test('setValue(10) updates __getValue() to 10', () => {
    const val = new Animated.Value(0);
    val.setValue(10);
    expect(val.__getValue()).toBe(10);
  });

  test('addListener returns an id string', () => {
    const val = new Animated.Value(0);
    const id = val.addListener(() => {});
    expect(typeof id).toBe('string');
    val.removeListener(id);
  });

  test('interpolate() returns a node', () => {
    const val = new Animated.Value(0);
    const node = val.interpolate({ inputRange: [0, 1], outputRange: [0, 100] });
    expect(node).toBeDefined();
    expect(typeof node.__getValue).toBe('function');
  });

  test('interpolate() returns correct value at midpoint', () => {
    const val = new Animated.Value(0.5);
    const node = val.interpolate({ inputRange: [0, 1], outputRange: [0, 100] });
    expect(node.__getValue()).toBe(50);
  });
});

// ─── Animated.timing ─────────────────────────────────────────────────────────

describe('Animated.timing', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('returns object with start()', () => {
    const val = new Animated.Value(0);
    const anim = Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: false });
    expect(typeof anim.start).toBe('function');
  });

  test('callback called with { finished: true } after jest.runAllTimers()', () => {
    const val = new Animated.Value(0);
    const cb = jest.fn();
    Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: false }).start(cb);
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledWith({ finished: true });
    expect(val.__getValue()).toBe(1);
  });
});

// ─── Animated.spring ─────────────────────────────────────────────────────────

describe('Animated.spring', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('returns object with start()', () => {
    const val = new Animated.Value(0);
    const anim = Animated.spring(val, { toValue: 1, useNativeDriver: false });
    expect(typeof anim.start).toBe('function');
  });

  test('callback called with { finished: true } after timer flush', () => {
    const val = new Animated.Value(0);
    const cb = jest.fn();
    Animated.spring(val, { toValue: 1, useNativeDriver: false }).start(cb);
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

// ─── Animated.parallel / sequence ────────────────────────────────────────────

describe('Animated.parallel', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('returns object with start()', () => {
    const val = new Animated.Value(0);
    const anim = Animated.parallel([
      Animated.timing(val, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]);
    expect(typeof anim.start).toBe('function');
  });

  test('callback called after timer flush', () => {
    const val = new Animated.Value(0);
    const cb = jest.fn();
    Animated.parallel([
      Animated.timing(val, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start(cb);
    jest.runAllTimers();
    expect(cb).toHaveBeenCalled();
  });
});

describe('Animated.sequence', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('returns object with start()', () => {
    const val = new Animated.Value(0);
    const anim = Animated.sequence([
      Animated.timing(val, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]);
    expect(typeof anim.start).toBe('function');
  });
});

// ─── Animated.add / multiply ─────────────────────────────────────────────────

describe('Animated.add / multiply', () => {
  test('Animated.add returns a derived animated node', () => {
    const a = new Animated.Value(2);
    const b = new Animated.Value(3);
    const sum = Animated.add(a, b);
    expect(sum).toBeDefined();
    expect(typeof sum.__getValue).toBe('function');
    expect(sum.__getValue()).toBe(5);
  });

  test('Animated.multiply returns a derived animated node', () => {
    const a = new Animated.Value(4);
    const b = new Animated.Value(5);
    const product = Animated.multiply(a, b);
    expect(product).toBeDefined();
    expect(typeof product.__getValue).toBe('function');
    expect(product.__getValue()).toBe(20);
  });
});

// ─── processColor ────────────────────────────────────────────────────────────

describe('processColor', () => {
  test('processColor("red") returns a number', () => {
    const result = processColor('red');
    expect(typeof result).toBe('number');
  });

  test('processColor("#fff") returns a number', () => {
    const result = processColor('#fff');
    expect(typeof result).toBe('number');
  });

  test('processColor("#FF0000") returns a number', () => {
    const result = processColor('#FF0000');
    expect(typeof result).toBe('number');
  });

  test('processColor("red") returns ARGB 0xFFFF0000', () => {
    expect(processColor('red')).toBe(0xFFFF0000);
  });

  test('processColor("#fff") returns ARGB 0xFFFFFFFF', () => {
    expect(processColor('#fff')).toBe(0xFFFFFFFF);
  });
});
