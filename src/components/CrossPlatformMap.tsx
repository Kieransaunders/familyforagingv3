import React, { useState } from 'react';
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
  const [hasError, setHasError] = useState(false);
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
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .error-container { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            flex-direction: column;
            background: #f3f4f6;
            color: #374151;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .error-icon { font-size: 48px; margin-bottom: 16px; }
          .error-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
          .error-message { font-size: 14px; text-align: center; opacity: 0.7; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div id="error" class="error-container" style="display: none;">
          <div class="error-icon">🗺️</div>
          <div class="error-title">Map temporarily unavailable</div>
          <div class="error-message">Please check your connection and try again</div>
        </div>
        <script>
          try {
            // Simple fallback map without external dependencies
            var mapContainer = document.getElementById('map');
            var errorContainer = document.getElementById('error');
            
            // Create a simple grid-based map as fallback
            mapContainer.innerHTML = \`
              <div style="
                height: 100vh; 
                width: 100vw; 
                background: #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              ">
                <div style="font-size: 48px; margin-bottom: 16px;">📍</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                  Location: ${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}
                </div>
                <div style="font-size: 14px; color: #6b7280; text-align: center; max-width: 280px;">
                  Tap anywhere to place a pin or view your finds
                </div>
              </div>
            \`;
            
            // Handle map clicks for fallback
            mapContainer.addEventListener('click', function(e) {
              // Calculate approximate coordinates based on click position
              var rect = mapContainer.getBoundingClientRect();
              var x = (e.clientX - rect.left) / rect.width;
              var y = (e.clientY - rect.top) / rect.height;
              
              // Simple coordinate calculation (not accurate but functional)
              var lat = ${initialRegion.latitude} + (0.5 - y) * 0.01;
              var lng = ${initialRegion.longitude} + (x - 0.5) * 0.01;
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapPress',
                nativeEvent: {
                  coordinate: {
                    latitude: lat,
                    longitude: lng
                  }
                }
              }));
            });

            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
              try {
                var data = JSON.parse(event.data);
                if (data.type === 'centerMap') {
                  // Update the displayed coordinates
                  var locationText = mapContainer.querySelector('[style*="font-weight: 600"]');
                  if (locationText) {
                    locationText.textContent = 'Location: ' + data.latitude.toFixed(4) + ', ' + data.longitude.toFixed(4);
                  }
                }
              } catch (error) {
                console.error('Error parsing message:', error);
              }
            });
            
          } catch (error) {
            console.error('Map initialization error:', error);
            document.getElementById('error').style.display = 'flex';
            document.getElementById('map').style.display = 'none';
          }
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

  const handleWebViewError = () => {
    setHasError(true);
  };

  const handleLoadEnd = () => {
    // Reset error state on successful load
    setHasError(false);
  };

  if (hasError) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
          Map temporarily unavailable
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', color: '#6b7280', paddingHorizontal: 20 }}>
          Please check your connection and restart the app
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={mapRef}
      style={style}
      source={{ html: generateMapHTML() }}
      onMessage={handleMessage}
      onError={handleWebViewError}
      onHttpError={handleWebViewError}
      onLoadEnd={handleLoadEnd}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      geolocationEnabled={false}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }]}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📍</Text>
          <Text style={{ fontSize: 16, color: '#374151' }}>Loading map...</Text>
        </View>
      )}
    />
  );
};

export default CrossPlatformMap;