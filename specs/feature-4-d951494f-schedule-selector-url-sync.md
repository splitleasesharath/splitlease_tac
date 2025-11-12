# Feature: Schedule Selector Default Selection and URL Synchronization

## Metadata
adw_id: `4 d951494f`
prompt: `I want you to update the default selections in the Search schedule Selector shared react island component to be Monday- Friday. I want this to be set in the island component level and not the page level. i want to also ensure that the search schedule selector's selection is reflected in the url with a parameter. You can retrieve context on how this was implemented in this Search page standalone directory, that was the precursor input used to build the current multipage app's search page section. I want the Search schedule Selector to retrieve from the URL(only if the URL parameter is found and not empty) based on 0 based indexing, add selections to the Search schedule Selector. And vice versa, when selections are made, through/on the Search schedule Selector, the URL parameter is updated accordingly. I also want this URL parameter to be appended when redirecting from the index page to the Search page, when 'Explore Rentals' is clicked.`

## Feature Description
This feature enhances the Search Schedule Selector (DaySelector) component to provide a better default user experience and enable URL-based state persistence. The component will default to Monday-Friday selection at the component level, sync its state bidirectionally with URL parameters, and ensure that navigation from the homepage preserves the user's day selection.

The implementation follows the React Islands Architecture pattern, maintaining component-level state management while ensuring URL synchronization for shareable search states and browser navigation support.

## User Story
As a user searching for accommodations
I want the schedule selector to default to Monday-Friday and persist my day selections in the URL
So that I can share my search criteria with others, bookmark specific searches, and have a sensible starting point for my search

## Problem Statement
Currently, the DaySelector component in the search page has several limitations:

1. **No sensible defaults**: Users must manually select days every time, even though Monday-Friday is the most common use case for temporary accommodations
2. **URL state not synchronized**: The schedule selector's state is not reflected in the URL, making it impossible to share specific search configurations or bookmark them
3. **Navigation loses context**: When users click "Explore Rentals" from the homepage with selected days, this selection is not properly passed to the search page's schedule selector
4. **Inconsistent state management**: The homepage already has URL parameter logic for `days-selected`, but the search page's schedule selector doesn't leverage this

## Solution Statement
Implement a three-part solution:

1. **Component-level default**: Modify `DaySelector.jsx` to default to Monday-Friday (days 1-5 in 0-based indexing) when no `selected` prop is provided
2. **Bidirectional URL synchronization**: Enhance the schedule selector to:
   - Initialize from URL parameter `days-selected` if present
   - Update the URL whenever selection changes
   - Support browser back/forward navigation
3. **Homepage-to-search navigation**: Ensure the "Explore Rentals" button passes the `days-selected` parameter correctly, maintaining the existing validation logic

The solution leverages the existing `urlParams.js` utility library and follows established patterns from the SearchPage filter synchronization.

## Relevant Files

### Core Component Files
- **`app/src/islands/shared/DaySelector.jsx`** (448 lines) - The schedule selector component that needs default value logic and URL sync
- **`app/src/islands/pages/SearchPage.jsx`** (1,344 lines) - Uses DaySelector and manages URL parameter synchronization for filters
- **`app/src/islands/pages/HomePage.jsx`** (729 lines) - Contains "Explore Rentals" button that navigates to search page with day parameters

### Utility Libraries
- **`app/src/lib/urlParams.js`** (223 lines) - Existing URL parameter utilities with `parseDaysParam`, `updateUrlParams`, `watchUrlChanges` functions
- **`app/src/lib/dayUtils.js`** - Day indexing conversion utilities (0-based JavaScript ↔ 1-based Bubble)
- **`app/src/lib/constants.js`** - Contains `DEFAULTS` object for default filter values

### HTML Entry Points
- **`app/public/search.html`** - Search page entry point
- **`app/public/index.html`** - Homepage entry point

### New Files
None required - all changes are modifications to existing files.

## Implementation Plan

### Phase 1: Foundation
Set up default values in the constants library and ensure URL parameter utilities are ready to handle schedule selector state. Review existing URL synchronization patterns in SearchPage to maintain consistency.

### Phase 2: Core Implementation
Update the DaySelector component to:
1. Apply Monday-Friday default when no selection is provided
2. Initialize from URL parameters on mount
3. Emit URL updates when selection changes
4. Handle edge cases (invalid URL params, out-of-range values)

### Phase 3: Integration
Integrate the enhanced DaySelector with SearchPage's URL synchronization system, ensure HomePage correctly passes parameters during navigation, and verify browser navigation (back/forward) works correctly with the new URL state.

## Step by Step Tasks

### 1. Add Default Days Constant
- Open `app/src/lib/constants.js`
- Add `DEFAULT_SELECTED_DAYS` constant set to Monday-Friday: `[1, 2, 3, 4, 5]` (0-based indexing)
- Add JSDoc comment explaining the 0-based indexing convention
- Export the new constant for use in DaySelector

### 2. Enhance URL Parameter Utilities
- Open `app/src/lib/urlParams.js`
- Verify `parseDaysParam` function correctly handles comma-separated day indices
- Verify `serializeFiltersToUrl` includes `days-selected` parameter
- Add validation to ensure day indices are 0-6 range
- Test with invalid inputs to ensure graceful degradation

### 3. Update DaySelector Component for Defaults
- Open `app/src/islands/shared/DaySelector.jsx`
- Import `DEFAULT_SELECTED_DAYS` from `constants.js`
- Modify the component to use `DEFAULT_SELECTED_DAYS` when `selected` prop is undefined or empty array
- Add JSDoc comment to the `selected` prop explaining the default behavior
- Ensure default is applied only when appropriate (not overriding explicit empty selection)

### 4. Add URL Initialization to DaySelector
- In `DaySelector.jsx`, add `useEffect` hook that runs on mount
- Import `parseUrlToFilters` from `urlParams.js`
- Extract `days-selected` parameter from URL using existing utilities
- If URL parameter exists and is non-empty, initialize component state from URL
- URL parameter takes precedence over default values
- Add error handling for malformed URL parameters

### 5. Add URL Update on Selection Change
- In `DaySelector.jsx`, add `useEffect` hook that watches `selected` prop changes
- Import `updateUrlParams` from `urlParams.js`
- When `selected` changes, update URL parameter `days-selected` with comma-separated 0-based indices
- Use `replace: true` flag to avoid polluting browser history during rapid selection changes
- Debounce URL updates (300ms) to avoid excessive history entries during drag selection

### 6. Integrate with SearchPage URL Sync System
- Open `app/src/islands/pages/SearchPage.jsx`
- Review existing `useEffect` hook that syncs filters to URL (around lines 705-740)
- Ensure `selectedDays` state is included in the URL synchronization
- Verify that `parseUrlToFilters` correctly initializes `selectedDays` from URL on mount
- Test that changing other filters doesn't reset day selection

### 7. Update HomePage Navigation
- Open `app/src/islands/pages/HomePage.jsx`
- Review `handleExploreRentals` function (lines 642-658)
- Verify it correctly converts 0-based `selectedDays` to URL parameter format
- Ensure validation logic (continuous days check, minimum days) runs before navigation
- Confirm URL format matches what SearchPage expects: `/search.html?days-selected=1,2,3,4,5`

### 8. Add Browser Navigation Support
- In `DaySelector.jsx`, add `popstate` event listener using `watchUrlChanges` utility
- When user clicks browser back/forward, update component state from URL
- Clean up event listener on component unmount
- Test that browser navigation correctly updates the schedule selector UI

### 9. Handle Edge Cases
- Add validation for out-of-range day indices (not 0-6)
- Handle empty URL parameter gracefully (fallback to default Monday-Friday)
- Handle malformed URL parameter (non-numeric values, negative numbers)
- Ensure component works correctly when URL parameter is explicitly empty
- Test behavior when `selected` prop changes externally (parent component override)

### 10. Test URL Synchronization Flow
- Manual testing: Open search page, verify Monday-Friday is selected by default
- Manual testing: Change selection, verify URL updates immediately
- Manual testing: Copy URL with `days-selected` parameter, paste in new tab, verify selection is restored
- Manual testing: Navigate from homepage with day selection, verify it appears in search page
- Manual testing: Use browser back/forward buttons, verify selection updates correctly

### 11. Test Integration with Existing Features
- Verify schedule selector still works with price calculation in SearchPage
- Verify map markers still update correctly when days change
- Verify lazy loading of listings still functions
- Verify other filters (borough, neighborhood, price tier) still work alongside day selection
- Test that clearing all filters (if such functionality exists) handles days correctly

### 12. Code Review and Cleanup
- Review all modified files for consistency with existing code style
- Ensure all functions have JSDoc comments
- Remove any console.log statements added during development
- Verify no unused imports
- Run code through formatter if project has one configured

## Testing Strategy

### Unit Tests
**DaySelector.jsx**:
- Default selection is Monday-Friday when no `selected` prop provided
- URL parameter with valid days initializes component correctly
- Invalid URL parameter falls back to Monday-Friday default
- Out-of-range day indices (< 0 or > 6) are filtered out
- URL updates when selection changes
- Debouncing prevents excessive URL updates during drag selection
- Browser navigation (popstate event) updates component state
- Component respects explicit `selected` prop over URL parameter

**urlParams.js**:
- `parseDaysParam` correctly parses comma-separated indices
- `parseDaysParam` handles invalid input gracefully
- `serializeFiltersToUrl` includes `days-selected` in output
- Day indices are validated to 0-6 range

**HomePage.jsx**:
- "Explore Rentals" button correctly passes `days-selected` parameter
- Validation runs before navigation (continuous days, minimum nights)
- URL format matches SearchPage expectations

### Edge Cases
1. **Empty URL parameter**: `search.html?days-selected=` → Falls back to Monday-Friday default
2. **Invalid day indices**: `search.html?days-selected=1,2,99` → Filters out 99, uses 1,2
3. **Negative indices**: `search.html?days-selected=-1,0,1` → Filters out -1, uses 0,1
4. **Non-numeric values**: `search.html?days-selected=a,b,c` → Falls back to Monday-Friday default
5. **Duplicate indices**: `search.html?days-selected=1,1,2,2` → Deduplicates to 1,2
6. **Out-of-order indices**: `search.html?days-selected=5,3,1` → Maintains order 5,3,1 (no forced sorting)
7. **Single day selection**: `search.html?days-selected=3` → Single day selected (may fail validation if minDays > 1)
8. **All days selected**: `search.html?days-selected=0,1,2,3,4,5,6` → All seven days selected
9. **URL parameter present but component receives explicit `selected` prop**: Prop takes precedence
10. **Rapid selection changes during drag**: Debouncing prevents URL thrashing
11. **Browser navigation during active drag**: Event listener handles state update gracefully
12. **Component unmounts before debounced URL update**: Cleanup prevents memory leak

## Acceptance Criteria
1. ✅ DaySelector component defaults to Monday-Friday (indices 1,2,3,4,5) when no `selected` prop or URL parameter is provided
2. ✅ Default is set at component level (DaySelector.jsx), not page level (SearchPage.jsx)
3. ✅ Opening `search.html` with no URL parameters shows Monday-Friday selected
4. ✅ Opening `search.html?days-selected=0,6` shows Sunday and Saturday selected (URL parameter works)
5. ✅ Changing day selection in DaySelector updates URL parameter `days-selected` with 0-based comma-separated indices
6. ✅ URL updates are debounced (300ms) to prevent excessive history entries during drag selection
7. ✅ Copying URL with `days-selected` parameter and opening in new tab restores the exact selection
8. ✅ Browser back/forward navigation updates the schedule selector UI to match URL state
9. ✅ Clicking "Explore Rentals" on homepage with selected days navigates to search page with `days-selected` parameter
10. ✅ SearchPage correctly initializes DaySelector from URL parameter on mount
11. ✅ Invalid URL parameters (out-of-range, non-numeric) fall back to Monday-Friday default
12. ✅ Empty URL parameter `days-selected=` falls back to Monday-Friday default
13. ✅ Existing SearchPage features (price calculation, map markers, lazy loading) continue to work correctly
14. ✅ All filters (borough, neighborhood, price tier, days) sync to URL simultaneously without conflicts

## Validation Commands
Execute these commands to validate the feature is complete:

### Code Compilation
```bash
npm run build
```
**Expected**: Build completes successfully with no errors or warnings related to DaySelector, SearchPage, or HomePage.

### Manual Testing Checklist
**Test 1: Default Selection**
1. Open browser to `http://localhost:5173/search.html` (no URL parameters)
2. **Expected**: Schedule selector shows Monday-Friday selected (days M T W T F highlighted)

**Test 2: URL Parameter Initialization**
1. Open browser to `http://localhost:5173/search.html?days-selected=0,6`
2. **Expected**: Schedule selector shows Sunday and Saturday selected (days S and S highlighted)

**Test 3: Selection Updates URL**
1. Open browser to `http://localhost:5173/search.html`
2. Click on Tuesday (deselect it)
3. **Expected**: URL updates to `search.html?days-selected=1,3,4,5` (Monday, Wednesday, Thursday, Friday)

**Test 4: URL Sharing**
1. Open browser to `http://localhost:5173/search.html?days-selected=2,3,4`
2. Copy the URL
3. Open URL in new browser tab
4. **Expected**: New tab shows Tuesday, Wednesday, Thursday selected

**Test 5: Browser Navigation**
1. Open browser to `http://localhost:5173/search.html`
2. Change selection to Sunday only
3. Change selection to Saturday only
4. Click browser back button
5. **Expected**: Schedule selector shows Sunday selected (previous state)
6. Click browser forward button
7. **Expected**: Schedule selector shows Saturday selected (forward state)

**Test 6: Homepage Navigation**
1. Open browser to `http://localhost:5173/` (homepage)
2. Select Wednesday, Thursday, Friday in the schedule selector
3. Click "Explore Rentals" button
4. **Expected**: Navigates to `search.html?days-selected=2,3,4` with Wednesday, Thursday, Friday selected

**Test 7: Invalid URL Parameter**
1. Open browser to `http://localhost:5173/search.html?days-selected=99,abc,-5`
2. **Expected**: Schedule selector falls back to Monday-Friday default

**Test 8: Empty URL Parameter**
1. Open browser to `http://localhost:5173/search.html?days-selected=`
2. **Expected**: Schedule selector falls back to Monday-Friday default

**Test 9: Integration with Filters**
1. Open browser to `http://localhost:5173/search.html`
2. Select borough "Brooklyn"
3. Select neighborhood "Williamsburg"
4. Change days to Tuesday-Thursday
5. **Expected**: URL contains `?borough=...&neighborhoods=...&days-selected=2,3,4` (all filters in URL)

**Test 10: Price Calculation**
1. Open browser to `http://localhost:5173/search.html`
2. Change selection to 2 days (e.g., Monday-Tuesday)
3. **Expected**: Listing prices update to show 2-night rates
4. Change selection to 5 days
5. **Expected**: Listing prices update to show 5-night rates

### Developer Tools Inspection
**Browser Console Check**:
```javascript
// Open browser console on search.html
// Run this command:
window.location.href
```
**Expected**: URL includes `days-selected` parameter matching visible selection

**React DevTools Check**:
1. Install React DevTools extension
2. Open search.html
3. Select "SearchPage" component
4. Inspect `selectedDays` state
5. **Expected**: State array matches visible selection and URL parameter

### Code Quality Validation
```bash
# Check for TODO or FIXME comments added during implementation
grep -r "TODO\|FIXME" app/src/islands/shared/DaySelector.jsx app/src/islands/pages/SearchPage.jsx app/src/islands/pages/HomePage.jsx
```
**Expected**: No output (all TODOs resolved)

```bash
# Check for console.log statements (should be removed in production code)
grep -r "console\.log" app/src/islands/shared/DaySelector.jsx app/src/islands/pages/SearchPage.jsx
```
**Expected**: No output or only intentional logging statements

### Git Status Verification
```bash
git status
```
**Expected**: Modified files should include only:
- `app/src/islands/shared/DaySelector.jsx`
- `app/src/islands/pages/SearchPage.jsx` (if modifications were needed)
- `app/src/islands/pages/HomePage.jsx` (if modifications were needed)
- `app/src/lib/constants.js`
- `app/src/lib/urlParams.js` (if enhancements were needed)

## Notes

### Implementation Considerations

**0-based vs 1-based Indexing**:
- JavaScript uses 0-based indexing: Sunday=0, Monday=1, ..., Saturday=6
- The original Bubble.io system uses 1-based indexing
- The `dayUtils.js` utility handles conversion between these systems
- This feature uses **0-based indexing** throughout for consistency with JavaScript Date API
- Monday-Friday default is `[1, 2, 3, 4, 5]` in 0-based indexing

**URL Parameter Format**:
- Format: `days-selected=1,2,3,4,5` (comma-separated, no spaces)
- Uses 0-based indexing for consistency with JavaScript
- Empty parameter `days-selected=` is treated as no selection (fallback to default)
- Duplicate indices are deduplicated automatically

**Debouncing Strategy**:
- URL updates are debounced by 300ms to prevent excessive browser history entries
- During drag selection, the URL updates only after user stops dragging for 300ms
- This provides a balance between immediate feedback and performance
- Alternative considered: Update URL only on `mouseup` event (rejected due to lack of intermediate state visibility)

**Component Props Precedence**:
1. Explicit `selected` prop (highest priority - parent component override)
2. URL parameter `days-selected` (medium priority - shareable state)
3. `DEFAULT_SELECTED_DAYS` constant (lowest priority - fallback)

This ensures maximum flexibility: parent components can force a selection, URL parameters work for sharing, and sensible defaults apply when nothing else is specified.

**Browser History Management**:
- Use `history.replaceState` (not `pushState`) for URL updates during selection changes
- This prevents the back button from stepping through every single day selection change
- Only meaningful state changes (e.g., applying a filter) should use `pushState`
- Exception: Initial navigation from homepage uses normal navigation (not replaceState)

**Performance Considerations**:
- Debouncing prevents excessive re-renders and URL updates
- URL parameter parsing happens only on mount and popstate events
- No polling or interval-based checks - purely event-driven
- Component state is local, avoiding unnecessary parent re-renders

**Accessibility**:
- Ensure URL updates don't interfere with screen reader announcements
- Verify keyboard navigation (Tab, Space, Enter) still works correctly
- Test that drag selection doesn't break with assistive technologies

**Future Enhancements** (Out of Scope for This Feature):
- Add "Clear Selection" button to reset to default Monday-Friday
- Add quick-select presets: "Weekday" (Mon-Fri), "Weekend" (Sat-Sun), "Full Week" (All 7)
- Implement URL parameter compression for complex filter combinations (e.g., base64 encoding)
- Add analytics tracking for most common day selection patterns
- Support multiple disjoint day ranges (e.g., Mon-Tue and Thu-Fri) - requires UX design
- Add tooltip on day cells showing day name (accessibility enhancement)

**Dependencies**:
- No new npm packages required
- All functionality uses existing utilities and React hooks
- Maintains compatibility with current Vite build configuration
- No database schema changes needed

**Backwards Compatibility**:
- Existing URLs without `days-selected` parameter continue to work (default Monday-Friday)
- Existing URLs with `days-selected` parameter continue to work (no breaking changes)
- Component API remains unchanged (only internal behavior modified)
- SearchPage integration uses existing filter sync patterns

**Testing Tools** (Optional):
- Consider adding Playwright test for URL parameter flows
- Consider adding Vitest unit test for `parseDaysParam` function
- Manual testing is sufficient for initial implementation
- Automated tests can be added as a follow-up task
