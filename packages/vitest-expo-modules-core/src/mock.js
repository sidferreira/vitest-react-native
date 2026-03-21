// Stub for expo-modules-core used during Vitest static module analysis.
// expo-web-browser is always vi.mock()ed in tests so this is never executed at runtime.
module.exports = {
  requireNativeModule: (name) => {
    if (name === 'ExpoFontLoader') {
      // Return all font families that @expo/vector-icons uses so isLoadedNative() returns true.
      return { getLoadedFonts: () => ['material', 'MaterialIcons', 'Ionicons', 'FontAwesome', 'Feather', 'AntDesign', 'Entypo', 'EvilIcons', 'Foundation', 'MaterialCommunityIcons', 'Octicons', 'SimpleLineIcons', 'Zocial'], loadAsync: () => Promise.resolve() };
    }
    if (name === 'ExpoAsset') {
      return { downloadAsync: () => Promise.resolve() };
    }
    return {};
  },
  requireOptionalNativeModule: () => null,
  NativeModulesProxy: {},
  EventEmitter: class EventEmitter {
    addListener() { return { remove() {} }; }
    removeAllListeners() {}
    emit() {}
  },
  Platform: { OS: 'ios', select: (spec) => spec.ios ?? spec.default },
  CodedError: class CodedError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  },
  UnavailabilityError: class UnavailabilityError extends Error {
    constructor(moduleName, propertyName) { super(`${moduleName}.${propertyName} is not available`); }
  },
};
