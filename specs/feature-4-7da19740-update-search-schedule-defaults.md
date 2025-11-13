# Feature: Update Search Schedule Selector Default to Monday-Friday with URL Synchronization

## Metadata
adw_id: `4`
branch_id: `7da19740`
prompt: `I want you to update the default selections in the Search schedule Selector shared react island component to be Monday- Friday. I want this to be set in the island component level and not the page level. i want to also ensure that the search schedule selector's selection is reflected in the url with a parameter. You can retrieve context on how this was implemented in this Search page standalone directory, that was the precursor input used to build the current multipage app's search page section. I want the Search schedule Selector to retrieve from the URL(only if the URL parameter is found and not empty) based on 0 based indexing, add selections to the Search schedule Selector. And vice versa, when selections are made, through/on the Search schedule Selector, the URL parameter is updated accordingly. I also want this URL parameter to be appended when redirecting from the index page to the Search page, when 'Explore Rentals' is clicked.`

## Feature Description
Update the DaySelector component (Search Schedule Selector) to have Monday-Friday as its default selection at the component level, ensure bidirectional URL parameter synchronization (component ↔ URL), and pass selected days from the HomePage "Explore Rentals" button to the Search page via URL parameters.

This feature ensures:
1. **Component-Level Defaults**: DaySelector has Monday-Friday [1,2,3,4,5] as its default when no URL parameter is provided
2. **URL Reading**: DaySelector reads from URL parameter `days-selected` (0-based indexing) on mount
3. **URL Writing**: DaySelector updates URL parameter when user changes selection
4. **HomePage Integration**: "Explore Rentals" button passes selected days to Search page via URL

## User Story
As a user searching for shared accommodations
I want the schedule selector to default to Monday-Friday (weeknight stays)
So that I can quickly search for the most common rental pattern without manual selection

As a user sharing search results
I want my schedule selection to be preserved in the URL
So that I can bookmark or share my exact search criteria with others

As a user navigating from the homepage
I want my day selections on the homepage to carry over to the search page
So that I have a seamless experience without re-selecting my preferences

## Problem Statement
Currently, the DaySelector component does not have built-in default values at the component level. Defaults are managed by parent components (SearchPage, HomePage) or constants.js, which violates the principle of component-level encapsulation. Additionally, the URL synchronization logic exists in the parent SearchPage component rather than within DaySelector itself, making it harder to maintain and reuse the component across different pages.

**Current Issues:**
1. DaySelector receives `selected=[]` prop and relies on parent to provide defaults
2. URL parameter reading happens in SearchPage via `urlParams.js`, not in DaySelector
3. URL parameter writing happens in SearchPage's `useEffect`, creating tight coupling
4. HomePage "Explore Rentals" button uses custom conversion logic (`toBubbleDays`) that's inconsistent with SearchPage

**Impact:**
- DaySelector cannot be reused independently without parent managing defaults and URL sync
- Maintenance requires changes in multiple files for schedule-related features
- Potential for inconsistencies between HomePage and SearchPage day handling

## Solution Statement
Refactor DaySelector to be a self-contained, stateful component that:
1. **Manages its own default state**: Monday-Friday [1,2,3,4,5] when no URL parameter exists
2. **Reads from URL on mount**: Parses `days-selected` parameter using 0-based indexing
3. **Writes to URL on change**: Updates `days-selected` parameter when user modifies selection
4. **Provides clean API**: Exposes `onChange` callback for parent notifications while handling URL internally

Update SearchPage to:
- Remove URL synchronization logic (now handled by DaySelector)
- Receive day changes via `onChange` callback only
- Simplify state management by delegating to DaySelector

Update HomePage to:
- Ensure "Explore Rentals" button uses 0-based indexing consistently
- Remove `toBubbleDays` conversion (no longer needed)
- Pass days directly in URL format matching SearchPage expectations

## Relevant Files

### Core Component Files
- **`app/src/islands/shared/DaySelector.jsx`** (lines 1-448)
  - Main component to update with URL synchronization and default state management
  - Currently accepts `selected` prop from parent, needs to become self-managing
  - Already has validation logic (contiguity, minimum nights)

- **`app/src/lib/urlParams.js`** (lines 1-200)
  - Contains URL parsing/serialization utilities
  - `parseDaysParam()` function (lines 46-62) for parsing `days-selected` parameter
  - `serializeFiltersToUrl()` function (lines 93-150) for building query strings
  - Will be imported by DaySelector for URL operations

- **`app/src/lib/constants.js`** (lines 356-367)
  - Contains `DEFAULTS.DEFAULT_SELECTED_DAYS = [1,2,3,4,5]` (Monday-Friday)
  - Will be imported by DaySelector for default values
  - No changes needed, already defines correct defaults

### Page Integration Files
- **`app/src/islands/pages/SearchPage.jsx`** (lines 1-1500)
  - Parent component that uses DaySelector
  - Currently manages `selectedDays` state and URL synchronization (lines 676-720)
  - Needs refactoring to remove URL sync logic and rely on DaySelector callbacks
  - Will receive day changes via `onChange` only

- **`app/src/islands/pages/HomePage.jsx`** (lines 1-800)
  - Contains "Explore Rentals" button and hero section day selector
  - `handleExploreRentals()` function (lines 642-658) builds search URL
  - `toBubbleDays()` conversion function (lines 630-640) - needs removal
  - Must be updated to use 0-based indexing consistently

### Utility Files
- **`app/src/lib/sanitize.js`**
  - Used by `urlParams.js` for input sanitization
  - No changes needed, already handles parameter validation

### New Files
None - This feature refactors existing components only

## Implementation Plan

### Phase 1: Foundation
Before implementing the main feature, we need to:
1. **Audit current URL parameter flow** in SearchPage to understand all dependencies
2. **Review DaySelector component structure** to identify state management hooks
3. **Identify HomePage day conversion logic** to understand the `toBubbleDays` function
4. **Create backup branch** to ensure we can rollback if needed

### Phase 2: Core Implementation
Implement the URL synchronization and default state management in DaySelector:

1. **Add URL state management to DaySelector**:
   - Import `parseUrlToFilters`, `updateUrlParams` from `urlParams.js`
   - Import `DEFAULTS` from `constants.js`
   - Add `useEffect` hook to read URL parameter on mount
   - Add `useEffect` hook to write URL parameter when selection changes
   - Initialize component state from URL or defaults

2. **Update DaySelector component API**:
   - Remove dependency on `selected` prop (or make it optional/override)
   - Keep `onChange` callback for parent notifications
   - Make component self-managing with internal state
   - Ensure backward compatibility with existing parent components

3. **Refactor SearchPage integration**:
   - Remove `selectedDays` state management (now in DaySelector)
   - Remove URL synchronization logic from SearchPage
   - Update DaySelector usage to rely on `onChange` callback only
   - Simplify component by delegating to DaySelector

4. **Update HomePage integration**:
   - Remove `toBubbleDays()` conversion function
   - Update `handleExploreRentals()` to use 0-based indexing directly
   - Ensure consistency with SearchPage URL format
   - Test navigation from HomePage to SearchPage

### Phase 3: Integration & Testing
Verify the feature works end-to-end across all use cases:

1. **Test URL reading**:
   - Navigate to `/search.html?days-selected=1,2,3,4,5` → should show Mon-Fri selected
   - Navigate to `/search.html?days-selected=5,6,0` → should show Fri-Sun selected
   - Navigate to `/search.html` (no param) → should default to Mon-Fri

2. **Test URL writing**:
   - Change selection in DaySelector → URL should update immediately
   - Browser back/forward buttons → should restore correct selection

3. **Test HomePage integration**:
   - Select days on HomePage → click "Explore Rentals" → SearchPage should show same days
   - Verify URL parameter is correct (0-based indexing)

4. **Test edge cases**:
   - Invalid URL parameter → should fall back to defaults
   - Empty URL parameter → should fall back to defaults
   - Out-of-range values (e.g., day 7) → should be filtered out

## Step by Step Tasks

### 1. Audit Current Implementation and Dependencies
- Read `app/src/islands/pages/SearchPage.jsx` to understand current URL synchronization logic
- Read `app/src/islands/pages/HomePage.jsx` to understand `toBubbleDays` conversion
- Document all places where `selectedDays` state is used in SearchPage
- Identify any other components that might depend on SearchPage's `selectedDays` state

### 2. Refactor DaySelector to be Self-Managing with URL Sync
- Add imports for `parseUrlToFilters`, `updateUrlParams` from `urlParams.js`
- Add import for `DEFAULTS` from `constants.js`
- Add internal state management with `useState` hook for selected days
- Add `useEffect` hook to read URL parameter on mount and initialize state
- Add `useEffect` hook to write URL parameter when selection changes
- Update component to use internal state instead of `selected` prop
- Keep `onChange` callback for parent notifications (called after URL update)
- Ensure `minDays` and `requireContiguous` validation still works

### 3. Update SearchPage Integration
- Remove `selectedDays` state from SearchPage component
- Remove URL synchronization logic from SearchPage
- Update DaySelector usage to only provide `onChange` callback
- Update listing query logic to receive days from `onChange` callback
- Update map markers logic to receive days from `onChange` callback
- Simplify component by removing URL parameter management code
- Test that filters still work correctly with new DaySelector API

### 4. Update HomePage Integration
- Remove `toBubbleDays()` conversion function from HomePage
- Update `handleExploreRentals()` to use 0-based indexing directly
- Change URL construction from `bubbleDays.join(',')` to `selectedDays.join(',')`
- Ensure `areDaysContinuous()` validation uses 0-based indexing
- Update any comments or documentation referencing Bubble day format
- Test navigation from HomePage to SearchPage with various day selections

### 5. Test URL Reading (Navigate to SearchPage with URL Params)
- Test case: `/search.html?days-selected=1,2,3,4,5` → should show Mon-Fri selected
- Test case: `/search.html?days-selected=5,6,0` → should show Fri-Sun selected (wrap-around)
- Test case: `/search.html?days-selected=0,1,2,3,4,5,6` → should show all days selected
- Test case: `/search.html?days-selected=3` → should show only Wed selected
- Test case: `/search.html` (no parameter) → should default to Mon-Fri [1,2,3,4,5]
- Verify DaySelector renders correct visual state for each case

### 6. Test URL Writing (Change Selection in DaySelector)
- Test case: Select different days → URL should update with `days-selected` parameter
- Test case: Clear selection → URL should update to show empty or default
- Test case: Rapid changes → URL should update smoothly without race conditions
- Test case: Browser back button → should restore previous selection
- Test case: Browser forward button → should restore next selection
- Verify no console errors during URL updates

### 7. Test HomePage to SearchPage Navigation
- Test case: Select Mon-Fri on HomePage → click "Explore Rentals" → SearchPage shows Mon-Fri
- Test case: Select Fri-Sun on HomePage → click "Explore Rentals" → SearchPage shows Fri-Sun
- Test case: Select invalid (non-contiguous) days → should show error on HomePage
- Test case: Select 1 day only → should show error on HomePage (minimum 2-5 days)
- Verify URL parameter is correctly formatted (0-based, comma-separated)
- Verify SearchPage DaySelector reads the URL parameter correctly

### 8. Test Edge Cases and Error Handling
- Test case: Invalid URL parameter `days-selected=abc` → should fall back to defaults
- Test case: Invalid URL parameter `days-selected=7,8,9` → should filter out invalid days
- Test case: Empty URL parameter `days-selected=` → should fall back to defaults
- Test case: Malformed URL parameter `days-selected=1,,3` → should handle gracefully
- Test case: Mixed valid/invalid `days-selected=1,2,abc,4` → should keep valid days only
- Verify console shows helpful error messages for debugging
- Verify user experience is not disrupted by invalid inputs

### 9. Verify Backward Compatibility
- Test that map markers still update correctly when days change
- Test that listing prices still recalculate when days change
- Test that filters work correctly in combination with day selection
- Test that all existing SearchPage features still function
- Verify no regressions in HomePage hero section functionality
- Check that DaySelector validation (contiguity, minimum nights) still works

### 10. Code Review and Documentation
- Add JSDoc comments to new functions in DaySelector
- Update component documentation to reflect new self-managing behavior
- Add inline comments explaining URL synchronization logic
- Update any README or technical documentation if needed
- Verify code follows existing patterns and conventions
- Check for any console.log statements to remove

## Testing Strategy

### Unit Tests
While this project doesn't currently have a test suite, the following tests would be valuable for future implementation:

**DaySelector Component Tests**:
- `DaySelector` renders with default Monday-Friday selection when no URL parameter exists
- `DaySelector` reads URL parameter `days-selected=1,2,3,4,5` and renders correctly
- `DaySelector` reads URL parameter with wrap-around days `days-selected=5,6,0` correctly
- `DaySelector` updates URL parameter when user changes selection
- `DaySelector` falls back to defaults when URL parameter is invalid
- `DaySelector` filters out invalid day values (e.g., 7, 8, 9)
- `DaySelector` calls `onChange` callback after updating URL
- `DaySelector` validates contiguity and minimum nights correctly

**SearchPage Integration Tests**:
- `SearchPage` receives day changes from DaySelector via `onChange` callback
- `SearchPage` updates listing query when days change
- `SearchPage` updates map markers when days change
- `SearchPage` does not manage URL parameters directly (delegated to DaySelector)

**HomePage Integration Tests**:
- `HomePage` "Explore Rentals" button navigates to SearchPage with correct URL parameter
- `HomePage` uses 0-based indexing consistently
- `HomePage` validates day selection before navigation
- `HomePage` constructs URL in format `/search.html?days-selected=1,2,3,4,5`

### Manual Testing Checklist
- [ ] Navigate to `/search.html` with no parameters → DaySelector shows Mon-Fri
- [ ] Navigate to `/search.html?days-selected=1,2,3,4,5` → DaySelector shows Mon-Fri
- [ ] Navigate to `/search.html?days-selected=5,6,0` → DaySelector shows Fri-Sun
- [ ] Change selection in DaySelector → URL updates immediately
- [ ] Browser back/forward buttons → selection state restores correctly
- [ ] Select days on HomePage → click "Explore Rentals" → SearchPage shows same days
- [ ] Invalid URL parameter → falls back to Mon-Fri defaults
- [ ] Map markers update when day selection changes
- [ ] Listing prices recalculate when day selection changes
- [ ] No console errors during URL updates
- [ ] No console errors during navigation from HomePage

### Edge Cases

**URL Parameter Edge Cases**:
1. **Empty parameter**: `/search.html?days-selected=` → should default to Mon-Fri
2. **Whitespace**: `/search.html?days-selected=1, 2, 3` → should parse correctly (trim whitespace)
3. **Duplicate values**: `/search.html?days-selected=1,1,2,3` → should deduplicate
4. **Out of range**: `/search.html?days-selected=7,8,9` → should filter out
5. **Mixed valid/invalid**: `/search.html?days-selected=1,abc,3` → should keep valid only
6. **Negative numbers**: `/search.html?days-selected=-1,0,1` → should filter out negatives
7. **Very long list**: `/search.html?days-selected=0,1,2,3,4,5,6,7,8,9,10` → should cap at 0-6

**Component State Edge Cases**:
1. **Rapid selection changes** → should debounce URL updates to avoid performance issues
2. **Parent component updates** → DaySelector should not override URL-derived state
3. **Browser back button** → should restore previous day selection
4. **Page refresh** → should restore selection from URL
5. **Deep linking** → shared URLs should restore exact state

**HomePage Navigation Edge Cases**:
1. **No days selected** → should show error, not navigate
2. **Single day selected** → should show error (minimum 2-5 days)
3. **More than 5 days selected** → should validate contiguity
4. **Non-contiguous days** → should show error
5. **Wrap-around selection** (Fri-Mon) → should be valid, navigate correctly

## Acceptance Criteria

### Primary Criteria
1. ✅ **Default Selection**: DaySelector shows Monday-Friday [1,2,3,4,5] when no URL parameter exists
2. ✅ **URL Reading**: DaySelector reads `days-selected` URL parameter on mount using 0-based indexing
3. ✅ **URL Writing**: DaySelector updates `days-selected` URL parameter when user changes selection
4. ✅ **HomePage Integration**: "Explore Rentals" button passes selected days via URL to SearchPage
5. ✅ **0-Based Indexing**: All components use consistent 0-based indexing (0=Sunday, 1=Monday, etc.)
6. ✅ **No `toBubbleDays`**: Remove custom conversion logic from HomePage

### Secondary Criteria
7. ✅ **Backward Compatibility**: SearchPage listing queries and map markers still work correctly
8. ✅ **Browser Navigation**: Back/forward buttons restore correct day selection
9. ✅ **Error Handling**: Invalid URL parameters fall back to defaults gracefully
10. ✅ **No Regressions**: All existing features (filters, map, pricing) continue to work
11. ✅ **Clean Code**: Remove unnecessary state management from parent components
12. ✅ **Documentation**: Add JSDoc comments explaining new URL synchronization logic

### User Experience Criteria
13. ✅ **Immediate Feedback**: URL updates immediately when selection changes (no delay)
14. ✅ **Shareable URLs**: Users can bookmark or share URLs with exact day selections
15. ✅ **Seamless Navigation**: Days selected on HomePage appear correctly on SearchPage
16. ✅ **No Console Errors**: No JavaScript errors during normal operation
17. ✅ **Visual Consistency**: DaySelector appearance and behavior remains unchanged

## Validation Commands

Execute these commands to validate the feature is complete:

### Build Validation
```bash
# Verify no build errors
cd app
npm run build

# Expected: Build completes successfully with no errors
# Expected: No TypeScript/JSX compilation errors
# Expected: dist/ folder contains updated assets
```

### Code Quality Validation
```bash
# Check for syntax errors in modified files
npm run dev

# Expected: Dev server starts successfully on port 5173
# Expected: No module resolution errors in console
# Expected: DaySelector component loads without errors
```

### Manual Testing Validation
```bash
# Start development server
npm run dev

# Then manually test:
# 1. Navigate to http://localhost:5173/search.html
#    → Should show Mon-Fri selected by default
#    → URL should be /search.html (no parameter or with default parameter)

# 2. Navigate to http://localhost:5173/search.html?days-selected=5,6,0
#    → Should show Fri, Sat, Sun selected
#    → Selection should be rendered correctly in DaySelector

# 3. Change selection in DaySelector (click different days)
#    → URL should update immediately to reflect new selection
#    → Browser address bar should show updated days-selected parameter

# 4. Click browser back button
#    → Should restore previous day selection
#    → DaySelector should update to show previous state

# 5. Navigate to http://localhost:5173/
#    → Select days in hero section day selector
#    → Click "Explore Rentals" button
#    → Should navigate to /search.html?days-selected=...
#    → SearchPage should show same days selected

# 6. Test invalid URL parameter http://localhost:5173/search.html?days-selected=abc
#    → Should fall back to Mon-Fri default
#    → No console errors should appear

# 7. Verify listing prices update when changing days
#    → Select different number of days
#    → Listing prices should recalculate immediately

# 8. Verify map markers update when changing days
#    → Change day selection
#    → Map price markers should update to reflect new pricing
```

### Console Validation
```javascript
// Open browser console and verify:
// No errors related to URL parameter parsing
// No errors related to DaySelector state management
// No warnings about missing props or invalid state
```

### Code Review Validation
```bash
# Verify modified files follow patterns
# Check that:
# - DaySelector.jsx imports urlParams.js functions
# - SearchPage.jsx no longer manages URL state
# - HomePage.jsx no longer uses toBubbleDays()
# - All components use 0-based indexing consistently
# - JSDoc comments are added for new functionality
```

## Notes

### Implementation Considerations

**1. URL Update Performance**
- Consider debouncing URL updates if user rapidly changes selection
- Current implementation updates on every change, which may cause history spam
- Potential optimization: Wait 300ms after last change before updating URL
- Trade-off: Immediate feedback vs. cleaner browser history

**2. Component Independence**
- DaySelector becomes more independent but also more opinionated
- Parents can no longer fully control selection state via props
- This is intentional: component should own its state for consistency
- If parent needs to override, can clear URL parameter and provide new default

**3. Backward Compatibility Strategy**
- Keep `selected` prop as optional override (ignored if URL parameter exists)
- This allows gradual migration if needed
- Priority order: URL parameter > selected prop > internal defaults
- Document this behavior clearly in component JSDoc

**4. Testing Without Unit Test Framework**
- Project uses manual testing via browser DevTools
- Critical to test all user flows manually before deployment
- Consider adding Playwright tests in future for regression prevention
- Document test scenarios clearly for future developers

**5. URL Parameter Format**
- Using comma-separated 0-based indices: `days-selected=1,2,3,4,5`
- Alternative considered: day abbreviations `days-selected=M,T,W,Th,F`
- Chose numeric for consistency with existing constants.js format
- Easier to parse and validate than string abbreviations

### Future Enhancements

**1. URL Debouncing**
- Add debounce to `updateUrlParams()` call in DaySelector
- Wait 300-500ms after last change before updating URL
- Reduces browser history pollution from rapid selections
- Implementation: Use `setTimeout` and `clearTimeout` in `useEffect`

**2. Preset Schedules**
- Add quick preset buttons: "Weeknights", "Weekends", "Full Week"
- Store presets in constants.js as `SCHEDULE_PATTERNS`
- One-click selection for common use cases
- Example: Click "Weeknights" → selects Mon-Fri automatically

**3. URL Shorthand**
- Support shorthand notation: `?schedule=weeknight` → [1,2,3,4,5]
- Add preset aliases in urlParams.js parsing logic
- Makes URLs more human-readable
- Backward compatible with numeric format

**4. Analytics Tracking**
- Track most popular day selections via analytics
- Identify if Mon-Fri default is optimal or should be adjusted
- Track HomePage → SearchPage conversion rate
- Measure impact of URL sharing on user acquisition

**5. Accessibility Improvements**
- Add ARIA labels for screen readers
- Keyboard navigation for day selection
- Focus management when selection changes
- Announce selection changes to assistive technologies

### Migration Path

**Phase 1: Current Implementation (This Feature)**
- DaySelector manages URL internally
- SearchPage delegates to DaySelector
- HomePage uses 0-based indexing

**Phase 2: Enhanced Testing (Future)**
- Add Playwright tests for URL synchronization
- Add unit tests for DaySelector state management
- Automate regression testing

**Phase 3: Performance Optimization (Future)**
- Add URL update debouncing
- Optimize re-render performance
- Measure and improve perceived performance

**Phase 4: User Experience Polish (Future)**
- Add preset schedule buttons
- Add URL shorthand notation
- Improve error messaging
- Add analytics tracking

### Dependencies

**No New Dependencies Required**:
- All functionality uses existing libraries
- `urlParams.js` already exists with needed utilities
- `constants.js` already defines defaults
- React hooks (`useState`, `useEffect`) built-in

**Existing Dependencies Used**:
- React 18.2.0 - for component state management
- Existing `urlParams.js` utilities - for URL parsing/serialization
- Existing `constants.js` - for default values
- Existing `sanitize.js` - for input validation

### Risk Assessment

**Low Risk Areas**:
- Reading URL parameters (well-tested utility functions)
- Default value definition (simple constant)
- Component rendering (no visual changes)

**Medium Risk Areas**:
- URL writing logic (need to avoid race conditions)
- SearchPage refactoring (need to maintain listing query logic)
- HomePage integration (need to ensure consistent indexing)

**High Risk Areas**:
- Browser history management (back/forward button behavior)
- State synchronization between URL and component (potential for conflicts)
- Backward compatibility with existing saved bookmarks/links

**Mitigation Strategies**:
- Extensive manual testing of all user flows
- Gradual rollout with monitoring
- Keep `selected` prop as escape hatch for emergencies
- Document rollback procedure

### Related Issues/Features

**Depends On**:
- None - This is a standalone feature

**Blocks**:
- Future features requiring schedule persistence
- Analytics tracking of day selection patterns
- User preference saving (future enhancement)

**Related To**:
- Issue #1: Search page port (already completed)
- Issue #2: Favorite persistence (may need URL sync for favorites)
- Listing price calculation (depends on day selection)
- Map marker pricing (depends on day selection)

### Deployment Notes

**Pre-Deployment Checklist**:
- [ ] Build succeeds with no errors
- [ ] Dev server runs without console errors
- [ ] All manual test cases pass
- [ ] Browser back/forward buttons work correctly
- [ ] HomePage → SearchPage navigation works
- [ ] Invalid URL parameters handled gracefully
- [ ] No regressions in existing features

**Deployment Steps**:
1. Merge feature branch to main
2. Build production assets: `npm run build`
3. Deploy to Cloudflare Pages staging environment
4. Run full manual test suite on staging
5. Monitor for errors in browser console
6. Deploy to production
7. Monitor analytics for usage patterns

**Rollback Plan**:
If critical issues are discovered:
1. Revert commit with this feature
2. Rebuild and redeploy previous version
3. Investigate issues in development
4. Apply fix and re-test before redeployment

**Post-Deployment Monitoring**:
- Check browser console for errors (first 24 hours)
- Monitor user feedback for day selection issues
- Track usage of default Mon-Fri selection
- Verify URL sharing works correctly for users
