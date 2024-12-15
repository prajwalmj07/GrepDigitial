import React, { useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { dateRangeState, shouldFetchDataState } from '../lib/atoms';
import { CalendarIcon } from '@heroicons/react/24/solid';

//`[MYA006]`
const DateRangeDropdown = ({ setIsToday }) => {
  // [MYA019] Recoil state for managing the date range and triggering data fetch
  const [dateRange, setDateRange] = useRecoilState(dateRangeState);
  const setShouldFetchData = useSetRecoilState(shouldFetchDataState);

  // Initialize date boundaries (1 year ago to today)
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const minTimestamp = oneYearAgo.getTime(); // Minimum slider value
  const maxTimestamp = today.getTime(); // Maximum slider value

  // Local state for start date, end date, and custom date mode
  const [startDate, setStartDate] = useState(
    dateRange.type === 'Custom Dates' ? dateRange.startDate : null
  );
  const [endDate, setEndDate] = useState(
    dateRange.type === 'Custom Dates' ? dateRange.endDate : null
  );
  const [isCustomDateSelected, setIsCustomDateSelected] = useState(
    dateRange.type === 'Custom Dates'
  );

  // Maintain visibility of custom date controls when the range type changes
  useEffect(() => {
    if (dateRange.type === 'Custom Dates') {
      setIsCustomDateSelected(true);
    }
    setIsToday(dateRange.type === 'Today'); // Add this line
  }, [dateRange.type]);

  // Utility function to format date into `YYYY-MM-DD`
  const formatDate = (date) => date.toISOString().split('T')[0];
  const todayStr = formatDate(today); // Today's date formatted

  // Handle dropdown changes (e.g., Last Hour, Today, etc.)
  const handleChange = (e) => {
    const range = e.target.value;
    const now = new Date();
    let start = null; // Default start date
    let end = formatDate(now); // Default end date

    // Handle Custom Dates selection
    if (range === 'Custom Dates') {
      setIsCustomDateSelected(true);
      setStartDate(null); // Reset start date
      setEndDate(null); // Reset end date
      setDateRange({ type: range, startDate: null, endDate: null });
      setIsToday(false);
      return;
    } else {
      setIsCustomDateSelected(false); // Hide custom controls
    }

    // Calculate start and end dates based on range type
    switch (range) {
      case 'Yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = formatDate(yesterday);
        end = formatDate(yesterday);
        setIsToday(false);
        break;
      case 'Last Week':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7); // Start of last week
        start = formatDate(lastWeekStart);
        end = formatDate(new Date(lastWeekStart.getTime() + 6 * 86400000)); // End of last week
        setIsToday(false);
        break;
      case 'This Week':
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay()); // Start of this week
        start = formatDate(thisWeekStart);
        end = formatDate(now);
        setIsToday(end === todayStr);
        break;
      case 'Last Month':
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1); // Previous month
        start = formatDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1));
        end = formatDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0));
        setIsToday(false);
        break;
      case 'This Month':
        start = formatDate(new Date(now.getFullYear(), now.getMonth(), 1)); // Start of this month
        end = formatDate(now);
        setIsToday(end === todayStr);
        break;
        case 'Today':
          start = formatDate(now);
          end = formatDate(now);
          setIsToday(true);
          break;
        default:
          setIsToday(false);
          break;
    }

    // Update date range state and trigger data fetch
    setDateRange({ type: range, startDate: start, endDate: end });
    setShouldFetchData(true);
  };

  // Handle slider changes (adjust date with range input)
  const handleSliderChange = (event) => {
    const selectedDate = new Date(parseInt(event.target.value));
    const formattedDate = formatDate(selectedDate);

    // Update start or end date based on slider name
    if (event.target.name === 'startDate') {
      if (new Date(formattedDate) <= new Date(endDate || todayStr) && new Date(formattedDate) <= today) {
        setStartDate(formattedDate);
      }
    } else {
      if (new Date(formattedDate) >= new Date(startDate || formatDate(oneYearAgo)) && new Date(formattedDate) <= today) {
        setEndDate(formattedDate);
      }
    }
  };

  // Submit button logic for custom dates
  const handleSubmit = () => {
    if (startDate && endDate) {
      setDateRange({ type: 'Custom Dates', startDate, endDate });
      setShouldFetchData(true);
      setIsToday(endDate === todayStr);
    }
  };

  // Handle manual date changes via calendar inputs
  const handleCalendarChange = (event) => {
    const { name, value } = event.target;
    const selectedDate = new Date(value);
    const formattedDate = formatDate(selectedDate);

    if (name === 'startDate') {
      if ((!endDate || new Date(formattedDate) <= new Date(endDate)) && new Date(formattedDate) <= today) {
        setStartDate(formattedDate);
      }
    } else {
      if ((!startDate || new Date(formattedDate) >= new Date(startDate)) && new Date(formattedDate) <= today) {
        setEndDate(formattedDate);
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Dropdown for selecting date range */}
      <select
        className="border border-gray-300 rounded-md p-2 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={dateRange.type}
        onChange={handleChange}
      >
        <option value="">Select Date Range</option>
        <option value="Today">Today</option>
        <option value="Yesterday">Yesterday</option>
        <option value="Last Week">Last Week</option>
        <option value="This Week">This Week</option>
        <option value="Last Month">Last Month</option>
        <option value="This Month">This Month</option>
        <option value="Custom Dates">Custom Dates</option>
      </select>

      {/* Custom Date Range Controls */}
      {isCustomDateSelected && (
        <div className="flex items-center space-x-4">
          {/* Start Date */}
          <div className="flex flex-col items-start space-y-2">
            <label className="text-sm">Start Date: {startDate || 'Select a date'}</label>
            <div className="flex items-center">
              {/* Range Input for Start Date */}
              <input
                type="range"
                name="startDate"
                min={minTimestamp}
                max={maxTimestamp}
                step={86400000} // Step in milliseconds (1 day)
                value={startDate ? new Date(startDate).getTime() : minTimestamp}
                onChange={handleSliderChange}
                className="slider appearance-none w-full h-2 rounded-lg bg-gray-300 outline-none transition duration-150 ease-in-out mr-2"
              />
              {/* Calendar Icon Input */}
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={startDate || ''}
                  onChange={handleCalendarChange}
                  max={todayStr}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* End Date */}
          <div className="flex flex-col items-start space-y-2">
            <label className="text-sm">End Date: {endDate || 'Select a date'}</label>
            <div className="flex items-center">
              <input
                type="range"
                name="endDate"
                min={minTimestamp}
                max={maxTimestamp}
                step={86400000}
                value={endDate ? new Date(endDate).getTime() : maxTimestamp}
                onChange={handleSliderChange}
                className="slider appearance-none w-full h-2 rounded-lg bg-gray-300 outline-none transition duration-150 ease-in-out mr-2"
              />
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={endDate || ''}
                  onChange={handleCalendarChange}
                  max={todayStr}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            className={`px-4 py-2 rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 ${
              !startDate || !endDate ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!startDate || !endDate}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;
