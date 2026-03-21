import { renderHook } from '@testing-library/react-native'
import { useThemeColor } from './useThemeColor'

// useColorScheme() returns null in tests (NativeAppearance TurboModule has no native impl),
// so the hook always defaults to 'light' — no mock needed.

describe('useThemeColor', () => {
  it('returns Colors.light.text when no override (scheme null defaults to light)', () => {
    const { result } = renderHook(() => useThemeColor({}, 'text'))
    expect(result.current).toBe('#11181C')
  })

  it('returns lightColor prop override instead of theme color', () => {
    const { result } = renderHook(() => useThemeColor({ light: '#abcdef' }, 'text'))
    expect(result.current).toBe('#abcdef')
  })

  it('ignores darkColor prop when scheme defaults to light', () => {
    const { result } = renderHook(() => useThemeColor({ light: '#aaa', dark: '#bbb' }, 'text'))
    expect(result.current).toBe('#aaa')
  })
})
