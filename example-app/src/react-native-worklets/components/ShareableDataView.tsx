import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { makeShareable, makeShareableCloneRecursive, isShareableRef } from 'react-native-worklets';

interface SharedItem {
  value: string;
  ref: unknown;
}

export function ShareableDataView() {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<SharedItem[]>([]);
  const [lastShared, setLastShared] = useState<unknown>(null);

  const handleAdd = () => {
    if (!inputValue) return;
    const ref = makeShareable({ value: inputValue });
    setItems((prev) => [...prev, { value: inputValue, ref }]);
    setLastShared(ref);
    setInputValue('');
  };

  const handleShareAll = () => {
    const cloned = makeShareableCloneRecursive(items.map((i) => i.ref));
    setLastShared(cloned);
  };

  return (
    <View>
      <TextInput testID="item-input" value={inputValue} onChangeText={setInputValue} />
      <Pressable testID="add-btn" onPress={handleAdd}>
        <Text>Add</Text>
      </Pressable>
      <Pressable testID="share-all-btn" onPress={handleShareAll}>
        <Text>Share All</Text>
      </Pressable>
      {items.map((item, i) => (
        <View key={i} testID={`item-${i}`}>
          <Text testID={`item-value-${i}`}>{item.value}</Text>
          <Text testID={`item-shared-${i}`}>{isShareableRef(item.ref) ? 'shared' : 'local'}</Text>
        </View>
      ))}
      {lastShared !== null && (
        <Text testID="last-shared">{JSON.stringify(lastShared)}</Text>
      )}
    </View>
  );
}
