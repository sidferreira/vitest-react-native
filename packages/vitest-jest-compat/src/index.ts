import { fileURLToPath } from 'url'
import { resolve } from 'path'
import type { Plugin } from 'vite'

const setupFile = resolve(fileURLToPath(import.meta.url), '..', 'setup.ts')

export default function jestCompatPlugin(): Plugin {
  return {
    name: 'vitest-jest-compat',
    enforce: 'pre',
    config: () => ({
      test: { setupFiles: [setupFile] },
    }),
    transform(code, id) {
      if (!id.includes('.test.')) return null
      return { code: code.replace(/\bjest\.mock\(/g, 'vi.mock(') }
    },
  }
}
