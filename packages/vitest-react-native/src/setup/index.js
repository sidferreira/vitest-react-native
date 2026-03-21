/**
 * Entry point for vitest-react-native setup.
 *
 * Selects the setup path based on the installed react-native version:
 * - RN >= 0.81: react-native@0.81/ (pirates pipeline + globals + mocks)
 * - RN >= 0.73: react-native@0.73/ (legacy self-contained setup)
 */

const rnVersion = require('react-native/package.json').version;

function toVersionInt(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return major * 1_000_000 + minor * 1_000 + patch;
}

function isAtLeast(version) {
  return toVersionInt(rnVersion) >= toVersionInt(version);
}

if (isAtLeast('0.81.0')) {
  require('./react-native@0.81');
} else {
  require('./react-native@0.73');
}
