# Feature: Search Schedule Selector URL Parameter Sync and Default Selection

## Metadata
adw_id: `10`
prompt: `adw_sdlc_iso

I want you to update the default selections in the Search schedule Selector shared react island component to be Monday- Friday. I want this to be set in the island component level and not the page level. i want to also ensure that the search schedule selector's selection is reflected in the url with a parameter. You can retrieve context on how this was implemented in this Search page standalone directory, that was the precursor input used to build the current multipage app's search page section.
I want the Search schedule Selector to retrieve from the URL(only if the URL parameter is found and not empty) based on 0 based indexing, add selections to the Search schedule Selector. And vice versa, when selections are made, through/on the Search schedule Selector, the URL parameter is updated accordingly.

I also want this URL parameter to be appended when redirecting from the index page to the Search page, when 'Explore Rentals' is clicked.`

## Feature Description
This feature enhances the Search Schedule Selector component with bidirectional URL parameter synchronization and configurable default day selections. It ensures that:

1. **Component-level defaults**: DaySelector has Monday-Friday (days 1-5) as its internal default, independent of parent page initialization
2. **URL → Component**: When the search page loads with URL parameters, the schedule selector reads and applies the day selections from the URL
3. **Component → URL**: When users interact with the schedule selector, changes are immediately reflected in the URL for shareability
4. **Index page integration**: When users click "Explore Rentals" on the homepage, the selected days are passed to the search page via URL parameters

This creates a seamless user experience where schedule selections persist across page navigation, can be shared via URL, and maintain browser history for back/forward navigation.

## User Story
As a **user searching for rental properties**
I want to **select my preferred days of the week and have those selections persist in the URL**
So that **I can bookmark my search, share it with others, use browser back/forward buttons, and have my selections automatically applied when navigating from the homepage**

## Problem Statement
Currently, the Search Schedule Selector (DaySelector component) in the SearchPage has the following limitations:

1. **No URL synchronization**: Day selections are not reflected in the URL, making searches non-shareable
2. **No component-level defaults**: The default selection (Monday-Friday) is set at the page level in SearchPage.jsx, not in the DaySelector component itself
3. **Lost on navigation**: When navigating from the homepage to the search page, the schedule selection doesn't carry over with URL parameters
4. **No browser history**: Back/forward navigation doesn't restore previous day selections

These issues create a fragmented user experience where:
- Users can't bookmark their preferred schedule searches
- Sharing search results requires manually re-selecting days
- The homepage → search page flow loses the user's day selection context
- Browser navigation buttons don't work as expected with schedule changes

## Solution Statement
We will implement a comprehensive URL parameter synchronization system for the Search Schedule Selector:

1. **Component-level defaults**: Move the Monday-Friday default selection into the DaySelector component's props with a `defaultSelected` prop
2. **URL parameter reading**: Parse the `days-selected` URL parameter on SearchPage mount and initialize DaySelector with those values if present
3. **URL parameter writing**: Update the URL whenever the user changes day selections in DaySelector, using the existing `urlParams.js` utilities
4. **Homepage integration**: Modify HomePage.jsx to append the `days-selected` parameter when redirecting to the search page
5. **Browser history support**: Leverage the existing `watchUrlChanges` function to handle back/forward navigation

This solution follows the existing architecture patterns:
- Uses the established `urlParams.js` utilities for consistency
- Maintains 0-based day indexing throughout the React components
- Preserves the existing URL parameter format: `days-selected=1,2,3,4,5`
- Integrates seamlessly with the existing SearchPage filter state management

## Relevant Files
Use these files to implement the feature:

### Core Component Files
- **`app/src/islands/shared/DaySelector.jsx`** - The schedule selector component that needs URL parameter support and default selection configuration
- **`app/src/islands/pages/SearchPage.jsx`** - The search page that manages DaySelector state and coordinates URL synchronization
- **`app/src/islands/pages/HomePage.jsx`** - The homepage that needs to pass day selections to the search page via URL

### Library and Utility Files
- **`app/src/lib/urlParams.js`** - Contains URL parameter parsing and serialization utilities (`parseUrlToFilters`, `updateUrlParams`, `serializeFiltersToUrl`)
- **`app/src/lib/constants.js`** - Contains day constants and default values (`DAYS`, `DAY_NAMES`, `SCHEDULE_PATTERNS`, `DEFAULTS`)

### Configuration Files (for reference)
- **`README.md`** - Project architecture and conventions documentation

### New Files
None - all changes are modifications to existing files

## Implementation Plan

### Phase 1: Foundation - DaySelector Component Enhancement
Update the DaySelector component to accept default selections as a prop and expose the necessary interface for URL synchronization. This establishes the component-level contract before integrating with parent pages.

### Phase 2: Core Implementation - URL Synchronization in SearchPage
Implement the bidirectional URL ↔ component synchronization in SearchPage. This includes parsing URL parameters on mount, updating URLs when selections change, and handling browser navigation events.

### Phase 3: Integration - Homepage Navigation Enhancement
Modify the homepage to append schedule selections to the URL when navigating to the search page. This completes the end-to-end user flow from homepage → search page with persistent selections.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Constants Configuration
- Open `app/src/lib/constants.js`
- Locate the `DEFAULTS` object (should be around line 180+)
- Ensure `DEFAULT_SELECTED_DAYS` is set to `[1, 2, 3, 4, 5]` (Monday-Friday, 0-based indexing)
- Verify this constant is exported and available for import
- Document that this represents the component-level default, distinct from page-level initialization

### 2. Enhance DaySelector Component Props
- Open `app/src/islands/shared/DaySelector.jsx`
- Review the current prop structure (lines 30-48)
- Add a new optional prop `defaultSelected` with default value `[1, 2, 3, 4, 5]` (Monday-Friday)
- Update the JSDoc comment to document the new prop
- Ensure the component uses `defaultSelected` only when `selected` prop is empty/undefined on initial mount
- Do NOT change the existing `selected` and `onChange` prop behavior - keep it as controlled component

### 3. Verify URL Parameter Parsing in urlParams.js
- Open `app/src/lib/urlParams.js`
- Review the `parseDaysParam` function (lines 40-62)
- Verify it correctly parses comma-separated day indices from the `days-selected` URL parameter
- Verify it returns 0-based day indices (0-6) not 1-based
- Verify it has proper validation (NaN check, range check 0-6)
- Confirm the default fallback uses `DEFAULTS.DEFAULT_SELECTED_DAYS`
- No changes needed unless bugs are found

### 4. Verify URL Parameter Serialization in urlParams.js
- In `app/src/lib/urlParams.js`
- Review the `serializeFiltersToUrl` function (lines 88-131)
- Verify it correctly serializes `selectedDays` to the `days-selected` URL parameter
- Verify it only includes the parameter if different from default (optimization)
- Ensure it uses 0-based indexing (0-6) for consistency
- No changes needed unless bugs are found

### 5. Update SearchPage to Read URL on Mount
- Open `app/src/islands/pages/SearchPage.jsx`
- Locate the filter state initialization (around line 674-684)
- Verify the `parseUrlToFilters()` call is already executed (line 673)
- Verify `selectedDays` state is initialized from `urlFilters.selectedDays` (line 676)
- Verify the URL parsing happens BEFORE the first render
- This should already be working - validate the logic flow

### 6. Ensure SearchPage Updates URL on Selection Change
- In `app/src/islands/pages/SearchPage.jsx`
- Locate the `useEffect` that syncs filters to URL (lines 705-723)
- Verify `selectedDays` is included in the dependency array (line 723)
- Verify `selectedDays` is passed to `updateUrlParams` (line 713)
- Verify the `isInitialMount` check prevents double-updates on load (lines 707-710)
- This should already be working - validate the logic flow

### 7. Test SearchPage URL Synchronization Manually
- Start the dev server: `npm run dev`
- Navigate to `/search.html`
- Verify default selection is Monday-Friday (days 1,2,3,4,5)
- Change the day selection in the DaySelector
- Verify the URL updates to `?days-selected=X,Y,Z` with 0-based indices
- Manually edit the URL to `?days-selected=0,6` (Sunday, Saturday)
- Verify the DaySelector updates to show Sunday and Saturday selected
- Test browser back/forward buttons to verify history works

### 8. Update HomePage Explore Rentals Navigation
- Open `app/src/islands/pages/HomePage.jsx`
- Locate the `handleExploreRentals` function (lines 642-658)
- Review the current URL construction: `/search.html?days-selected=${bubbleDays.join(',')}`
- **IMPORTANT**: The HomePage currently uses 1-based indexing (Bubble format) in the URL
- Modify the URL construction to use 0-based indexing (React/JavaScript format)
- Change from `toBubbleDays(selectedDays)` to just `selectedDays.join(',')`
- Verify the validation logic (continuous days check) happens before navigation
- Ensure the URL format matches: `/search.html?days-selected=1,2,3,4,5` (0-based)

### 9. Update HomePage Schedule Section Links
- In `app/src/islands/pages/HomePage.jsx`
- Locate the `handleScheduleClick` function (lines 280-283)
- Review the current implementation: `days-selected=${days}` where days is like "2,3,4,5,6"
- **IMPORTANT**: This currently uses 1-based indexing (from line 260-268)
- Convert these to 0-based indexing:
  - Weeknight: Change `days: '2,3,4,5,6'` to `days: '1,2,3,4,5'` (Monday-Friday, 0-based)
  - Weekend: Change `days: '6,7,1,2'` to `days: '5,6,0,1'` (Fri-Mon, 0-based)
  - Monthly: Change `days: '1,2,3,4,5,6,7'` to `days: '0,1,2,3,4,5,6'` (All days, 0-based)
- Update the data structure in the `schedules` array (lines 253-278)

### 10. Update HomePage Listings Preview Links
- In `app/src/islands/pages/HomePage.jsx`
- Locate the `handleListingClick` function (lines 410-414)
- Review line 411: `selectedDays.map(d => d + 1).join(',')` - this converts to 1-based
- Remove the `+ 1` conversion: change to `selectedDays.join(',')`
- Locate the `handleShowMore` function (lines 416-420)
- Review line 417: Default is `'1,2,3,4,5,6'` which appears to be 1-based
- Change to `'0,1,2,3,4,5'` for 0-based Monday-Saturday default
- Or better yet, use `'1,2,3,4,5'` to match the Monday-Friday default

### 11. Test End-to-End Flow
- Start dev server: `npm run dev`
- Navigate to `/index.html` (homepage)
- Select custom days in the hero day selector (e.g., Tuesday-Thursday)
- Click "Explore Rentals" button
- Verify navigation to `/search.html?days-selected=2,3,4` (0-based)
- Verify the search page DaySelector shows Tuesday-Thursday selected
- Click a schedule preset on homepage (e.g., "Explore weeknight listings")
- Verify navigation to `/search.html?days-selected=1,2,3,4,5`
- Verify the search page shows Monday-Friday selected

### 12. Add Validation for Edge Cases
- In `app/src/lib/urlParams.js`, review `parseDaysParam` function
- Add validation to handle malformed URL parameters gracefully:
  - Empty string: return default
  - Out-of-range values (< 0 or > 6): filter out
  - Non-numeric values: filter out
  - Duplicate values: deduplicate with `[...new Set(days)]`
- Add console warnings in development mode for invalid parameters
- Ensure the function never throws, always returns valid array

### 13. Update DaySelector Documentation
- Open `app/src/islands/shared/DaySelector.jsx`
- Update the JSDoc comment at the top (lines 4-38)
- Add documentation for URL synchronization behavior
- Add examples showing how parent pages should handle URL sync
- Document the `defaultSelected` prop and its purpose
- Add a note about 0-based indexing consistency

### 14. Test Browser History and Back/Forward Navigation
- Navigate to search page with default selection (Monday-Friday)
- Change selection to Saturday-Sunday
- Verify URL updates to `?days-selected=6,0`
- Change selection again to Wednesday-Friday
- Verify URL updates to `?days-selected=3,4,5`
- Click browser back button twice
- Verify DaySelector shows Saturday-Sunday
- Verify URL shows `?days-selected=6,0`
- Click browser forward button
- Verify DaySelector shows Wednesday-Friday

### 15. Create Manual Test Cases Document
- Create a test plan covering all scenarios:
  - Default selection (Monday-Friday) on fresh search page load
  - URL parameter reading on page load with custom selection
  - URL updating when user changes selection
  - Homepage → search page navigation with selections
  - Schedule preset buttons on homepage
  - Listing cards navigation from homepage
  - Browser back/forward button behavior
  - Bookmarking and sharing URLs
  - Invalid URL parameters (malformed, out of range)
- Execute all test cases and document results

## Testing Strategy

### Unit Tests
**Note**: This codebase does not currently have a unit testing framework. Future implementation should include:

1. **URL Parameter Parsing**
   - Test `parseDaysParam` with valid inputs: `"1,2,3,4,5"` → `[1,2,3,4,5]`
   - Test with invalid inputs: `"a,b,c"` → default `[1,2,3,4,5]`
   - Test with out-of-range: `"7,8,9"` → default `[1,2,3,4,5]`
   - Test with mixed valid/invalid: `"1,abc,3"` → `[1,3]`

2. **URL Parameter Serialization**
   - Test `serializeFiltersToUrl` includes `days-selected` when not default
   - Test it omits `days-selected` when equal to default (optimization)
   - Test 0-based indexing is preserved: `[0,6]` → `"days-selected=0,6"`

3. **Component Defaults**
   - Test DaySelector initializes with Monday-Friday when no props provided
   - Test DaySelector uses `selected` prop when provided (controlled behavior)
   - Test DaySelector calls `onChange` with correct 0-based indices

### Integration Tests
**Recommended Playwright Tests** (to be created):

1. **Search Page URL Sync**
   ```javascript
   test('should load selections from URL parameter', async ({ page }) => {
     await page.goto('/search.html?days-selected=0,6');
     // Assert Sunday and Saturday are selected
   });
   ```

2. **Homepage to Search Navigation**
   ```javascript
   test('should carry over selections when clicking Explore Rentals', async ({ page }) => {
     await page.goto('/index.html');
     // Click Tuesday, Wednesday, Thursday
     // Click "Explore Rentals"
     // Assert URL contains ?days-selected=2,3,4
   });
   ```

3. **Browser History**
   ```javascript
   test('should restore selections on browser back/forward', async ({ page }) => {
     await page.goto('/search.html');
     // Change selection to Saturday-Sunday
     // Wait for URL update
     // Change to Wednesday-Friday
     await page.goBack();
     // Assert Saturday-Sunday are selected
   });
   ```

### Edge Cases
1. **Malformed URL Parameters**
   - URL: `/search.html?days-selected=abc,def` → Should fall back to Monday-Friday default
   - URL: `/search.html?days-selected=` → Should fall back to default
   - URL: `/search.html?days-selected=1,1,1` → Should deduplicate to `[1]`

2. **Out-of-Range Values**
   - URL: `/search.html?days-selected=-1,10,7` → Should filter to empty, use default
   - URL: `/search.html?days-selected=1,2,100` → Should filter to `[1,2]`

3. **Boundary Conditions**
   - Single day selection: `/search.html?days-selected=3` → Should work (Wednesday only)
   - All days: `/search.html?days-selected=0,1,2,3,4,5,6` → Should work
   - No days (cleared): Component should handle empty selection gracefully

4. **Navigation Edge Cases**
   - Homepage with no selection → Should use Monday-Friday default when navigating
   - Homepage with invalid continuous selection (e.g., Mon, Wed, Fri) → Should block navigation or show error
   - Search page back button to homepage → Homepage should restore previous selection

5. **Multiple Filter Changes**
   - Change borough, then days, then neighborhood → URL should reflect all changes
   - Use browser back button → Should restore all filters, not just days

## Acceptance Criteria
1. ✅ **Component Default**: DaySelector component has Monday-Friday (1-5) as default, configured at component level, not page level
2. ✅ **URL Reading**: Search page reads `days-selected` URL parameter on mount and initializes DaySelector correctly with 0-based indices
3. ✅ **URL Writing**: DaySelector changes are immediately reflected in the URL as `?days-selected=X,Y,Z` with 0-based indices
4. ✅ **Homepage Integration**: Clicking "Explore Rentals" on homepage navigates to search page with `?days-selected=X,Y,Z` parameter
5. ✅ **Schedule Presets**: Clicking schedule preset buttons on homepage (weeknight, weekend, monthly) navigates with correct 0-based day parameters
6. ✅ **Browser History**: Back/forward buttons correctly restore previous day selections and update both URL and DaySelector
7. ✅ **URL Shareability**: Copying and pasting a search URL with `days-selected` parameter correctly restores the selection
8. ✅ **0-Based Indexing**: All internal React code consistently uses 0-based day indexing (0=Sunday, 6=Saturday)
9. ✅ **Validation**: Malformed or invalid URL parameters gracefully fall back to the Monday-Friday default
10. ✅ **No Regression**: Existing filter synchronization (borough, neighborhoods, price, sort) continues to work correctly

## Validation Commands
Execute these commands to validate the feature is complete:

- `npm run dev` - Start the development server and perform manual testing
- Navigate to `http://localhost:5173/search.html?days-selected=1,2,3,4,5` - Verify Monday-Friday loads correctly
- Navigate to `http://localhost:5173/search.html?days-selected=0,6` - Verify Sunday-Saturday loads correctly
- Navigate to `http://localhost:5173/search.html?days-selected=abc` - Verify falls back to Monday-Friday default
- Navigate to `http://localhost:5173/index.html` - Test "Explore Rentals" navigation
- Click "Explore weeknight listings" - Verify navigation to `/search.html?days-selected=1,2,3,4,5`
- Click "Explore weekend listings" - Verify navigation to `/search.html?days-selected=5,6,0,1`
- On search page, change day selection - Verify URL updates without page reload
- Use browser back button - Verify selection restores to previous state
- `npm run build` - Verify production build succeeds without errors
- `npm run preview` - Verify production build works correctly with URL parameters

## Notes

### Indexing Consistency
The codebase uses **0-based day indexing** internally (JavaScript standard: 0=Sunday, 6=Saturday). This is consistent across:
- DaySelector component state
- SearchPage component state
- URL parameters (`days-selected`)
- All internal React logic

The **1-based indexing** (Bubble API format: 1=Sunday, 7=Saturday) is only used when communicating with external Bubble.io APIs. There are utility functions `toBubbleDays()` and `fromBubbleDays()` in `dayUtils.js` for conversion.

### Existing URL Parameter System
The codebase already has a robust URL parameter management system in `urlParams.js`:
- `parseUrlToFilters()` - Reads all filter parameters from URL
- `updateUrlParams()` - Writes filter parameters to URL
- `watchUrlChanges()` - Listens for browser back/forward navigation
- `serializeFiltersToUrl()` - Converts filter object to query string

This feature extends this existing system to fully support the `days-selected` parameter.

### Performance Considerations
- URL updates use `replaceState` vs `pushState` to avoid polluting browser history with every keystroke
- The `isInitialMount` flag prevents duplicate URL updates on page load
- URL serialization only includes non-default values to keep URLs clean
- The existing `fetchInProgressRef` prevents duplicate API calls when URL changes

### Future Enhancements
1. **Keyboard Navigation**: Add keyboard shortcuts for quick day selection (e.g., 1-7 keys)
2. **Preset Buttons**: Add quick preset buttons directly in DaySelector (Weeknight, Weekend, All)
3. **URL Shortening**: Implement a URL shortener for cleaner shared links
4. **Analytics**: Track which day combinations are most popular for product insights
5. **Accessibility**: Add ARIA live regions to announce selection changes to screen readers
6. **Mobile Gestures**: Support swipe gestures for quick day range selection on mobile

### Related Documentation
- **URL Parameter Design**: See `app/src/lib/urlParams.js` for implementation details
- **Day Indexing Standards**: See `app/src/lib/constants.js` for day constants and conventions
- **Component API**: See `app/src/islands/shared/DaySelector.jsx` for prop documentation
- **Architecture**: See `README.md` for React Islands Architecture patterns
