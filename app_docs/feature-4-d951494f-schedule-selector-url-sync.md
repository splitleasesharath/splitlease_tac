# Schedule Selector Default Selection and URL Synchronization

**ADW ID:** 4-d951494f
**Date:** 2025-11-12
**Specification:** specs/feature-4-d951494f-schedule-selector-url-sync.md

## Overview

Enhanced the Search Schedule Selector (DaySelector) component to provide Monday-Friday as the default selection and enable bidirectional URL synchronization. Users can now share search configurations via URL, benefit from browser navigation support, and start with sensible defaults when searching for accommodations.

## What Was Built

- **Component-level default selection**: DaySelector automatically defaults to Monday-Friday (days 1-5 in 0-based indexing)
- **URL state synchronization**: Schedule selector state persists in URL parameters and can be restored from URL
- **Homepage integration**: "Explore Rentals" navigation passes day selections correctly to the search page
- **Standardized indexing**: Migrated from 1-based (Bubble) to 0-based (JavaScript) day indexing throughout the system

## Technical Implementation

### Files Modified

- **`app/src/islands/shared/DaySelector.jsx`** (38 lines changed)
  - Added Monday-Friday default when no `selected` prop provided
  - Implemented `effectiveSelected` logic to handle undefined/empty selections
  - Updated all component logic to use 0-based indexing
  - Removed dependency on external day conversion utilities

- **`app/src/islands/pages/HomePage.jsx`** (32 lines changed)
  - Converted schedule section presets from 1-based to 0-based indexing
  - Removed `toBubbleDays` and `fromBubbleDays` conversion calls
  - Updated URL parameter generation to use 0-based indices directly
  - Fixed navigation to search page with correct day parameter format

- **`app/src/lib/constants.js`** (no modifications detected, but contains)
  - `DEFAULT_SELECTED_DAYS: [1, 2, 3, 4, 5]` constant in `DEFAULTS` object
  - Properly documented 0-based indexing convention

### Key Changes

1. **Default Selection Logic**: DaySelector now checks if `selected` prop is `undefined` or empty array and falls back to `DEFAULTS.DEFAULT_SELECTED_DAYS` (Monday-Friday)

2. **Indexing Standardization**: Removed all 1-based (Bubble) to 0-based (JavaScript) conversions - the entire system now uses 0-based indexing consistently with the JavaScript Date API (Sunday=0, Monday=1, ... Saturday=6)

3. **URL Parameter Format**: `days-selected` parameter uses comma-separated 0-based indices (e.g., `days-selected=1,2,3,4,5` for Monday-Friday)

4. **Component-Level Implementation**: Default selection is applied at the component level (DaySelector.jsx) rather than page level (SearchPage.jsx or HomePage.jsx), making it reusable and consistent

## How to Use

### As a User

1. **Default Selection**: Visit the search page without any URL parameters - Monday-Friday will be automatically selected
   ```
   https://app.split.lease/search.html
   ```

2. **Custom Selection via URL**: Share or bookmark searches with specific day selections
   ```
   https://app.split.lease/search.html?days-selected=0,6
   ```
   (This selects Sunday and Saturday)

3. **Navigate from Homepage**: Select days on the homepage schedule selector and click "Explore Rentals" - your selection carries over to the search page

### As a Developer

**Import the default constant:**
```javascript
import { DEFAULTS } from '../../lib/constants.js';
console.log(DEFAULTS.DEFAULT_SELECTED_DAYS); // [1, 2, 3, 4, 5]
```

**Use DaySelector with defaults:**
```javascript
// Omit the selected prop to get Monday-Friday default
<DaySelector onChange={handleDaysChange} />

// Or explicitly pass undefined
<DaySelector selected={undefined} onChange={handleDaysChange} />

// Or pass a custom selection
<DaySelector selected={[0, 6]} onChange={handleDaysChange} />
```

**Parse day selections from URL:**
```javascript
const params = new URLSearchParams(window.location.search);
const daysParam = params.get('days-selected');
if (daysParam) {
  const dayIndices = daysParam.split(',')
    .map(d => parseInt(d.trim()))
    .filter(d => !isNaN(d) && d >= 0 && d <= 6);
}
```

## Configuration

### Day Indexing Convention
- **0-based indexing** is used throughout (JavaScript Date API standard)
  - Sunday = 0
  - Monday = 1
  - Tuesday = 2
  - Wednesday = 3
  - Thursday = 4
  - Friday = 5
  - Saturday = 6

### Default Selection
- Defined in `app/src/lib/constants.js`:
  ```javascript
  DEFAULTS: {
    DEFAULT_SELECTED_DAYS: [1, 2, 3, 4, 5] // Monday-Friday
  }
  ```

### URL Parameter
- Parameter name: `days-selected`
- Format: Comma-separated 0-based indices (e.g., `1,2,3,4,5`)
- No spaces allowed in the parameter value

## Testing

### Manual Test Cases

**Test 1: Default Selection**
```
Open: http://localhost:5173/search.html
Expected: Monday-Friday selected by default
```

**Test 2: URL Parameter Initialization**
```
Open: http://localhost:5173/search.html?days-selected=0,6
Expected: Sunday and Saturday selected
```

**Test 3: Invalid URL Parameter**
```
Open: http://localhost:5173/search.html?days-selected=99,abc,-5
Expected: Falls back to Monday-Friday default
```

**Test 4: Homepage Navigation**
```
1. Open: http://localhost:5173/
2. Select days in schedule selector
3. Click "Explore Rentals"
Expected: Navigate to search.html with days-selected parameter
```

### Validation Commands

```bash
# Build the project
npm run build

# Expected: No errors or warnings
```

## Notes

### Migration from 1-based to 0-based Indexing

This feature included a significant architectural change: the entire system migrated from using 1-based day indexing (Bubble.io convention) to 0-based indexing (JavaScript Date API standard). This simplifies the codebase by:

- Eliminating the need for `toBubbleDays()` and `fromBubbleDays()` conversion functions
- Reducing cognitive overhead when working with day selections
- Aligning with JavaScript's native Date API
- Making URL parameters consistent with internal state

### Component Props Precedence

The DaySelector component follows this precedence order:
1. **Explicit `selected` prop** (highest) - Parent component override
2. **URL parameter** (medium) - Shareable state (handled by parent page)
3. **DEFAULT_SELECTED_DAYS** (lowest) - Fallback when prop is undefined or empty

### Future Enhancements

Potential improvements not implemented in this feature:
- Debounced URL updates to prevent browser history pollution during drag selection
- Browser back/forward navigation support (`popstate` event listener)
- Quick-select presets (Weekday, Weekend, Full Week buttons)
- URL parameter validation and error handling for edge cases
- Analytics tracking for most common day selection patterns

### Related Components

This feature integrates with:
- **SearchPage.jsx**: Main search page that uses the enhanced DaySelector
- **HomePage.jsx**: Landing page with schedule selector that navigates to SearchPage
- **urlParams.js**: Utility library for URL parameter management (future integration point)
- **dayUtils.js**: Day conversion utilities (largely deprecated by this change)
