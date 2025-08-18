import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LogFindScreen from '../src/screens/LogFindScreen';
import { useForagingStore } from '../src/state/foraging-store';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(async () => []),
}));

describe('LogFindScreen (edit via id)', () => {
  beforeEach(() => {
    // Reset store between tests
    useForagingStore.setState({ finds: [] });
  });

  it('preloads existing find data when editFindId is provided', () => {
    const existingFind = {
      id: 'f1',
      name: 'Wild Garlic',
      category: 'herb',
      location: { latitude: 51.5, longitude: -0.12 },
      dateFound: new Date('2024-05-01T00:00:00Z'),
      notes: 'Tastes great in pesto',
      photos: [],
      season: 'spring',
      habitat: 'Woodland',
      userId: 'u1',
      tags: [],
      harvestMonths: { jan:false,feb:false,mar:true,apr:true,may:true,jun:false,jul:false,aug:false,sep:false,oct:false,nov:false,dec:false },
    } as const;

    useForagingStore.setState({ finds: [existingFind as any] });

    render(
      <LogFindScreen
        navigation={{ goBack: jest.fn() }}
        route={{ params: { editFindId: 'f1' } }}
      />
    );

    // Name and notes populated from existing find
    expect(screen.getByDisplayValue('Wild Garlic')).toBeTruthy();
    expect(screen.getByDisplayValue('Tastes great in pesto')).toBeTruthy();
  });
});

