// Stub for expo-web-browser — tests always vi.mock() this module anyway,
// so this file just needs to exist to prevent Vite from resolving the real
// package (which pulls in expo-modules-core/src/index.ts → OXC TS error).
module.exports = {
  openBrowserAsync: () => Promise.resolve({ type: 'cancel' }),
  dismissBrowser: () => {},
  openAuthSessionAsync: () => Promise.resolve({ type: 'cancel' }),
  dismissAuthSession: () => {},
  WebBrowserResultType: { CANCEL: 'cancel', DISMISS: 'dismiss', OPENED: 'opened' },
};
