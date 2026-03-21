// Jest mock for expo-haptics.
// HapticTab and other components use these for haptic feedback — stub them
// so tests can verify calls without triggering any native module.
module.exports = {
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactOccurred: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
};
