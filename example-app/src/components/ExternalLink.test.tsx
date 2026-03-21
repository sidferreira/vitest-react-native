import React from 'react'
import { Text, Platform } from 'react-native'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { ExternalLink } from './ExternalLink'
import { openBrowserAsync } from 'expo-web-browser'

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }))

describe('ExternalLink', () => {
  it('renders children', () => {
    render(<ExternalLink href="https://example.com"><Text>click me</Text></ExternalLink>)
    expect(screen.getByText('click me')).toBeTruthy()
  })

  it('calls openBrowserAsync on native press', async () => {
    render(
      <ExternalLink href="https://example.com"><Text>open</Text></ExternalLink>
    )
    await fireEvent.press(screen.getByText('open'))
    expect(openBrowserAsync).toHaveBeenCalledWith('https://example.com')
  })

  it('calls window.open on web press', async () => {
    const originalOS = Platform.OS
    Platform.OS = 'web'
    const windowOpen = jest.fn()
    global.window = { open: windowOpen } as any

    render(
      <ExternalLink href="https://example.com"><Text>open web</Text></ExternalLink>
    )
    await fireEvent.press(screen.getByText('open web'))
    expect(windowOpen).toHaveBeenCalledWith('https://example.com', '_blank')

    Platform.OS = originalOS
  })
})
