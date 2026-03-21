import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ThemedText } from './ThemedText'

describe('ThemedText', () => {
  it('renders default type', () => {
    render(<ThemedText>Hello</ThemedText>)
    expect(screen.getByText('Hello')).toBeTruthy()
  })

  it('renders title type with fontSize 32', () => {
    render(<ThemedText type="title">Big Title</ThemedText>)
    expect(screen.getByText('Big Title')).toHaveStyle({ fontSize: 32 })
  })

  it('renders defaultSemiBold type with fontWeight 600', () => {
    render(<ThemedText type="defaultSemiBold">Bold</ThemedText>)
    expect(screen.getByText('Bold')).toHaveStyle({ fontWeight: '600' })
  })

  it('renders subtitle type', () => {
    render(<ThemedText type="subtitle">Sub</ThemedText>)
    expect(screen.getByText('Sub')).toBeTruthy()
  })

  it('renders link type', () => {
    render(<ThemedText type="link">Link</ThemedText>)
    expect(screen.getByText('Link')).toBeTruthy()
  })

  it('applies custom lightColor', () => {
    render(<ThemedText lightColor="#ff0000">Custom</ThemedText>)
    expect(screen.getByText('Custom')).toHaveStyle({ color: '#ff0000' })
  })
})
