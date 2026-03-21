require('react-native-reanimated').setUpTests();

const _rn = require('react-native');

// Platform: RN's NativeModules mock for PlatformConstants only includes
// reactNativeVersion; isTesting and osVersion (Platform.Version) are missing.
// Patch the constants cache directly so Platform.isTesting and Platform.Version
// return sensible values in tests.
Object.assign(_rn.Platform.constants, {
  isTesting: true,
  osVersion: '17.0',
  systemName: 'iOS',
  interfaceIdiom: 'handset',
  forceTouchAvailable: false,
});

// InteractionManager: make runAfterInteractions synchronous so tests don't
// need to flush async queues (setImmediate) to observe the callback.
jest.spyOn(_rn.InteractionManager, 'runAfterInteractions').mockImplementation((task) => {
  if (typeof task === 'function') task();
  else if (task && typeof task.gen === 'function') task.gen().next();
  return { cancel: jest.fn() };
});

// Share: NativeActionSheetManager isn't available in the test environment on iOS.
// Provide a resolved mock so Share.share() returns a Promise without crashing.
jest.spyOn(_rn.Share, 'share').mockResolvedValue({ action: _rn.Share.sharedAction });

// Linking
jest.spyOn(require('react-native').Linking, 'getInitialURL').mockResolvedValue(null)
jest.spyOn(require('react-native').Linking, 'canOpenURL').mockResolvedValue(true)
jest.spyOn(require('react-native').Linking, 'openURL').mockResolvedValue(undefined)
jest.spyOn(require('react-native').Linking, 'addEventListener').mockReturnValue({ remove: jest.fn() })

// AccessibilityInfo
jest.spyOn(require('react-native').AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false)
jest.spyOn(require('react-native').AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
jest.spyOn(require('react-native').AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(false)
jest.spyOn(require('react-native').AccessibilityInfo, 'isGrayscaleEnabled').mockResolvedValue(false)
jest.spyOn(require('react-native').AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() })

// AppState
jest.spyOn(require('react-native').AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() })

// Keyboard
jest.spyOn(require('react-native').Keyboard, 'dismiss').mockImplementation(() => {})
jest.spyOn(require('react-native').Keyboard, 'addListener').mockReturnValue({ remove: jest.fn() })

// Vibration
jest.spyOn(require('react-native').Vibration, 'vibrate').mockImplementation(() => {})
jest.spyOn(require('react-native').Vibration, 'cancel').mockImplementation(() => {})

// LayoutAnimation
jest.spyOn(require('react-native').LayoutAnimation, 'configureNext').mockImplementation(() => {})
