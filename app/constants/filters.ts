// Constants for filter options

// Number of sessions options: 1-20, then 30, 40, ... 100
export const NUMBER_OF_PROGRESSES_OPTIONS: number[] = [
  ...Array.from({ length: 20 }, (_, i) => i + 1),
  30, 40, 50, 60, 70, 80, 90, 100,
];

// Sessions per week options: 1-7
export const SESSIONS_PER_WEEK_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 7];

// Default page sizes
export const PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

// Locale code
export const DEFAULT_LOCALE_CODE = 'ENG';

// Debounce delay for search input (ms)
export const SEARCH_DEBOUNCE_MS = 500;
