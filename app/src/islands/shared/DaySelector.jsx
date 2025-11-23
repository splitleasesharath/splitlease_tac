import { useState, useEffect, useCallback, useRef } from 'react';
import { DAY_ABBREVIATIONS, DAY_NAMES, DEFAULTS } from '../../lib/constants.js';

/**
 * DaySelector - Interactive day of week selector component with gradient design
 *
 * PORTED FROM ORIGINAL: input/search/components/ScheduleSelector/SearchScheduleSelector.tsx
 * Now includes ALL advanced features from the original implementation:
 * - Drag selection with mouse tracking
 * - Contiguous day validation with wrap-around support
 * - Minimum nights requirement (configurable via minDays prop)
 * - Error popup with animations and auto-hide
 * - Delayed validation (3 seconds after inactivity)
 * - Prevention of day removal if below minimum nights
 * - Advanced check-in/check-out calculation with wrap-around
 * - Visual error styling on day cells
 * - onError callback for parent notification
 * - URL parameter synchronization (when enableUrlSync is true)
 *
 * Features:
 * - Purple gradient card wrapper (135deg, #667eea to #764ba2)
 * - Interactive day badges (S M T W T F S)
 * - Check-in/Check-out display
 * - Clear selection button
 * - Visual indication of selected/unselected state
 * - URL parameter sync for shareable search links
 *
 * Day numbering (matching constants.js):
 * - Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
 *
 * URL Parameter Format (when enableUrlSync is true):
 * - Parameter name: "days-selected"
 * - Format: "1,2,3,4,5" (comma-separated, 0-based indexing)
 * - Example: /search.html?days-selected=1,2,3,4,5 (Monday-Friday)
 *
 * @param {Object} props
 * @param {number[]} [props.selected] - Array of selected day numbers (0-6, where 0=Sunday). If provided, component is parent-controlled.
 * @param {Function} props.onChange - Callback function: (selectedDays: number[]) => void
 * @param {Function} [props.onError] - Callback when validation error occurs: (errorMessage: string) => void
 * @param {string} [props.label] - Optional label text to display above selector
 * @param {string} [props.className] - Optional additional CSS classes
 * @param {number} [props.minDays=3] - Minimum number of nights required (nights = days - 1)
 * @param {boolean} [props.requireContiguous=true] - Whether days must be contiguous
 * @param {boolean} [props.enableUrlSync=false] - Enable URL parameter synchronization (reads from and writes to URL)
 * @param {number[]} [props.defaultSelected=[1,2,3,4,5]] - Default selection when no URL param and no parent control (Monday-Friday)
 * @returns {JSX.Element}
 */
export default function DaySelector(props) {
  const {
    selected,
    onChange,
    onError,
    label,
    className = '',
    minDays = 3,
    requireContiguous = true,
    enableUrlSync = false,
    defaultSelected = DEFAULTS.DEFAULT_SELECTED_DAYS
  } = props;

  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownIndex, setMouseDownIndex] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasContiguityError, setHasContiguityError] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Internal state for URL-controlled mode
  const [internalSelected, setInternalSelected] = useState(() => {
    // Initialize from URL if enableUrlSync is true
    if (enableUrlSync && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const daysParam = params.get('days-selected');
      if (daysParam) {
        try {
          const days = daysParam
            .split(',')
            .map(d => parseInt(d.trim(), 10))
            .filter(d => !isNaN(d) && d >= 0 && d <= 6);
          if (days.length > 0) {
            return days;
          }
        } catch (error) {
          console.error('Failed to parse days-selected URL parameter:', error);
        }
      }
    }
    // Fall back to default selection
    return defaultSelected;
  });

  // Determine if component is parent-controlled or self-controlled
  const isParentControlled = selected !== undefined;
  const currentSelected = isParentControlled ? selected : internalSelected;

  // Timeout refs for cleanup
  const validationTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  /**
   * Check if selected days are contiguous (handles wrap-around)
   * Uses the exact logic from the original SearchScheduleSelector
   * Example: [5, 6, 0, 1, 2] (Fri, Sat, Sun, Mon, Tue) is contiguous
   */
  const isContiguous = useCallback((daysArray) => {
    // Edge cases
    if (daysArray.length <= 1) return true;
    if (daysArray.length >= 6) return true;

    const sortedDays = [...daysArray].sort((a, b) => a - b);

    // STEP 1: Check if selected days are continuous (regular check)
    let isRegularContinuous = true;
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] !== sortedDays[i - 1] + 1) {
        isRegularContinuous = false;
        break;
      }
    }

    if (isRegularContinuous) return true;

    // STEP 2: Check if UNSELECTED days are continuous (implies wrap-around)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    const unselectedDays = allDays.filter(day => !sortedDays.includes(day));

    if (unselectedDays.length === 0) return true; // All days selected

    // Check if unselected days are continuous
    const sortedUnselected = [...unselectedDays].sort((a, b) => a - b);
    for (let i = 1; i < sortedUnselected.length; i++) {
      if (sortedUnselected[i] !== sortedUnselected[i - 1] + 1) {
        return false; // Unselected days not continuous, selection is not valid
      }
    }

    // Unselected days are continuous, selection wraps around!
    return true;
  }, []);

  /**
   * Validate the current selection
   * NOTE: Nights = Days - 1 (last day is checkout, doesn't count as a night)
   */
  const validateSelection = useCallback((daysArray) => {
    const dayCount = daysArray.length;
    const nightCount = dayCount - 1; // Checkout day doesn't count as a night

    if (dayCount === 0) {
      return { valid: true };
    }

    // Need at least minDays + 1 days to have minDays nights
    // Example: 2 nights requires 3 days (check-in + 2 nights + checkout)
    if (nightCount < minDays) {
      return {
        valid: false,
        error: `Please select at least ${minDays} night${minDays > 1 ? 's' : ''} per week`
      };
    }

    if (requireContiguous && !isContiguous(daysArray)) {
      return {
        valid: false,
        error: 'Please select contiguous days (e.g., Mon-Tue-Wed, not Mon-Wed-Fri)'
      };
    }

    return { valid: true };
  }, [minDays, requireContiguous, isContiguous]);

  /**
   * Display error message
   */
  const displayError = useCallback((error) => {
    // Clear any existing error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setErrorMessage(error);
    setShowError(true);

    // Hide error after 6 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setShowError(false);
    }, 6000);

    if (onError) {
      onError(error);
    }
  }, [onError]);

  /**
   * Handle mouse down - Start tracking for click vs drag
   */
  const handleMouseDown = useCallback((dayIndex) => {
    setMouseDownIndex(dayIndex);
  }, []);

  /**
   * Handle mouse enter - If dragging, fill range
   */
  const handleMouseEnter = useCallback((dayIndex) => {
    // Only drag if mouse is down and we moved to a different cell
    if (mouseDownIndex !== null && dayIndex !== mouseDownIndex) {
      setIsDragging(true);

      const newSelection = [];
      const totalDays = 7;
      const start = mouseDownIndex;

      // Calculate range with wrap-around
      let dayCount;
      if (dayIndex >= start) {
        dayCount = dayIndex - start + 1;
      } else {
        dayCount = (totalDays - start) + dayIndex + 1;
      }

      // Fill all days in range
      for (let i = 0; i < dayCount; i++) {
        const currentDay = (start + i) % totalDays;
        newSelection.push(currentDay);
      }

      const sortedSelection = newSelection.sort((a, b) => a - b);

      // Update internal state if self-controlled
      if (!isParentControlled) {
        setInternalSelected(sortedSelection);
      }

      // Always call onChange callback
      if (onChange) {
        onChange(sortedSelection);
      }
    }
  }, [mouseDownIndex, isParentControlled, onChange]);

  /**
   * Handle mouse up - Determine if click or drag, then act accordingly
   */
  const handleMouseUp = useCallback((dayIndex) => {
    if (mouseDownIndex === null) return;

    // Check if this was a click (same cell) or drag (different cell)
    if (!isDragging && dayIndex === mouseDownIndex) {
      // CLICK - Toggle the day
      const isSelected = currentSelected.includes(dayIndex);
      let newSelection;

      if (isSelected) {
        // Check if removing this day would go below minimum nights
        const daysAfterRemoval = currentSelected.length - 1;
        const nightsAfterRemoval = daysAfterRemoval - 1;
        if (nightsAfterRemoval < minDays) {
          displayError(`Cannot remove day - you must select at least ${minDays} night${minDays > 1 ? 's' : ''} per week`);
          // Reset drag state but don't change selection
          setIsDragging(false);
          setMouseDownIndex(null);
          return;
        }
        newSelection = currentSelected.filter(day => day !== dayIndex);
      } else {
        newSelection = [...currentSelected, dayIndex].sort((a, b) => a - b);
      }

      // Update internal state if self-controlled
      if (!isParentControlled) {
        setInternalSelected(newSelection);
      }

      // Always call onChange callback
      if (onChange) {
        onChange(newSelection);
      }

      // Clear existing validation timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Schedule validation after 3 seconds of inactivity
      validationTimeoutRef.current = setTimeout(() => {
        const validation = validateSelection(newSelection);
        if (!validation.valid && validation.error) {
          displayError(validation.error);
        }
      }, 3000);
    } else if (isDragging) {
      // DRAG - Validate immediately
      const validation = validateSelection(currentSelected);
      if (!validation.valid && validation.error) {
        displayError(validation.error);
        // Update internal state if self-controlled
        if (!isParentControlled) {
          setInternalSelected([]);
        }
        if (onChange) {
          onChange([]);
        }
      }
    }

    // Reset drag state
    setIsDragging(false);
    setMouseDownIndex(null);
  }, [isDragging, mouseDownIndex, currentSelected, isParentControlled, validateSelection, displayError, onChange, minDays]);

  /**
   * Handle clear/reset - clear all selections
   */
  const handleClearSelection = useCallback(() => {
    // Update internal state if self-controlled
    if (!isParentControlled) {
      setInternalSelected([]);
    }

    // Always call onChange callback
    if (onChange) {
      onChange([]);
    }

    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setShowError(false);
  }, [isParentControlled, onChange]);

  /**
   * Calculate check-in and check-out days based on selection
   * Uses the exact logic from the original SearchScheduleSelector
   */
  const calculateCheckinCheckout = useCallback((daysArray) => {
    if (daysArray.length === 0) {
      setCheckIn('');
      setCheckOut('');
      return;
    }

    if (!isContiguous(daysArray)) {
      setCheckIn('');
      setCheckOut('');
      return;
    }

    // Single day selection
    if (daysArray.length === 1) {
      setCheckIn(DAY_NAMES[daysArray[0]]);
      setCheckOut(DAY_NAMES[daysArray[0]]);
      return;
    }

    // Multiple day selection
    const sortedDays = [...daysArray].sort((a, b) => a - b);
    const hasSunday = sortedDays.includes(0);
    const hasSaturday = sortedDays.includes(6);

    // Check if this is a wrap-around case
    if (hasSunday && hasSaturday && sortedDays.length < 7) {
      // Find the gap (unselected days) in the week
      let gapStart = -1;
      let gapEnd = -1;

      // Look for the gap in the sorted days
      for (let i = 0; i < sortedDays.length - 1; i++) {
        if (sortedDays[i + 1] - sortedDays[i] > 1) {
          gapStart = sortedDays[i] + 1;
          gapEnd = sortedDays[i + 1] - 1;
          break;
        }
      }

      if (gapStart !== -1 && gapEnd !== -1) {
        // Wrap-around case with a gap in the middle
        let checkinDayIndex;
        if (sortedDays.some(day => day > gapEnd)) {
          checkinDayIndex = sortedDays.find(day => day > gapEnd);
        } else {
          checkinDayIndex = 0;
        }

        let checkoutDayIndex;
        if (sortedDays.some(day => day < gapStart)) {
          checkoutDayIndex = sortedDays.filter(day => day < gapStart).pop();
        } else {
          checkoutDayIndex = 6;
        }

        setCheckIn(DAY_NAMES[checkinDayIndex]);
        setCheckOut(DAY_NAMES[checkoutDayIndex]);
      } else {
        setCheckIn(DAY_NAMES[sortedDays[0]]);
        setCheckOut(DAY_NAMES[sortedDays[sortedDays.length - 1]]);
      }
    } else {
      // Non-wrap-around case: use first and last in sorted order
      setCheckIn(DAY_NAMES[sortedDays[0]]);
      setCheckOut(DAY_NAMES[sortedDays[sortedDays.length - 1]]);
    }
  }, [isContiguous]);

  /**
   * Update check-in/check-out and check for contiguity errors
   */
  useEffect(() => {
    calculateCheckinCheckout(currentSelected);

    // Check for contiguity error (visual feedback + immediate alert)
    if (currentSelected.length > 1 && requireContiguous) {
      const isValid = isContiguous(currentSelected);
      const wasContiguousError = hasContiguityError;
      setHasContiguityError(!isValid);

      // Show contiguity error immediately only if it's a NEW error
      if (!isValid && !wasContiguousError && !showError) {
        displayError('Please select contiguous days (e.g., Mon-Tue-Wed, not Mon-Wed-Fri)');
      }
    } else {
      setHasContiguityError(false);
      // Hide error if selection becomes valid
      if (showError) {
        setShowError(false);
      }
    }
  }, [currentSelected, requireContiguous, isContiguous, hasContiguityError, showError, displayError, calculateCheckinCheckout]);

  // Sync internal state to URL when enableUrlSync is true
  useEffect(() => {
    if (!enableUrlSync || isParentControlled || typeof window === 'undefined') {
      return;
    }

    // Skip URL update on initial mount (URL already parsed)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Update URL parameter with current selection
    const params = new URLSearchParams(window.location.search);

    if (internalSelected.length > 0) {
      params.set('days-selected', internalSelected.join(','));
    } else {
      params.delete('days-selected');
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    // Use replaceState to avoid polluting browser history
    window.history.replaceState(null, '', newUrl);
  }, [internalSelected, enableUrlSync, isParentControlled]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`day-selector-wrapper ${className}`}>
      {label && <label className="day-selector-label">{label}</label>}

      {/* Purple Gradient Card - Ported from original with all advanced features */}
      <div className="schedule-selector-card">
        <div className="schedule-selector-row">
          {/* Calendar Icon */}
          <div className="calendar-icon">
            📅
          </div>

          {/* Days Grid */}
          <div className="days-grid">
            {DAY_ABBREVIATIONS.map((dayAbbr, index) => {
              const isActive = currentSelected.includes(index);

              return (
                <button
                  key={index}
                  className={`day-cell ${isActive ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${hasContiguityError && isActive ? 'error' : ''}`}
                  data-day={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(index);
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseUp={() => handleMouseUp(index)}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={DAY_NAMES[index]}
                >
                  {dayAbbr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Check-in/Check-out Display - Advanced with wrap-around support */}
        {currentSelected.length > 0 && checkIn && checkOut && (
          <div className="info-container">
            <div className="info-text">
              Check-in: <strong>{checkIn}</strong> • Check-out: <strong>{checkOut}</strong>
            </div>
            <button
              className="reset-button"
              onClick={handleClearSelection}
              type="button"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Error Popup - Animated with auto-hide */}
        {showError && (
          <div className="error-popup">
            <span className="error-icon">⚠️</span>
            <p className="error-message">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
