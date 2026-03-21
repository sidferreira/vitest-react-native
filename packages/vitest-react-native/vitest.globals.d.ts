import type { Mock as VitestMock } from 'vitest'

declare global {
  var jest: {
    mock: typeof import('vitest').vi.mock
    fn: typeof import('vitest').vi.fn
    spyOn: typeof import('vitest').vi.spyOn
    clearAllMocks: typeof import('vitest').vi.clearAllMocks
    resetAllMocks: typeof import('vitest').vi.resetAllMocks
    restoreAllMocks: typeof import('vitest').vi.restoreAllMocks
    clearMocks: () => void
    useFakeTimers: typeof import('vitest').vi.useFakeTimers
    useRealTimers: typeof import('vitest').vi.useRealTimers
    runAllTimers: typeof import('vitest').vi.runAllTimers
    advanceTimersByTime: typeof import('vitest').vi.advanceTimersByTime
  }

  namespace jest {
    // Alias so `as jest.Mock` casts compile without @types/jest
    type Mock<T = any, Y extends any[] = any> = VitestMock
    type SpyInstance<T = any, Y extends any[] = any> = VitestMock
  }
}

export {}
