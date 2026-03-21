import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { HelloWave } from './HelloWave'

describe('HelloWave', () => {
  it('renders without crash', () => {
    render(<HelloWave />)
    expect(screen.toJSON()).toBeTruthy()
  })

  it('renders the wave emoji', () => {
    render(<HelloWave />)
    expect(screen.getByText('👋')).toBeTruthy()
  })
})
