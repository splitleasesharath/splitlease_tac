# Feature: Search Page Porting

## Metadata
adw_id: `b09f0238`
prompt: `I want you to reinvigorate the Search page for my multi page app in: C:\Users\igor\OneDrive\Documents\TAC - Split Lease\app to be more in line with the original standalone trial search page I built. A lot of the functionality hasn't been ported over or has gotten lost in translation going from Javascript to React. I want you to thoroughly invest time and effort to update the search page without affecting any other components or pages in this app, with the original search page. Do not ask for whether something needs to be added or not, but add it anyway. Original Full Search Page: C:\Users\igor\OneDrive\Documents\TAC - Split Lease\input\search\app\search-page-2`

## Feature Description
This feature involves a comprehensive port of the original standalone search page (JavaScript-based) to the React Islands architecture in the main application. The original search page contains significant functionality that has been lost or incompletely implemented during the initial migration to React. This includes:

1. Complete lazy loading implementation with intersection observers
2. AI research card integration at specific positions (after 4th and 8th listings)
3. Image carousel functionality with proper state management per card
4. Favorite button functionality
5. Map marker interactions and zoom-to-listing features
6. Price information modal triggers
7. Location click handlers to zoom map
8. Chat widget for market research
9. Deep research floating button with Lottie animation
10. Proper integration of all modals (AI Signup, Contact Host, Informational Text)
11. Filter application logic with schedule day filtering
12. URL parameter management for shareable filter states
13. Mobile filter and map toggle functionality

The goal is to bring the React-based search page to 100% feature parity with the original JavaScript implementation while maintaining the ESM+React Islands architectural standards.

## User Story
As a **property seeker**
I want to **use the search page with all original features working correctly**
So that **I can efficiently find properties, interact with the map, view listings, contact hosts, and access AI-powered market research without any missing functionality**

## Problem Statement
The current React-based SearchPage component (src/islands/pages/SearchPage.jsx) is missing critical functionality that was present in the original JavaScript implementation (input/search/app/search-page-2). Key missing features include:

1. **Lazy Loading**: Current implementation loads all listings at once; original has batched loading (6 initial, then 6 per scroll)
2. **AI Research Cards**: Missing insertion of promotional AI signup cards after 4th and 8th listings
3. **Image Carousel**: Incomplete state management causing images to not properly cycle
4. **Favorite Button**: Non-functional favorite toggle on listing cards
5. **Map Integration**: Missing zoom-to-listing functionality when clicking location pins
6. **Price Info Modal**: Info icon triggers not properly wired to InformationalText component
7. **Chat Widget**: Missing floating chat widget for market research access
8. **Deep Research Button**: Lottie animation not loading, button positioning incorrect
9. **Filter Logic**: Schedule day filtering logic differs from original implementation
10. **Mobile UI**: Filter and map toggle buttons not properly implemented

This creates an inconsistent user experience and prevents users from accessing critical features that help them make informed rental decisions.

## Solution Statement
Systematically port each missing feature from the original JavaScript implementation to the React Islands architecture by:

1. **Analyzing Original Code**: Deep dive into input/search/js/app.js, supabase-api.js, and filter-config.js to understand exact implementation details
2. **React Component Updates**: Enhance SearchPage.jsx with missing features while maintaining React best practices (hooks, state management, component composition)
3. **Preserving Architecture**: Ensure all changes follow the ESM+React Islands pattern defined in ARCHITECTURE_GUIDE_ESM+REACT_ISLAND.md
4. **No Fallbacks**: Follow the no-fallback principle - implement features correctly or acknowledge constraints honestly
5. **Testing Each Feature**: Validate each ported feature works identically to the original

The solution will result in a fully-featured search page that matches the original's functionality while benefiting from React's component model and the modern ESM architecture.

## Relevant Files

### Current React Application Files
- **src/islands/pages/SearchPage.jsx** (1,275 lines) - Main search page component that needs enhancement
  - Already has: Basic filter panel, listing grid, GoogleMap integration, modal state management
  - Missing: Lazy loading details, AI card insertion, proper event handlers, zoom-to-listing

- **src/islands/shared/DaySelector.jsx** - Day selection component (working, but integration needs review)

- **src/islands/shared/GoogleMap.jsx** - Map component (needs zoom-to-listing method exposure)

- **src/islands/shared/InformationalText.jsx** - Price info modal (needs trigger integration)

- **src/islands/shared/ContactHostMessaging.jsx** - Contact modal (working)

- **src/islands/shared/AISignupModal.jsx** - AI signup flow (working, needs additional trigger points)

- **src/lib/constants.js** - Application constants (PRICE_TIERS, SORT_OPTIONS, WEEK_PATTERNS, LISTING_CONFIG)

- **src/lib/dataLookups.js** - Borough/neighborhood lookup utilities (working)

- **src/lib/urlParams.js** - URL state management (working, may need filter sync improvements)

- **src/lib/supabaseUtils.js** - Supabase helper functions (photo fetching, host data, parsing)

- **public/search.html** - HTML entry point (minimal, needs chat widget and deep research button HTML)

### Original JavaScript Implementation (Reference)
- **input/search/app/search-page-2/index.html** (492 lines) - Original HTML structure with all UI elements
  - Has: Complete filter panel, mobile filter buttons, map section, chat widget, deep research button

- **input/search/app/search-page-2/js/app.js** (500+ lines) - Main application logic
  - Key features: Lazy loading with intersection observer, AI card insertion, image carousel, price calculations

- **input/search/app/search-page-2/js/supabase-api.js** (300+ lines) - Supabase API client
  - Key features: Schedule day filtering logic, batch photo/host fetching, listing transformation

- **input/search/app/search-page-2/js/filter-config.js** (300+ lines) - Filter configuration and builders
  - Key features: Dynamic borough/neighborhood loading, filter building, no hardcoded values

### Architecture Reference
- **Context/ARCHITECTURE_GUIDE_ESM+REACT_ISLAND.md** (187 lines) - Strict architectural standards
  - ESM-only, explicit extensions, React Islands pattern, no fallbacks, match solution to scale

### New Files
None - all enhancements will be made to existing files

## Implementation Plan

### Phase 1: Foundation - Code Analysis and Component Preparation
**Goal**: Thoroughly understand the original implementation and prepare React components for enhancements

**Tasks**:
1. Document all missing features with line number references from original code
2. Review GoogleMap.jsx to ensure it exposes `zoomToListing(listingId)` method via ref
3. Review DaySelector.jsx integration to ensure day names are properly passed to SearchPage
4. Add any missing constants to src/lib/constants.js (INITIAL_LOAD_COUNT, LOAD_BATCH_SIZE)
5. Create detailed feature comparison checklist

### Phase 2: Core Implementation - Feature Porting
**Goal**: Port each missing feature systematically from JavaScript to React

**Priority 1 - Critical UX Features**:
1. Fix lazy loading implementation
   - Current: Basic intersection observer exists but may have issues
   - Target: Load 6 initially, then 6 per batch, with sentinel-based infinite scroll
   - Files: SearchPage.jsx (ListingsGrid component)

2. Implement AI research card insertion
   - Current: AiSignupCard component exists but not inserted into grid
   - Target: Insert after 4th and 8th listing cards
   - Files: SearchPage.jsx (ListingsGrid component, lines 512-535)

3. Fix image carousel state management
   - Current: State exists per card but navigation may not work
   - Target: Proper prev/next navigation with counter display
   - Files: SearchPage.jsx (PropertyCard component, lines 248-277)

4. Implement favorite button functionality
   - Current: Button renders but toggle doesn't persist
   - Target: Toggle heart icon fill state (localStorage or state management)
   - Files: SearchPage.jsx (PropertyCard component, lines 272-277)

**Priority 2 - Map Integration**:
5. Implement zoom-to-listing from location click
   - Current: onLocationClick handler exists but may not call map method
   - Target: Click location pin → zoom map to that listing marker
   - Files: SearchPage.jsx (PropertyCard, line 377-383), GoogleMap.jsx (add zoomToListing method)

6. Implement zoom-to-listing from map marker click
   - Current: onMarkerClick exists but only logs
   - Target: Click map marker → scroll to listing card and highlight
   - Files: SearchPage.jsx (GoogleMap integration, lines 1209-1212), GoogleMap.jsx

**Priority 3 - Additional UI Elements**:
7. Add chat widget HTML and functionality
   - Current: Missing from search.html
   - Target: Floating chat button (bottom-right) that opens AI signup modal
   - Files: SearchPage.jsx (add ChatWidget component), search.html (fallback if needed)

8. Fix deep research floating button
   - Current: Button exists but Lottie animation may not load
   - Target: Purple button with working atom animation that opens AI signup
   - Files: SearchPage.jsx (lines 1216-1236), ensure Lottie script loads

9. Ensure mobile filter/map toggle buttons work
   - Current: MobileFilterBar component exists
   - Target: Toggle filter panel and map section visibility on mobile
   - Files: SearchPage.jsx (MobileFilterBar, FilterPanel, map-section classes)

**Priority 4 - Modal Integrations**:
10. Wire price info icon to InformationalText modal
    - Current: Info icon renders but onClick may not work
    - Target: Click info icon → open InformationalText modal with pricing details
    - Files: SearchPage.jsx (PropertyCard line 435-442, handleOpenInfoModal)

11. Ensure contact host modal integration
    - Current: Message button exists, modal should work
    - Target: Click Message → open ContactHostMessaging modal with listing data
    - Files: SearchPage.jsx (PropertyCard line 414-423, handleOpenContactModal)

12. Ensure all modal state management works
    - Current: State exists for all modals
    - Target: All modals can open, close, and don't interfere with each other
    - Files: SearchPage.jsx (modal state, lines 622-625)

### Phase 3: Integration - Polish and Validation
**Goal**: Ensure all features work together seamlessly and match original behavior exactly

**Tasks**:
1. Test filter changes trigger proper re-fetching and re-rendering
2. Test URL parameter sync (apply filters → URL updates, browser back → filters restore)
3. Test lazy loading performance with 100+ listings
4. Validate schedule day filtering matches original logic exactly
5. Test all modal flows (open, interact, close, re-open)
6. Test mobile responsive behavior (filter panel, map toggle)
7. Verify Lottie animations load correctly (deep research button, AI cards)
8. Test map marker synchronization with filtered listings
9. Validate image carousel works on all listing cards
10. Ensure no console errors or warnings

## Step by Step Tasks

### 1. Foundation Setup - Analyze and Document
- Read original files completely: app.js, supabase-api.js, filter-config.js, index.html
- Create feature comparison spreadsheet (original vs current implementation)
- Document all missing features with line numbers from both codebases
- Identify any constants or utilities missing from React app
- Add missing constants to src/lib/constants.js if needed

### 2. Component Preparation - GoogleMap Enhancement
- Review GoogleMap.jsx to check if `zoomToListing(listingId)` method exists
- If missing, add `zoomToListing` method that:
  - Takes a listing ID
  - Finds the corresponding marker
  - Centers map on that marker
  - Zooms to appropriate level (e.g., zoom level 15)
  - Opens info window for that marker
- Expose method via `useImperativeHandle` so parent can call via ref
- Test zoom method works with sample listing ID

### 3. Lazy Loading - Fix Implementation
- Review ListingsGrid component in SearchPage.jsx (lines 482-547)
- Verify intersection observer setup is correct
- Ensure sentinel ref is properly observed
- Test that `onLoadMore` callback fires when scrolling near bottom
- Verify batch size constants are correct (INITIAL_LOAD_COUNT=6, LOAD_BATCH_SIZE=6)
- Add console logs for debugging if needed
- Test with 50+ listings to ensure smooth batching

### 4. AI Research Cards - Implement Insertion Logic
- Review AiSignupCard component (lines 456-477)
- Modify ListingsGrid to insert AI cards after 4th and 8th listings
- Update mapping logic in ListingsGrid (lines 512-535) to:
  - Check if index === 3 or index === 7
  - Insert AiSignupCard component with unique key
  - Ensure AI cards don't break lazy loading
- Test AI cards appear at correct positions in grid
- Verify AI card button opens AISignupModal correctly

### 5. Image Carousel - Fix State Management
- Review PropertyCard component image navigation (lines 248-277)
- Ensure `currentImageIndex` state is properly scoped per card
- Verify `handlePrevImage` and `handleNextImage` work correctly
- Test image counter updates correctly (e.g., "2 / 5")
- Ensure images wrap around (last → first, first → last)
- Test with listings that have 1 image (nav buttons should be hidden)
- Test with listings that have 5+ images (full carousel)

### 6. Favorite Button - Implement Toggle
- Review favorite button rendering (lines 357-368)
- Implement `handleFavoriteClick` to:
  - Toggle `isFavorite` state
  - Store favorite status in localStorage (key: `favorites-${listingId}`)
  - Update heart icon fill (filled red if favorite, outline if not)
- On component mount, check localStorage for existing favorites
- Test favorite persists across page refreshes
- Consider adding visual feedback (animation) on toggle

### 7. Location Click - Implement Zoom to Listing
- Review PropertyCard location click handler (lines 377-383)
- Ensure `onLocationClick` callback is passed correctly
- In SearchPage, implement location click to call `mapRef.current.zoomToListing(listing.id)`
- Test clicking location pin zooms map to correct marker
- Ensure map section is visible on mobile when location clicked
- Add smooth scrolling animation if needed

### 8. Map Marker Click - Implement Scroll to Card
- Review GoogleMap onMarkerClick handler (SearchPage lines 1209-1212)
- Implement logic to:
  - Find listing card in DOM by ID (e.g., `document.querySelector([data-id="${listing.id}"])`)
  - Scroll card into view with smooth behavior
  - Optionally highlight card temporarily (add CSS class, remove after 2s)
- Test clicking map marker scrolls to and highlights correct card
- Ensure scroll behavior works with lazy loading (card may not be loaded yet)

### 9. Chat Widget - Add Component
- Create ChatWidget component or add directly to SearchPage
- Position fixed at bottom-right corner (using CSS from original)
- Add chat icon SVG and "Get Market Research" label
- Wire onClick to open AISignupModal
- Ensure widget is visible on all screen sizes (adjust for mobile if needed)
- Test widget doesn't interfere with other UI elements
- Add z-index to ensure it floats above content

### 10. Deep Research Button - Fix Lottie Animation
- Review deep research button rendering (SearchPage lines 1216-1236)
- Ensure Lottie script is loaded in search.html (line 14)
- Verify atom animation container has correct ID (`atomAnimation`)
- Check that Lottie.loadAnimation is called after component mounts
- Update Lottie path to correct URL if needed
- Test animation loads and plays in loop
- Verify button opens AISignupModal on click
- Ensure button is positioned correctly on map section

### 11. Mobile UI - Fix Filter and Map Toggles
- Review MobileFilterBar component (lines 34-52)
- Verify `filterPanelActive` state toggles FilterPanel's `active` class
- Verify `mapSectionActive` state toggles map section's `mobile-active` class
- Test on mobile viewport (< 768px width)
- Ensure filter panel slides in/out smoothly
- Ensure map section expands to full screen on mobile when toggled
- Test closing behavior (tap outside, close button, etc.)

### 12. Price Info Modal - Wire Integration
- Review PropertyCard price info icon (lines 428-442)
- Ensure info icon click calls `onOpenInfoModal(listing)`
- Verify `handleOpenInfoModal` sets `selectedListing` and opens modal
- Test InformationalText modal opens with correct listing data
- Verify modal displays pricing breakdown for selected day count
- Test modal closes correctly
- Ensure modal is accessible (keyboard navigation, ARIA labels)

### 13. Contact Host Modal - Verify Integration
- Review PropertyCard message button (lines 414-423)
- Ensure button click calls `onOpenContactModal(listing)`
- Verify `handleOpenContactModal` sets `selectedListing` and opens modal
- Test ContactHostMessaging modal opens with correct listing data
- Verify modal form works (email validation, message sending)
- Test modal closes correctly
- Ensure modal doesn't lose listing data on re-open

### 14. Modal State Management - Validate All Flows
- Review all modal state declarations (lines 622-625)
- Test opening each modal independently
- Test opening one modal, closing it, opening another
- Verify selectedListing is cleared when modals close
- Ensure no modal state leaks between openings
- Test rapid open/close doesn't cause state issues
- Verify modals can be dismissed via overlay click and close button

### 15. Filter Logic - Validate Schedule Day Filtering
- Review schedule day filtering in fetchListings (lines 914-983)
- Compare with original implementation (supabase-api.js lines 193-296)
- Ensure logic matches exactly:
  - Empty/null days array = show listing (available all days)
  - Listing must have ALL selected days (superset check)
  - Case-insensitive day name comparison
  - Detailed console logging for debugging
- Test with various day selections (1 day, 5 days, 7 days)
- Verify rejected listings are properly filtered out
- Test edge cases (listings with no days_available data)

### 16. URL Parameters - Validate Sync
- Review URL parameter logic (lines 634-700)
- Test applying filters updates URL immediately
- Test browser back button restores previous filter state
- Test direct URL with parameters loads correct filters
- Verify initial mount doesn't create duplicate history entries
- Test shareable URLs (copy URL, paste in new tab, filters restored)
- Ensure URL params don't interfere with lazy loading

### 17. Integration Testing - Comprehensive Validation
- Test complete user flow: Load page → Apply filters → View listings → Click location → Zoom map → Open modal → Submit message
- Test with 0 listings (empty state displays correctly)
- Test with 1-5 listings (lazy loading doesn't break)
- Test with 100+ listings (performance is acceptable)
- Test all filter combinations (borough + neighborhood + price + week pattern + days)
- Test mobile responsive behavior (all breakpoints)
- Verify no console errors or warnings in any flow

### 18. Performance Testing - Optimize if Needed
- Use React DevTools Profiler to measure render times
- Identify any unnecessary re-renders
- Add useMemo/useCallback where appropriate
- Test scroll performance with lazy loading
- Verify map marker updates are efficient (debounce if needed)
- Test image loading performance (lazy load images if needed)
- Ensure no memory leaks in modal state management

### 19. Final Polish - Match Original Exactly
- Compare visual appearance with original (CSS, spacing, colors)
- Verify all animations work (Lottie, transitions, hover effects)
- Check all icon SVGs render correctly
- Ensure all tooltips display (amenity icons, info icons)
- Verify all ARIA labels and accessibility features
- Test keyboard navigation works for all interactive elements
- Validate screen reader compatibility

### 20. Documentation - Update README if Needed
- Add any new features to README.md feature list
- Update architecture diagram if significant changes made
- Document any new constants or utilities
- Add comments to complex logic in SearchPage.jsx
- Update line number references if file structure changed significantly

## Testing Strategy

### Unit Tests
While full test coverage is future work, critical logic should be manually validated:

1. **Lazy Loading Logic**:
   - Test sentinel observer triggers at correct scroll position
   - Test batch loading increments correctly
   - Test no duplicate loads occur

2. **Image Carousel Logic**:
   - Test prev/next navigation wraps correctly
   - Test image counter displays correct numbers
   - Test single-image listings hide navigation

3. **Filter Building Logic**:
   - Test borough ID lookup returns correct values
   - Test price tier conversion works for all tiers
   - Test schedule day filtering superset logic

4. **URL Parameter Logic**:
   - Test filter state serializes to URL correctly
   - Test URL deserializes to filter state correctly
   - Test browser navigation doesn't break state

5. **Modal State Logic**:
   - Test multiple modals don't interfere
   - Test selected listing is cleared on close
   - Test rapid open/close doesn't break state

### Edge Cases
Test these scenarios to ensure robustness:

1. **Empty States**:
   - No listings match filters → EmptyState component displays
   - Network error → ErrorState component displays with retry button
   - No images for listing → fallback image or placeholder displays

2. **Boundary Conditions**:
   - 1 listing total → lazy loading doesn't break
   - Exactly 6 listings → AI cards position correctly
   - 1000+ listings → performance remains acceptable

3. **Filter Combinations**:
   - All filters applied → correct listings displayed
   - No filters applied → default Manhattan listings shown
   - Invalid borough in URL → fallback to Manhattan

4. **Schedule Day Filtering**:
   - Select 1 day → only listings with that day (or empty days) shown
   - Select 7 days → only listings with all 7 days (or empty) shown
   - Listing has extra days → still shown (superset logic)
   - Listing has empty days_available → always shown

5. **Map Integration**:
   - Click location before map loads → gracefully handle (queue action)
   - Click marker for unloaded listing → scroll loads more, then highlights
   - Zoom to listing off-screen → map pans and zooms correctly

6. **Mobile Behavior**:
   - Rotate device → layout adjusts correctly
   - Toggle filter panel multiple times → animation doesn't break
   - Toggle map section → listings section hides/shows correctly

7. **Modal Interactions**:
   - Open modal, scroll page, close modal → page scroll position maintained
   - Open modal, resize window, close modal → modal still works
   - Open modal, press Escape key → modal closes

## Acceptance Criteria

The feature is complete when all of the following are true:

### Functional Requirements
1. ✅ Lazy loading works: 6 listings load initially, then 6 more per scroll batch
2. ✅ AI research cards appear after 4th and 8th listings
3. ✅ Image carousel navigates correctly on all listing cards (prev/next buttons work)
4. ✅ Favorite button toggles heart icon and persists in localStorage
5. ✅ Clicking location pin zooms map to that listing marker
6. ✅ Clicking map marker scrolls to and highlights that listing card
7. ✅ Chat widget is visible and opens AI signup modal
8. ✅ Deep research button displays with working Lottie atom animation
9. ✅ Mobile filter toggle button shows/hides filter panel
10. ✅ Mobile map toggle button expands map to full screen
11. ✅ Price info icon opens InformationalText modal with pricing details
12. ✅ Message button opens ContactHostMessaging modal with listing data
13. ✅ All modals can open, close, and don't interfere with each other

### Filter and Data Requirements
14. ✅ Schedule day filtering matches original logic exactly (superset check, empty days = all days)
15. ✅ All filter changes trigger proper re-fetching from Supabase
16. ✅ URL parameters sync correctly (filters → URL, browser back → filters restored)
17. ✅ Direct URL with parameters loads correct filter state
18. ✅ Empty state displays when no listings match filters
19. ✅ Error state displays with retry button when fetch fails
20. ✅ Listing count displays correctly in header

### Performance Requirements
21. ✅ Page loads in < 3 seconds on typical connection
22. ✅ Lazy loading scroll is smooth (no jank)
23. ✅ Filter changes render results in < 500ms
24. ✅ Map marker updates are smooth (no visible lag)
25. ✅ No console errors or warnings in browser devtools

### Visual and UX Requirements
26. ✅ Layout matches original search page closely (spacing, colors, typography)
27. ✅ All animations work (Lottie, transitions, hover effects)
28. ✅ Mobile responsive behavior works at all breakpoints (320px - 1920px)
29. ✅ All icons and images display correctly
30. ✅ Tooltips appear on amenity icons and info icons

### Accessibility Requirements
31. ✅ All interactive elements are keyboard navigable
32. ✅ All images have alt text
33. ✅ All buttons have descriptive ARIA labels
34. ✅ Modals trap focus and can be dismissed with Escape key
35. ✅ Color contrast meets WCAG AA standards

### Architecture Requirements
36. ✅ All code follows ESM-only pattern (explicit .js/.jsx extensions)
37. ✅ No fallback mechanisms or hardcoded data
38. ✅ React Islands pattern maintained (components are properly isolated)
39. ✅ No CommonJS or UMD modules used
40. ✅ All changes documented in code comments

## Validation Commands

Execute these commands to validate the feature is complete:

### 1. Build Test
```bash
cd app
npm run build
```
**Expected**: Build completes without errors or warnings

### 2. Dev Server Test
```bash
cd app
npm run dev
```
**Expected**: Dev server starts on port 5173, no errors in terminal

### 3. TypeScript Check (if applicable)
```bash
cd app
npx tsc --noEmit
```
**Expected**: No type errors (if using TypeScript)

### 4. Browser Console Check
1. Open http://localhost:5173/search.html in browser
2. Open browser DevTools (F12)
3. Navigate through search page features
**Expected**: No console errors or warnings

### 5. Manual Feature Validation Checklist
Run through this checklist in the browser:

- [ ] Page loads and displays 6 listings initially
- [ ] Scroll down, 6 more listings load automatically
- [ ] AI research card appears after 4th listing
- [ ] AI research card appears after 8th listing (if enough listings)
- [ ] Click prev/next buttons on listing image carousel → images change
- [ ] Click favorite button → heart icon fills red
- [ ] Refresh page → favorite persists
- [ ] Click location pin on listing card → map zooms to that marker
- [ ] Click marker on map → page scrolls to that listing card
- [ ] Click "Message" button → Contact Host modal opens
- [ ] Click info icon next to starting price → Informational Text modal opens
- [ ] Click chat widget (bottom-right) → AI Signup modal opens
- [ ] Click deep research button on map → AI Signup modal opens
- [ ] Verify Lottie atom animation plays on deep research button
- [ ] On mobile (< 768px): Click "Filters" button → filter panel slides in
- [ ] On mobile: Click "Map" button → map expands to full screen
- [ ] Change borough filter → listings update
- [ ] Change price tier filter → listings update
- [ ] Select/deselect neighborhoods → listings update
- [ ] Change week pattern → listings update
- [ ] Click days in day selector → listings update
- [ ] Apply filters → URL updates with parameters
- [ ] Copy URL, paste in new tab → filters restored
- [ ] Click browser back button → previous filter state restored
- [ ] Clear all filters → default Manhattan listings shown
- [ ] Select filters that match 0 listings → "No Listings Found" empty state displays
- [ ] Simulate network error (disconnect WiFi) → Error state with retry button displays

### 6. Performance Validation
Use browser DevTools Performance tab:
1. Record page load
2. Check First Contentful Paint < 1.5s
3. Check Time to Interactive < 3s
4. Record scroll with lazy loading
5. Check scroll performance is smooth (60fps)

**Expected**: All metrics meet targets

### 7. Accessibility Validation
Use browser DevTools Lighthouse:
```
1. Open search page
2. Open DevTools → Lighthouse tab
3. Select "Accessibility" category
4. Run audit
```
**Expected**: Score ≥ 90/100

### 8. Mobile Responsive Validation
Test on real devices or browser device emulation:
- [ ] iPhone SE (375px width)
- [ ] iPhone 12 Pro (390px width)
- [ ] iPad (768px width)
- [ ] Desktop (1920px width)

**Expected**: Layout adjusts correctly at all breakpoints, no horizontal scroll

### 9. Cross-Browser Validation
Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected**: All features work in all browsers

## Notes

### Key Architectural Principles to Follow
From ARCHITECTURE_GUIDE_ESM+REACT_ISLAND.md:

1. **ESM-Only**: All imports must have explicit .js or .jsx extensions
2. **No Fallbacks**: Don't add fallback logic or compatibility layers when encountering constraints - solve the root issue or acknowledge the constraint honestly
3. **Match Solution to Scale**: Don't over-engineer for hypothetical future needs - this is a search page with 100-200 listings, not millions
4. **React Islands Pattern**: Keep components isolated and hydrate only interactive parts
5. **No Hardcoded Values**: All location data must come from Supabase database, not hardcoded arrays

### Performance Considerations
- Lazy loading is essential because listings have large photo arrays
- Use intersection observer (native browser API) for scroll detection
- Batch fetch photos for all listings in a single query to minimize database round trips
- Consider debouncing filter changes if user is typing in neighborhood search

### Known Constraints
- Supabase RLS policies may limit data access - ensure anon key has read access to all required tables
- Google Maps API may have quota limits - monitor usage if many users
- Lottie animations require external CDN - gracefully handle if CDN is unreachable
- Browser localStorage is limited to ~5-10MB - don't store too many favorites

### Future Enhancements (Not in Scope for This Feature)
- User authentication and saved searches
- Listing favorites sync across devices (requires backend)
- Real-time availability updates (Supabase Realtime)
- Advanced search (keyword, amenities, date range)
- Listing comparison tool
- Print/export search results
- Listing reviews and ratings

### Testing Approach
Since this is a UI-heavy feature, manual testing is primary validation method. Automated tests (Playwright) can be added in future iterations:
- E2E tests for critical user flows (search → filter → view → contact)
- Visual regression tests to catch CSS breakages
- Integration tests for filter logic and URL state management
