import React from 'react';
import { Platform, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

// Define Region interface
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapMarker {
  id: string;
  coordinate: { latitude: number; longitude: number };
  title: string;
  description?: string;
  pinColor?: string;
  onPress?: () => void;
}

interface CrossPlatformMapProps {
  style?: any;
  initialRegion: Region;
  markers?: MapMarker[];
  onPress?: (event: any) => void;
  showsUserLocation?: boolean;
  mapRef?: React.RefObject<any>;
}

const CrossPlatformMap: React.FC<CrossPlatformMapProps> = ({
  style,
  initialRegion,
  markers = [],
  onPress,
  showsUserLocation = false,
  mapRef,
}) => {
  const generateMapHTML = () => {
    const markersHTML = markers.map(marker => `
      L.marker([${marker.coordinate.latitude}, ${marker.coordinate.longitude}])
        .addTo(map)
        .bindPopup(\`<div style="padding: 8px;">
          <div style="font-weight: 600; color: #111827;">${marker.title}</div>
          ${marker.description ? `<div style="font-size: 14px; color: #6b7280;">${marker.description}</div>` : ''}
        </div>\`)
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress',
            markerId: '${marker.id}'
          }));
        });
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          ${markersHTML}
          
          ${showsUserLocation ? `
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              L.marker([position.coords.latitude, position.coords.longitude])
                .addTo(map)
                .bindPopup('Your location');
            });
          }
          ` : ''}
          
          map.on('click', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapPress',
              nativeEvent: {
                coordinate: {
                  latitude: e.latlng.lat,
                  longitude: e.latlng.lng
                }
              }
            }));
          });

          // Listen for messages from React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'centerMap') {
                map.setView([data.latitude, data.longitude], data.zoom || 15);
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress' && onPress) {
        onPress(data);
      } else if (data.type === 'markerPress') {
        const marker = markers.find(m => m.id === data.markerId);
        if (marker && marker.onPress) {
          marker.onPress();
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <WebView
      ref={mapRef}
      style={style}
      source={{ html: generateMapHTML() }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      geolocationEnabled={true}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
    />
  );
};

export default CrossPlatformMap;