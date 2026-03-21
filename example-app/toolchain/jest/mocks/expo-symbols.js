// Minimal expo-symbols stub for Jest.
// SymbolView is a native iOS component; replace it with a plain View so tests
// can render and query it without a native bridge.
const React = require('react');
const { View } = require('react-native');

const SymbolView = ({ name, style, children }) =>
  React.createElement(View, { accessibilityLabel: name, style }, children);

module.exports = { SymbolView };
