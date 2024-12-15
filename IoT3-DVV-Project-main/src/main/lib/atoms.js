import { atom } from 'recoil';

// `[MYA011]`Atom for storing the selected energy meter's ID
export const selectedMeterState = atom({
  key: 'selectedMeterState', // Unique key for the atom
  default: 'WR2001000008', // Default selected meter ID
});

// [MYA012]Atom for storing graph configuration (visibility and chart type for various metrics)
export const graphConfigState = atom({
  key: 'graphConfigState', // Unique key for the atom
  default: {
    voltage: { show: true, chartType: 'line' }, // Voltage metric configuration
    current: { show: true, chartType: 'line' }, // Current metric configuration
    power: { show: true, chartType: 'bar' }, // Power metric configuration
    apparent_vs_reactive_power: { show: true, chartType: 'line' }, // Apparent vs Reactive Power chart
    total_power: { show: true, chartType: 'line' }, // Total Power chart
    frequency: { show: true, chartType: 'line' }, // Frequency chart
  },
});

// [MYA022] Atom for controlling the full-screen mode of a chart
export const fullScreenCardState = atom({
  key: 'fullScreenCardState', // Unique key for the atom
  default: null, // Default is null (no card is in full-screen mode)
});

// Atom for storing how many data points should be shown per page in the charts
export const dataPerPageState = atom({
  key: 'dataPerPageState', // Unique key for the atom
  default: 15, // Default data per page is set to 15
});

// [MYA005]Atom to determine whether data should be fetched or not
export const shouldFetchDataState = atom({
  key: 'shouldFetchDataState', // Unique key for the atom
  default: false, // Default value is false (do not fetch data by default)
});

// Atom for controlling the maximum number of pages to fetch
export const maxPagesState = atom({
  key: 'maxPagesState', // Unique key for the atom
  default: 5, // Default value is 5 pages
});

// [MYA004] Atom for storing the date range for fetching data
export const dateRangeState = atom({
  key: 'dateRangeState', // Unique key for the atom
  default: {
    type: 'Today', // Default range type is 'Today'
    startDate: new Date().toISOString().split('T')[0], // Start date is today's date in ISO format
    endDate: new Date().toISOString().split('T')[0], // End date is today's date in ISO format
  },
});

// [MYA020] Atom for storing the meter data fetched from the API
export const meterDataState = atom({
  key: 'meterDataState', // Unique key for the atom
  default: null, // Default is null (no data available initially)
});
