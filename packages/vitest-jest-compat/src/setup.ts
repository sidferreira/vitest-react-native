import { vi, afterEach } from 'vitest'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

// With isolate:false, test files share a fork. Fake timers left installed by
// one file block the next file's renderHook/act from ever settling. Always
// restore real timers and flush pending fake ones after every test so nothing
// leaks across file boundaries.
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

const _thisFile = fileURLToPath(import.meta.url)

globalThis.jest = {
  // ── Module mocking ──────────────────────────────────────────────────────────
  mock:                vi.mock,
  unmock:              vi.unmock,
  doMock:              vi.doMock,
  dontMock:            vi.doUnmock,
  resetModules:        vi.resetModules,
  isolateModules:      (fn: () => void) => { fn(); return globalThis.jest },
  isolateModulesAsync: (fn: () => Promise<void>) => fn(),
  requireActual: (id: string) => {
    let callerDir = process.cwd()
    for (const line of (new Error().stack?.split('\n') ?? []).slice(2)) {
      if (line.includes('node:internal') || line.includes('node:vm')) continue
      const m = line.match(/\((.+):\d+:\d+\)/) ?? line.match(/at (.+):\d+:\d+/)
      if (!m?.[1]) continue
      const framePath = m[1]
      if (framePath.startsWith('node:') || framePath === _thisFile) continue
      callerDir = dirname(framePath)
      break
    }
    let resolved: string
    try { resolved = require.resolve(id, { paths: [callerDir] }) }
    catch { try { resolved = require.resolve(id) } catch { return require(id) } }
    const map = (globalThis as any).__realExportsMap__
    if (map?.has(resolved)) return map.get(resolved)
    return require(resolved)
  },
  requireMock:         (id: string) => require(id),
  setMock:             () => {},
  createMockFromModule: () => ({}),
  genMockFromModule:   () => ({}),   // deprecated alias of createMockFromModule
  deepUnmock:          () => globalThis.jest,
  disableAutomock:     () => globalThis.jest, // no-op: automocking is not a Vitest concept
  enableAutomock:      () => globalThis.jest,
  autoMockOff:         () => globalThis.jest,
  autoMockOn:          () => globalThis.jest,

  // ── Mock functions & spies ──────────────────────────────────────────────────
  fn:                  vi.fn,
  spyOn:               vi.spyOn,
  mocked:              vi.mocked,
  isMockFunction:      vi.isMockFunction,
  replaceProperty:     (_obj: object, _key: PropertyKey, _value: unknown) => ({ restore: () => {} }),
  clearAllMocks:       vi.clearAllMocks,
  resetAllMocks:       vi.resetAllMocks,
  restoreAllMocks:     vi.restoreAllMocks,
  clearMocks:          () => vi.clearAllMocks(),

  // ── Timers ──────────────────────────────────────────────────────────────────
  useFakeTimers:               vi.useFakeTimers,
  useRealTimers:               vi.useRealTimers,
  runAllTimers:                vi.runAllTimers,
  runAllTimersAsync:           vi.runAllTimersAsync,
  runAllTicks:                 vi.runAllTicks,
  runAllImmediates:            () => {}, // no-op: legacy fake timers only, not in Vitest
  runOnlyPendingTimers:        vi.runOnlyPendingTimers,
  runOnlyPendingTimersAsync:   vi.runOnlyPendingTimersAsync,
  advanceTimersByTime:         vi.advanceTimersByTime,
  advanceTimersByTimeAsync:    vi.advanceTimersByTimeAsync,
  advanceTimersToNextTimer:    vi.advanceTimersToNextTimer,
  advanceTimersToNextTimerAsync: vi.advanceTimersToNextTimerAsync,
  clearAllTimers:              vi.clearAllTimers,
  getTimerCount:               vi.getTimerCount,
  setSystemTime:               vi.setSystemTime,
  getRealSystemTime:           vi.getRealSystemTime,
  now:                         () => Date.now(),

  // ── Config / misc ───────────────────────────────────────────────────────────
  setTimeout:            (ms: number) => { vi.setConfig({ testTimeout: ms }) },
  retryTimes:            () => globalThis.jest, // no-op: retry is not in RuntimeConfig
  getSeed:               () => 0,
  isEnvironmentTornDown: () => false,
} as unknown as typeof jest
