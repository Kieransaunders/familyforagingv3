import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
// AsyncStorage mock to satisfy Zustand persistence in tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
