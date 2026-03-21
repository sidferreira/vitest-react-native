import React from 'react';
import { SectionList, Text, View } from 'react-native';

interface Section {
  title: string;
  data: string[];
}

interface Props {
  sections?: Section[];
}

const DEFAULT_SECTIONS: Section[] = [
  { title: 'Fruits', data: ['Apple', 'Banana'] },
  { title: 'Veggies', data: ['Carrot', 'Daikon'] },
];

export function SectionListDemo({ sections = DEFAULT_SECTIONS }: Props) {
  return (
    <SectionList
      testID="section-list"
      sections={sections}
      keyExtractor={(item, index) => `${item}-${index}`}
      renderSectionHeader={({ section }) => (
        <View testID={`header-${section.title}`}>
          <Text testID={`header-title-${section.title}`}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View testID={`row-${item}`}>
          <Text>{item}</Text>
        </View>
      )}
    />
  );
}
