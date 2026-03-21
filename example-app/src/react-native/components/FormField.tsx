import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

interface FormFieldProps {
  label?: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
}

export function FormField({ label = 'Field', placeholder = '', onSubmit }: FormFieldProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('This field is required');
      return;
    }
    setError('');
    onSubmit?.(trimmed);
    setValue('');
  };

  const handleClear = () => {
    setValue('');
    setError('');
  };

  return (
    <View>
      <Text testID="field-label">{label}</Text>
      <TextInput
        testID="field-input"
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
      />
      {error ? <Text testID="error-msg">{error}</Text> : null}
      <Pressable testID="submit-btn" onPress={handleSubmit}>
        <Text>Submit</Text>
      </Pressable>
      <Pressable testID="clear-btn" onPress={handleClear}>
        <Text>Clear</Text>
      </Pressable>
    </View>
  );
}
