import React from 'react'
import { View } from 'react-native'

export const SymbolView = ({ name, style }: any) => (
  <View accessibilityLabel={name} style={style} />
)
