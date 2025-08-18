import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SimpleMap from '../src/components/SimpleMap';

describe('SimpleMap - basic rendering and errors', () => {
  const baseProps = {
    initialRegion: {
      latitude: 51.5,
      longitude: -0.12,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
  } as const;

  it('shows friendly error UI when WebView errors', () => {
    const { getByTestId } = render(<SimpleMap {...(baseProps as any)} />);
    const webview = getByTestId('webview');
    // Trigger WebView onError
    fireEvent(webview, 'onError');
    expect(screen.getByText('Map temporarily unavailable')).toBeTruthy();
    expect(
      screen.getByText('Please check your connection and restart the app')
    ).toBeTruthy();
  });
});

describe('SimpleMap - messages from WebView', () => {
  const baseProps = {
    initialRegion: {
      latitude: 51.5,
      longitude: -0.12,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
  } as const;

  it('invokes marker onPress when receiving markerPress', () => {
    const onMarkerPress = jest.fn();
    const markers = [
      {
        id: 'm1',
        coordinate: { latitude: 51.5, longitude: -0.12 },
        title: 'Marker 1',
        onPress: onMarkerPress,
      },
    ];
    const { getByTestId } = render(
      <SimpleMap {...(baseProps as any)} markers={markers as any} />
    );
    const webview = getByTestId('webview');
    fireEvent(webview, 'onMessage', {
      nativeEvent: {
        data: JSON.stringify({ type: 'markerPress', markerId: 'm1' }),
      },
    });
    expect(onMarkerPress).toHaveBeenCalled();
  });

  it('forwards map press and long-press events to callbacks', () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <SimpleMap
        {...(baseProps as any)}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
    const webview = getByTestId('webview');

    // Simulate map press
    fireEvent(webview, 'onMessage', {
      nativeEvent: {
        data: JSON.stringify({
          type: 'mapPress',
          nativeEvent: { coordinate: { latitude: 1, longitude: 2 } },
        }),
      },
    });
    expect(onPress).toHaveBeenCalled();

    // Simulate map long-press
    fireEvent(webview, 'onMessage', {
      nativeEvent: {
        data: JSON.stringify({
          type: 'mapLongPress',
          nativeEvent: { coordinate: { latitude: 3, longitude: 4 } },
        }),
      },
    });
    expect(onLongPress).toHaveBeenCalled();
  });
});
