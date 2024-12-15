import React from 'react';
import { Clock, ChevronDown } from 'lucide-react';

// [MYA025] PollingDropdown component which handles selecting an interval for polling.
const PollingDropdown = ({ onIntervalChange, isToday }) => {

  // Handle change in interval selection from the dropdown.
  const handleChange = (event) => {
    // If the value is an empty string, set interval as null, otherwise parse it as an integer.
    const interval = event.target.value === '' ? null : parseInt(event.target.value);
    // Trigger the onIntervalChange callback with the selected interval.
    onIntervalChange(interval);
  };

  return (
    // Dropdown container with flex layout, border, and relative positioning.
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden relative">
      
      {/* Clock icon with conditional styling based on isToday prop */}
      <Clock 
        className={`h-5 w-5 ml-2 ${!isToday ? 'text-gray-400' : 'text-gray-600'}`} 
      />
      
      {/* Dropdown select input for interval options */}
      <select 
        className={`w-full p-2 pr-8 bg-white appearance-none focus:outline-none ${
          !isToday ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        // On change, call the handleChange function to update the selected interval.
        onChange={handleChange}
        // Disable the dropdown if isToday is false.
        disabled={!isToday}
      >
        {/* Default option (None) */}
        <option value="">None</option>
        {/* Various interval options in seconds */}
        <option value="10">10 sec</option>
        <option value="30">30 sec</option>
        <option value="60">1 min</option>
        <option value="120">2 min</option>
        <option value="3000">5 min</option>
        <option value="6000">10 min</option>
      </select>

      {/* ChevronDown icon to indicate dropdown direction, with conditional styling */}
      <ChevronDown 
        className={`absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
          !isToday ? 'text-gray-400' : 'text-gray-600'
        }`} 
      />
    </div>
  );
};

export default PollingDropdown;
