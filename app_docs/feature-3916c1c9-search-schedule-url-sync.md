# Search Schedule URL Synchronization

**ADW ID:** 3916c1c9
**Date:** 2025-11-12
**Specification:** specs/feature-3916c1c9-search-schedule-url-sync.md

## Overview

This feature implements bidirectional URL synchronization for the Search Schedule Selector, ensuring Monday-Friday is the default selection and that schedule selections persist in the URL. Users can now share search results with specific schedule filters, and browser back/forward navigation maintains schedule state.

## What Was Built

This implementation focused on fixing day indexing inconsistencies and ensuring URL parameters always reflect the current schedule selection:

- **Fixed HomePage day indexing** - Converted from 1-based (Bubble format) to 0-based indexing for URL parameters
- **Updated schedule preset buttons** - Weeknight, weekend, and monthly presets now use correct 0-based indices
- **Fixed listings navigation** - Both individual listing links and "Show More" links now use 0-based indexing
- **Removed conditional URL serialization** - Schedule selection is now always included in URL, even when set to Monday-Friday default
- **Maintained SearchPage URL synchronization** - Existing URL parameter reading/writing functionality remains intact

## Technical Implementation

### Files Modified

- `app/src/islands/pages/HomePage.jsx`: Fixed day indexing throughout component (3 sections modified)
  - **ScheduleSection** (lines 257-276): Updated preset day values from 1-based to 0-based
  - **ListingsPreview** (lines 408-420): Removed `+1` day conversion and updated defaults
  - **handleExploreRentals** (lines 651-656): Removed `toBubbleDays()` conversion for URL parameters

- `app/src/lib/urlParams.js`: Modified URL serialization logic
  - **serializeFiltersToUrl** (lines 93-101): Removed conditional check that prevented default days from appearing in URL

### Key Changes

1. **Unified Day Indexing**: All URL parameters now use 0-based indexing (0=Sunday, 1=Monday, ..., 6=Saturday), matching JavaScript's standard Date object and the SearchPage implementation

2. **Schedule Preset Conversions**:
   - Weeknight: `'2,3,4,5,6'` → `'1,2,3,4,5'` (Monday-Friday)
   - Weekend: `'6,7,1,2'` → `'5,6,0,1'` (Friday-Monday)
   - Monthly: `'1,2,3,4,5,6,7'` → `'0,1,2,3,4,5,6'` (All days)

3. **URL Parameter Always Visible**: The `days-selected` parameter now always appears in the URL, making shared links more explicit and predictable

4. **Removed Day Conversion Logic**: Eliminated `toBubbleDays()` conversion and `.map(d => d + 1)` arithmetic when constructing SearchPage URLs

## How to Use

### Default Behavior
1. Navigate to the search page (`/search.html`)
2. Monday-Friday will be selected by default
3. URL will contain `?days-selected=1,2,3,4,5`

### From HomePage
1. On the home page, the schedule selector defaults to Monday-Friday
2. Click "Explore Rentals" button
3. You'll be redirected to `/search.html?days-selected=1,2,3,4,5`
4. The search page will display Monday-Friday as selected

### Using Schedule Presets
1. On the home page, click any schedule preset button:
   - "Explore weeknight listings" → Monday-Friday (1,2,3,4,5)
   - "Explore weekend listings" → Friday-Monday (5,6,0,1)
   - "Explore monthly listings" → All days (0,1,2,3,4,5,6)
2. You'll be redirected to the search page with the preset schedule already selected

### Sharing URLs
1. Select your desired schedule on the search page
2. Copy the URL from your browser's address bar
3. Share the URL with others
4. When they open the link, they'll see the same schedule selection

### Browser Navigation
1. Change the schedule selection on the search page
2. Click the browser back button to revert to the previous schedule
3. Click the browser forward button to restore the next schedule
4. The schedule selector automatically updates to match the URL

## Configuration

No configuration is required. The default Monday-Friday selection is defined in `app/src/lib/constants.js` as `DEFAULTS.DEFAULT_SELECTED_DAYS: [1, 2, 3, 4, 5]`.

## Testing

### Verify Default Selection
```bash
# Open the search page without parameters
# Expected: Monday-Friday selected, URL shows ?days-selected=1,2,3,4,5
open http://localhost:5173/search.html
```

### Verify HomePage Integration
```bash
# Open the home page
# Click "Explore Rentals" button
# Expected: Redirects to /search.html?days-selected=1,2,3,4,5
open http://localhost:5173/index.html
```

### Verify Schedule Presets
```bash
# Test weeknight preset
# Expected: Redirects to /search.html?days-selected=1,2,3,4,5

# Test weekend preset
# Expected: Redirects to /search.html?days-selected=5,6,0,1

# Test monthly preset
# Expected: Redirects to /search.html?days-selected=0,1,2,3,4,5,6
```

### Verify URL Sharing
1. Navigate to `/search.html?days-selected=3,4,5,6` (Wednesday-Saturday)
2. Verify Wednesday-Saturday badges are highlighted
3. Change selection and verify URL updates immediately
4. Copy URL and open in new tab to verify persistence

## Notes

### Day Indexing Convention

The application uses **0-based indexing** for all URL parameters to match JavaScript's standard:
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

This differs from the Bubble API which uses 1-based indexing (1=Sunday through 7=Saturday). The conversion to Bubble format happens at the API boundary, not in URL parameters.

### Existing URL Synchronization Infrastructure

The SearchPage already had robust URL parameter handling via `urlParams.js`:
- `parseUrlToFilters()` - Reads URL parameters on page load
- `serializeFiltersToUrl()` - Converts filter state to URL parameters
- `updateUrlParams()` - Updates URL when state changes
- `watchUrlChanges()` - Listens for browser back/forward navigation

This implementation built upon this existing foundation, focusing primarily on fixing the day indexing inconsistencies that existed in HomePage.

### Why URL Always Shows days-selected

Previously, the URL parameter was omitted when the selection matched the default (Monday-Friday). This was changed to always include the parameter because:
1. **Explicit is better than implicit** - Users can see exactly what schedule is active
2. **Shareable links are more predictable** - Shared URLs always show the schedule
3. **Debugging is easier** - No need to remember what the default is
4. **Minimal overhead** - Adding 11 characters (`?days-selected=1,2,3,4,5`) to the URL is negligible

### Future Considerations

- The application still uses 1-based indexing internally for Bubble API calls. Future work could standardize on 0-based indexing throughout and convert only at the API boundary.
- Consider adding URL parameter validation to filter out invalid indices (>6) or duplicate values.
- The DaySelector component has advanced features (drag selection, contiguous validation) that work correctly with the default Monday-Friday selection.
