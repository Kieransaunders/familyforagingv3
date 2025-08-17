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
    // Generate marker divs for the fallback map
    const markersHTML = markers.map(marker => {
      // Calculate relative position on map (simplified positioning)
      const relativeX = 50; // Center for now - could be calculated based on coordinates
      const relativeY = 50;
      
      return `
        <div 
          class="map-marker" 
          data-marker-id="${marker.id}"
          style="
            position: absolute;
            left: ${relativeX}%;
            top: ${relativeY}%;
            transform: translate(-50%, -100%);
            cursor: pointer;
            z-index: 10;
          "
          onclick="handleMarkerClick('${marker.id}')"
        >
          <div style="
            background: ${marker.pinColor || '#ef4444'};
            width: 20px;
            height: 20px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: 25px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            display: none;
          " class="marker-popup">
            <div style="font-weight: 600; color: #111827;">${marker.title}</div>
            ${marker.description ? `<div style="font-size: 11px; color: #6b7280;">${marker.description}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

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
            
            // Create a map with OpenStreetMap tiles
            mapContainer.innerHTML = \`
              <div id="mapView" style="
                height: 100vh; 
                width: 100vw; 
                background-color: #f3f4f6;
                position: relative;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              ">
                <!-- Center location info -->
                <div style="
                  position: absolute;
                  top: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(255,255,255,0.9);
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 600;
                  color: #374151;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  z-index: 5;
                " id="location-display">
                  📍 ${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}
                </div>
                
                <!-- Instructions -->
                <div style="
                  position: absolute;
                  bottom: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(255,255,255,0.9);
                  padding: 8px 16px;
                  border-radius: 12px;
                  font-size: 12px;
                  color: #6b7280;
                  text-align: center;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  z-index: 5;
                ">
                  Tap anywhere to place a pin
                </div>
                
                <!-- Markers -->
                ${markersHTML}
              </div>
            \`;
            
            // Load map tiles
            function loadMapTiles() {
              const mapView = document.getElementById('mapView');
              const lat = ${initialRegion.latitude};
              const lng = ${initialRegion.longitude};
              const zoom = 13;
              
              // Calculate tile coordinates
              function deg2num(lat_deg, lon_deg, zoom) {
                const lat_rad = lat_deg * Math.PI / 180.0;
                const n = Math.pow(2.0, zoom);
                const xtile = Math.floor((lon_deg + 180.0) / 360.0 * n);
                const ytile = Math.floor((1.0 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2.0 * n);
                return {x: xtile, y: ytile};
              }
              
              const centerTile = deg2num(lat, lng, zoom);
              const tileSize = 256;
              const tilesWide = Math.ceil(window.innerWidth / tileSize) + 2;
              const tilesHigh = Math.ceil(window.innerHeight / tileSize) + 2;
              
              const startX = centerTile.x - Math.floor(tilesWide / 2);
              const startY = centerTile.y - Math.floor(tilesHigh / 2);
              
              // Add map tiles
              for (let x = 0; x < tilesWide; x++) {
                for (let y = 0; y < tilesHigh; y++) {
                  const tileX = startX + x;
                  const tileY = startY + y;
                  
                  if (tileX >= 0 && tileY >= 0 && tileX < Math.pow(2, zoom) && tileY < Math.pow(2, zoom)) {
                    const img = document.createElement('img');
                    img.className = 'map-tile';
                    img.src = \`https://tile.openstreetmap.org/\${zoom}/\${tileX}/\${tileY}.png\`;
                    img.style.position = 'absolute';
                    img.style.left = (x * tileSize) + 'px';
                    img.style.top = (y * tileSize) + 'px';
                    img.style.width = tileSize + 'px';
                    img.style.height = tileSize + 'px';
                    img.style.zIndex = '1';
                    
                    img.onerror = function() {
                      // Fallback to colored tile on error
                      this.style.backgroundColor = '#e5e7eb';
                      this.style.border = '1px solid #d1d5db';
                      this.style.display = 'block';
                    };
                    
                    mapView.appendChild(img);
                  }
                }
              }
            }
            
            // Load tiles initially
            loadMapTiles();
            
            // Handle marker clicks
            window.handleMarkerClick = function(markerId) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerPress',
                markerId: markerId
              }));
            };
            
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
                  var locationDisplay = document.getElementById('location-display');
                  if (locationDisplay) {
                    locationDisplay.textContent = '📍 ' + data.latitude.toFixed(4) + ', ' + data.longitude.toFixed(4);
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