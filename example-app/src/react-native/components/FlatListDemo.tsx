import React from 'react';
import { FlatList, Text, View } from 'react-native';

interface Item {
  id: string;
  label: string;
}

interface Props {
  items?: Item[];
}

const DEFAULT_ITEMS: Item[] = [
  { id: '1', label: 'Alpha' },
  { id: '2', label: 'Beta' },
  { id: '3', label: 'Gamma' },
];

export function FlatListDemo({ items = DEFAULT_ITEMS }: Props) {
  return (
    <FlatList
      testID="flat-list"
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View testID={`item-${item.id}`}>
          <Text testID={`label-${item.id}`}>{item.label}</Text>
        </View>
      )}
    />
  );
}
