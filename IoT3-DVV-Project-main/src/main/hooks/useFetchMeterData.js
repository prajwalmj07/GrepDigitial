// Import necessary hooks and state management utilities
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

// Import Recoil atoms for managing global state
import { shouldFetchDataState, dateRangeState, meterDataState } from '../lib/atoms';

// Import utility function to map API data to the graph structure
import { mapDataToGraphStructure } from '../utils/meterDataMapper';

/**
 * Custom hook: useFetchMeterData
 * Fetches meter data based on selected meter and date range.
 * Includes polling logic for real-time updates when pollingInterval is provided.
 */
// [MYA010] Custom hook to fetch meter data based on selected meter and date range
const useFetchMeterData = (selectedMeter, pollingInterval) => {
  // State for tracking loading and error status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recoil state values and setters
  const shouldFetchData = useRecoilValue(shouldFetchDataState); // Should data be fetched?
  const dateRange = useRecoilValue(dateRangeState); // Date range for fetching data
  const setMeterData = useSetRecoilState(meterDataState); // Setter for meter data
  const data = useRecoilValue(meterDataState); // Current meter data

  // Refs to manage state and avoid unnecessary re-renders
  const pollingIntervalRef = useRef(pollingInterval); // Ref for polling interval
  const fetchInProgressRef = useRef(false); // Prevent overlapping fetches

  // Utility function: Get today's date in ISO format (YYYY-MM-DD)
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Function to fetch data from the API
  const fetchData = useCallback(async () => {
    // Exit if required conditions are not met
    if (!dateRange.endDate || !selectedMeter || fetchInProgressRef.current) return;

    fetchInProgressRef.current = true; // Mark fetch as in progress
    setLoading(true); // Set loading state

    try {
       // [MYA024] Constructing the API URL with the device serial number, date range, and max pages
      const url = `http://localhost:8000/fetch-and-transform?device_serial_number=${selectedMeter}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&max_pages=1000`;

      // Make API call
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response data
      const result = await response.json();
      if (!result.mapped_data || !Array.isArray(result.mapped_data)) {
        throw new Error('Invalid data format received from API');
      }

      // Map raw data to graph structure
      const structuredData = mapDataToGraphStructure(result);

      // Validate mapped data structure
      if (!structuredData.mappedData || !structuredData.mappedData.timestamps) {
        throw new Error('Data transformation failed');
      }

      // Update global meter data state
      setMeterData(structuredData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err); // Set error state
    } finally {
      fetchInProgressRef.current = false; // Reset fetch progress
      setLoading(false); // Reset loading state
    }
  }, [selectedMeter, dateRange, setMeterData]);

  // Effect: Fetch data initially or when dependencies change
  useEffect(() => {
    if (shouldFetchData) {
      fetchData();
    }
  }, [selectedMeter, dateRange, shouldFetchData, fetchData]);

  // Effect: Polling logic for periodic updates
  useEffect(() => {
    let timeoutId; // ID for clearing timeout

    // Update ref when pollingInterval changes
    pollingIntervalRef.current = pollingInterval;

    // Polling function
    const pollData = async () => {
      // Exit polling if date range is not today or no interval is set
      if (dateRange.endDate !== getToday() || !pollingIntervalRef.current) {
        return;
      }

      try {
        // Fetch data
        await fetchData();
      } catch (err) {
        console.error('Error during polling:', err);
      } finally {
        // Schedule next poll if conditions are met
        if (pollingIntervalRef.current && dateRange.endDate === getToday()) {
          timeoutId = setTimeout(pollData, pollingIntervalRef.current * 1000);
        }
      }
    };

    // Start polling if conditions are met
    if (pollingInterval !== null && dateRange.endDate === getToday()) {
      pollData();
    }

    // Cleanup: Clear timeout on component unmount or dependency change
    return () => clearTimeout(timeoutId);
  }, [pollingInterval, dateRange, selectedMeter, fetchData]);

  // Return data, loading state, and error state
  return { data, loading, error };
};

export default useFetchMeterData;
