const flowRemoveTypes = require("flow-remove-types");

/**
 * Strips all Flow type annotations from a react-native source file.
 *
 * Two-step process:
 *  1. Pre-process: replace `component Foo(` → `function Foo(`
 *     flow-remove-types leaves the `component` keyword in output — esbuild
 *     cannot parse it.
 *  2. flow-remove-types: strips all remaining Flow annotations, replacing
 *     removed content with whitespace to preserve line count.
 *
 * Returns code unchanged when no @flow annotation is found (fast path for the
 * ~85% of react-native files that are already plain JS).
 */
function stripFlow(code) {
  if (!code.includes('@flow')) return code;
  const preprocessed = code.replace(
    /\bcomponent\s+(\w+)\s*\(/g,
    'function $1(',
  );
  return String(flowRemoveTypes(preprocessed));
}

module.exports = {
  stripFlow,
  default: stripFlow
}
