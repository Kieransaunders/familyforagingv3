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

interface SimpleMapProps {
  style?: any;
  initialRegion: Region;
  markers?: MapMarker[];
  onPress?: (event: any) => void;
  onLongPress?: (event: any) => void;
  showsUserLocation?: boolean;
  mapRef?: React.RefObject<any>;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  style,
  initialRegion,
  markers = [],
  onPress,
  onLongPress,
  showsUserLocation = false,
  mapRef,
}) => {
  const [hasError, setHasError] = useState(false);
  const webViewRef = React.useRef<any>(null);

  // Update markers without recreating the map
  React.useEffect(() => {
    if (webViewRef.current && markers) {
      const markersJs = markers.map(marker => ({
        id: marker.id,
        lat: marker.coordinate.latitude,
        lng: marker.coordinate.longitude,
        title: marker.title,
        description: marker.description || '',
        color: marker.pinColor || '#ef4444'
      }));
      
      webViewRef.current.injectJavaScript(`
        if (window.setMarkers) {
          window.setMarkers(${JSON.stringify(markersJs)});
        }
      `);
    }
  }, [markers]);

  // Method to center map on location
  const centerMap = React.useCallback((lat: number, lng: number, zoom?: number) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.setView) {
          window.setView(${lat}, ${lng}, ${zoom || 'null'});
        }
      `);
    }
  }, []);

  // Update user location
  React.useEffect(() => {
    if (webViewRef.current && showsUserLocation) {
      // You would get this from location services
      const userLat = initialRegion.latitude;
      const userLng = initialRegion.longitude;
      
      webViewRef.current.injectJavaScript(`
        if (window.setUserLocation) {
          window.setUserLocation(${userLat}, ${userLng}, ${showsUserLocation});
        }
      `);
    }
  }, [showsUserLocation, initialRegion]);

  // Expose centerMap via ref
  React.useImperativeHandle(mapRef, () => ({
    centerMap,
    injectJavaScript: (js: string) => webViewRef.current?.injectJavaScript(js),
  }), [centerMap]);

  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
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
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div id="error" class="error-container" style="display: none;">
          <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Map temporarily unavailable</div>
          <div style="font-size: 14px; text-align: center; opacity: 0.7;">Please check your connection and try again</div>
        </div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          let map;
          let markersLayer = L.layerGroup();
          let userLocationMarker = null;
          
          try {
            // Initialize the map only once
            map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Add markers layer
            markersLayer.addTo(map);
            
            // Global helper functions for React Native to call
            window.setMarkers = function(markersData) {
              markersLayer.clearLayers();
              markersData.forEach(marker => {
                const leafletMarker = L.marker([marker.lat, marker.lng])
                  .bindPopup('<b>' + marker.title + '</b>' + (marker.description ? '<br>' + marker.description : ''));
                
                leafletMarker.on('click', function() {
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerPress',
                    markerId: marker.id
                  }));
                });
                
                markersLayer.addLayer(leafletMarker);
              });
            };
            
            window.setView = function(lat, lng, zoom) {
              const currentZoom = zoom || map.getZoom();
              map.setView([lat, lng], currentZoom);
            };
            
            window.setUserLocation = function(lat, lng, showsLocation) {
              if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
                userLocationMarker = null;
              }
              
              if (showsLocation) {
                userLocationMarker = L.circle([lat, lng], {
                  color: '#007AFF',
                  fillColor: '#007AFF',
                  fillOpacity: 0.3,
                  radius: 50
                }).addTo(map);
              }
            };
            
            // Handle long press for pin placement with drag guards
            let isDragging = false;
            let dragCooldown = false;
            let longPressTimer = null;
            let isLongPress = false;
            let touchStartCoords = null;
            
            // Track dragging state to prevent accidental pin placement
            map.on('movestart', function() {
              isDragging = true;
              // Clear any pending long press when dragging starts
              if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
              }
            });
            
            map.on('moveend', function() {
              isDragging = false;
              dragCooldown = true;
              // Clear cooldown after 250ms to prevent clicks immediately after dragging
              setTimeout(function() {
                dragCooldown = false;
              }, 250);
            });
            
            // Custom long-press implementation that works in iOS Simulator
            function startLongPressTimer(latlng) {
              if (isDragging || dragCooldown) return;
              
              isLongPress = false;
              longPressTimer = setTimeout(function() {
                if (!isDragging && !dragCooldown) {
                  isLongPress = true;
                  // Send long press event to React Native
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapLongPress',
                    nativeEvent: {
                      coordinate: {
                        latitude: latlng.lat,
                        longitude: latlng.lng
                      }
                    }
                  }));
                }
              }, 600); // 600ms for long press
            }
            
            function clearLongPressTimer() {
              if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
              }
            }
            
            // Touch event handling for mobile (including iOS Simulator)
            map.getContainer().addEventListener('touchstart', function(e) {
              if (e.touches.length === 1 && !isDragging) {
                const touch = e.touches[0];
                const rect = map.getContainer().getBoundingClientRect();
                const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
                touchStartCoords = map.containerPointToLatLng(point);
                startLongPressTimer(touchStartCoords);
              }
            });
            
            map.getContainer().addEventListener('touchmove', function(e) {
              // Cancel long press if finger moves too much
              clearLongPressTimer();
            });
            
            map.getContainer().addEventListener('touchend', function(e) {
              clearLongPressTimer();
              // Reset flag after a short delay
              setTimeout(function() {
                isLongPress = false;
              }, 50);
            });
            
            // Mouse event handling for desktop
            map.on('mousedown', function(e) {
              if (!isDragging && e.originalEvent.button === 0) { // Left mouse button
                startLongPressTimer(e.latlng);
              }
            });
            
            map.on('mousemove', function(e) {
              clearLongPressTimer();
            });
            
            map.on('mouseup', function(e) {
              clearLongPressTimer();
              setTimeout(function() {
                isLongPress = false;
              }, 50);
            });
            
            // Fallback: Use contextmenu event as additional trigger
            map.on('contextmenu', function(e) {
              if (isDragging || dragCooldown) return;
              
              e.originalEvent.preventDefault();
              
              // Send long press event to React Native
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapLongPress',
                nativeEvent: {
                  coordinate: {
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                  }
                }
              }));
            });
            
            // Double-tap detection for simulator testing
            let lastClickTime = 0;
            let lastClickCoords = null;
            
            // Handle regular clicks for normal map interaction
            map.on('click', function(e) {
              // Don't send click events during dragging, cooldown, or if it was a long press
              if (isDragging || dragCooldown || isLongPress) {
                return;
              }
              
              // Double-tap detection for simulator testing (remove in production)
              const currentTime = Date.now();
              const timeDiff = currentTime - lastClickTime;
              const coordsDiff = lastClickCoords ? 
                Math.abs(e.latlng.lat - lastClickCoords.lat) + Math.abs(e.latlng.lng - lastClickCoords.lng) : 999;
              
              if (timeDiff < 500 && coordsDiff < 0.001) { // Double tap within 500ms at same location
                // Trigger long press for simulator testing
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapLongPress',
                  nativeEvent: {
                    coordinate: {
                      latitude: e.latlng.lat,
                      longitude: e.latlng.lng
                    }
                  }
                }));
                lastClickTime = 0; // Reset to prevent triple-tap
                return;
              }
              
              lastClickTime = currentTime;
              lastClickCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
              
              // Send click event to React Native (for future use if needed)
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapPress',
                nativeEvent: {
                  coordinate: {
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                  }
                }
              }));
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
      } else if (data.type === 'mapLongPress' && onLongPress) {
        onLongPress(data);
      } else if (data.type === 'markerPress') {
        const marker = markers.find(m => m.id === data.markerId);
        if (marker && marker.onPress) {
          marker.onPress();
        }
      } else if (data.type === 'centerMap') {
        // Handle center map message from React Native
        centerMap(data.latitude, data.longitude, data.zoom);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleWebViewError = () => {
    setHasError(true);
  };

  const handleLoadEnd = () => {
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
      ref={(ref) => {
        webViewRef.current = ref;
        if (mapRef) mapRef.current = ref;
      }}
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

export default SimpleMap;