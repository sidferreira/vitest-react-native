// Stub Expo's import.meta registry before jest-expo's lazy getter fires,
// preventing jest@30 "outside scope" errors in the test environment.
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  value: { url: null },
  configurable: false,
  writable: false,
  enumerable: true,
});
