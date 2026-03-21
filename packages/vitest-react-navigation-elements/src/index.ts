import type { Plugin } from 'vite';

export default function reactNavigationElementsPlugin(): Plugin {
  return {
    name: 'vitest-react-navigation-elements',
    enforce: 'pre',
    resolveId(id, importer) {
      // Stub PNG assets imported by @react-navigation packages so Node's ESM
      // loader doesn't choke on them. The real module is loaded normally.
      if (
        id.endsWith('.png') &&
        importer?.includes('@react-navigation')
      ) {
        return '\0react-navigation-asset:' + id;
      }
    },
    load(id) {
      if (id.startsWith('\0react-navigation-asset:')) {
        return 'export default 0;';
      }
      return null;
    },
  };
}
