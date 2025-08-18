# Family Foraging App - Roadmap & Implementation Plan

## 🎯 **PRIORITY 1: OFFLINE MAP UX IMPLEMENTATION**

### Immediate UX (Quick Wins)

#### 🔄 Offline Banner
- **Status**: Pending
- **Description**: Show persistent top banner "Offline — showing cached map" with "Retry" button and last-updated time
- **Technical**: Use `@react-native-community/netinfo` in MapScreen to toggle offline banner
- **Files**: `src/components/OfflineBanner.tsx`, `src/screens/MapScreen.tsx`

#### 🗺️ Don't Blank the Map  
- **Status**: Pending
- **Description**: Keep WebView alive; show user dot, markers, and subtle grid/placeholder background if tiles fail
- **Technical**: Add tileerror listeners in Leaflet script; show overlay instead of blank
- **Files**: `src/components/SimpleMap.tsx`

#### 📍 Last Region Fallback
- **Status**: Pending  
- **Description**: Persist last map region in Zustand; on startup offline, center to that region
- **Technical**: Add `lastMapRegion` and `lastOnlineTimestamp` to foraging-store.ts
- **Files**: `src/state/foraging-store.ts`, `src/screens/MapScreen.tsx`

#### ❌ Clear Empty State
- **Status**: Pending
- **Description**: If zero tiles cached, show "No map tiles cached yet. Move around online to cache this area."
- **Technical**: Detect cache status and show centered message with "Learn more" link
- **Files**: `src/components/SimpleMap.tsx`

#### 🎯 GPS-Based "My Find" Button
- **Status**: Pending
- **Description**: Add floating button to instantly log finds using current GPS location, even offline
- **Technical**: New floating action button that works with cached/live GPS regardless of map tile availability
- **Files**: `src/screens/MapScreen.tsx`

### Near-Term Enhancements (1–2 Sprints)

#### 📦 Local Leaflet Assets
- **Status**: Pending
- **Description**: Bundle Leaflet CSS/JS locally to avoid CDN failures
- **Technical**: Replace CDN links in `generateMapHTML()` with locally bundled assets
- **Files**: `src/components/SimpleMap.tsx`, `assets/` directory
- **Notes**: Already have `leaflet@1.9.4` installed, need to bundle and reference locally

#### 🔧 Tile Error Handling
- **Status**: Pending
- **Description**: Listen for `tileerror` in WebView and show overlay instead of blank background
- **Technical**: Add Leaflet tileerror listeners, implement retry mechanism
- **Files**: `src/components/SimpleMap.tsx`

#### 💾 Passive Tile Caching
- **Status**: Pending
- **Description**: Cache visited tiles as users pan/zoom online (limit zoom levels and total size)
- **Technical**: Integrate Leaflet offline plugin (e.g., leaflet-offline-tiles)
- **Files**: `src/components/SimpleMap.tsx`

## ✅ **TESTING COMPLETED**

### **1. Plant Database August Filtering** 
- **Status**: ✅ FIXED - Cache invalidation worked
- **Result**: Now showing **20 plants** for August (previously 5)
- **Fix Applied**: Added `version: 2` to Zustand store persistence

### **2. Recipe Integration**
- **Status**: ✅ WORKING WELL
- **Features Tested**:
  - Recipe detail view with foraged ingredients tracking
  - "You have 1 of 1 ingredients!" indicator for Wild Garlic Pesto
  - Navigation from Plants to Recipes (updated recently)
  - Ingredient availability checking

## 🐛 **BUGS FOUND**

### **Critical - FIXED DURING TESTING**
1. **Syntax Errors in plants.ts** ✅ RESOLVED
   - Missing commas after `heroImage` properties in several plant entries
   - Fixed on lines: 125, 244, 363, 482, 599, 696
   - App should now build successfully

### **Minor**
2. **Navigation Flow Issues**
   - Back button behavior could be improved between screens
   - Some inconsistent navigation patterns

## 🚧 **TESTING BLOCKED** 
*(Resume after build fixes complete)*

- [ ] **Map Screen & Find Logging**
- [ ] **Plant Editing Functionality** 
- [ ] **Search Functionality**
- [ ] **Import/Export Features**
- [ ] **Seasonal Suggestions in LogFind Screen**

## 💡 **FEATURE IMPROVEMENTS NEEDED**

### **High Priority**

1. **Enhanced Plant Database**
   - ⭐ Add plant photos/images (currently using placeholder URLs)
   - ⭐ Add "Recently Viewed" plants section
   - ⭐ Improve plant categorization with sub-categories
   - ⭐ Add plant difficulty rating (beginner/intermediate/expert)

2. **Map Functionality**
   - ⭐ Add clustering for nearby finds
   - ⭐ Add heat map showing foraging hotspots
   - ⭐ Improve map performance with large datasets
   - ⭐ Add offline map support

3. **Search & Discovery**
   - ⭐ Add fuzzy search capabilities
   - ⭐ Add plant identification by characteristics (leaf shape, color, etc.)
   - ⭐ Add "Plants near me" based on location
   - ⭐ Add seasonal calendar view

### **Medium Priority**

4. **User Experience**
   - ⭐ Add onboarding tutorial for new users
   - ⭐ Add dark mode support
   - ⭐ Improve loading states and error handling
   - ⭐ Add haptic feedback for interactions

5. **Social Features**
   - ⭐ Add user profiles and find sharing
   - ⭐ Add community plant verification
   - ⭐ Add foraging groups/communities
   - ⭐ Add expert verification badges

6. **Data Management**
   - ⭐ Add cloud sync for finds and preferences
   - ⭐ Add backup/restore functionality
   - ⭐ Add bulk operations for finds management
   - ⭐ Add data export in multiple formats

### **Low Priority**

7. **Advanced Features**
   - ⭐ Add AI plant identification via camera
   - ⭐ Add weather integration for optimal foraging times
   - ⭐ Add foraging journal with notes
   - ⭐ Add mushroom safety warnings with verification
   - ⭐ Add seasonal notifications

8. **Content Expansion**
   - ⭐ Add more plant varieties (targeting 100+ plants)
   - ⭐ Add regional plant variations
   - ⭐ Add cooking techniques and preservation methods
   - ⭐ Add foraging ethics and regulations by region

## 🔧 **TECHNICAL IMPROVEMENTS**

### **Performance**
- Optimize plant database loading with lazy loading
- Add image caching and compression
- Improve map rendering performance
- Add pagination for large plant lists

### **Code Quality**
- Add TypeScript strict mode compliance
- Add comprehensive error boundaries
- Improve component reusability
- Add automated testing suite

### **Accessibility**
- Add screen reader support
- Improve color contrast ratios
- Add voice navigation options
- Add accessibility landmarks

## 📊 **CURRENT STATUS SUMMARY**

**Working Well:**
- ✅ Plant database with 20+ August plants
- ✅ Recipe integration with ingredient tracking  
- ✅ OpenStreetMap integration
- ✅ Seasonal filtering
- ✅ Basic navigation structure
- ✅ Cache management system

**Recently Fixed:**
- ✅ August plant filtering (cache invalidation)
- ✅ Syntax errors in plants database
- ✅ Store persistence versioning

**Needs Testing:**
- 🟡 Map interaction and find logging
- 🟡 Plant editing functionality
- 🟡 Search and filter capabilities
- 🟡 Import/export features

**Next Testing Priority:**
1. Test map screen and find logging
2. Test plant editing functionality
3. Test search and filter capabilities
4. Test import/export features
5. Test seasonal suggestions in LogFind screen

---

## 🎯 **PRODUCT MANAGER RECOMMENDATIONS**

### **Immediate Actions (Next Sprint)**
1. Complete remaining functional testing
2. Add comprehensive error handling
3. Implement plant image loading improvements
4. Add basic search enhancements

### **Short Term (1-2 Months)**
1. Expand plant database to 50+ plants
2. Add plant identification wizard
3. Improve map clustering and performance
4. Add offline capabilities

### **Long Term (3-6 Months)**
1. AI plant identification feature
2. Community features and sharing
3. Advanced foraging tools
4. Regional content expansion

---
*Generated by Claude Code Testing - Product Manager Review*
*Date: 2025-08-16*
*Status: Syntax fixes applied, ready for continued testing*