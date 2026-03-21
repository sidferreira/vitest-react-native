import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { Collapsible } from './Collapsible'


describe('Collapsible', () => {
  it('shows title in collapsed state', () => {
    render(<Collapsible title="My Section"><Text>content</Text></Collapsible>)
    expect(screen.getByText('My Section')).toBeTruthy()
  })

  it('hides children on mount', () => {
    render(
      <Collapsible title="Section"><Text>hidden content</Text></Collapsible>
    )
    expect(screen.queryByText('hidden content')).toBeNull()
  })

  it('shows children after pressing the header', () => {
    render(
      <Collapsible title="Section"><Text>revealed content</Text></Collapsible>
    )
    fireEvent.press(screen.UNSAFE_getByType(TouchableOpacity))
    expect(screen.getByText('revealed content')).toBeTruthy()
  })

  it('hides children again on second press', () => {
    render(
      <Collapsible title="Section"><Text>toggle content</Text></Collapsible>
    )
    const btn = screen.UNSAFE_getByType(TouchableOpacity)
    fireEvent.press(btn)
    fireEvent.press(btn)
    expect(screen.queryByText('toggle content')).toBeNull()
  })
})
