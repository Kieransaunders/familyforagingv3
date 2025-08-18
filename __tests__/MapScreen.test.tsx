import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

// Mock expo-location per test cases
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Medium: 'Medium' },
  impactAsync: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Render a simple placeholder host component for OfflineBanner
jest.mock('../src/components/OfflineBanner', () => 'OfflineBanner');

// Silence RN WebView by using our mock implementation
jest.mock('react-native-webview');

// Mock navigation focus effect to avoid requiring a NavigationContainer
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: () => undefined,
  };
});

// Import the screen after mocks are set up
import MapScreen from '../src/screens/MapScreen';

describe('MapScreen', () => {
  const navigation: any = { navigate: jest.fn() };
  const Location = require('expo-location');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows location loading state before position resolves', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    // Never resolves to stay in loading UI
    Location.getCurrentPositionAsync.mockImplementation(() => new Promise(() => {}));

    render(<MapScreen navigation={navigation} />);
    expect(screen.getByText('Finding your location...')).toBeTruthy();
  });

  it('shows error UI when permission is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    render(<MapScreen navigation={navigation} />);

    expect(await screen.findByText('Location Access Required')).toBeTruthy();
    expect(
      screen.getByText('Permission to access location was denied')
    ).toBeTruthy();
  });

  it('renders the map after getting location', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 51.5, longitude: -0.12 },
    });

    const { getByTestId } = render(<MapScreen navigation={navigation} />);

    // Wait for WebView to appear (from SimpleMap)
    await waitFor(() => {
      expect(getByTestId('webview')).toBeTruthy();
    });
  });
});
