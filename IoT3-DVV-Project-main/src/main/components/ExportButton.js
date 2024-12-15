import React, { useState } from 'react'; // React for component and state management
import { Download } from 'lucide-react'; // Download icon from lucide-react
import useExportMeterData from '../hooks/useExportMeterData'; // Custom hook for exporting data

// ExportButton component to handle data export functionality
const ExportButton = ({ selectedMeter }) => {
  const [showOptions, setShowOptions] = useState(false); // State to toggle the visibility of export options
  const { exportData, exportLoading, exportError } = useExportMeterData(selectedMeter); // Using custom hook to manage export data, loading state, and errors

  // Function to handle export action based on file format
  const handleExport = async (fileFormat) => {
    await exportData(fileFormat); // Call the export function from the custom hook with the selected format
    setShowOptions(false); // Close the export options after the selection
  };

  return (
    <div className="relative inline-block text-left"> {/* Container for the button and options */}
      {/* Button to trigger export options */}
      <button
        onClick={() => setShowOptions(!showOptions)} // Toggle the visibility of export options when clicked
        disabled={exportLoading} // Disable button when export is in progress
        className={`flex items-center justify-center space-x-2 px-5 h-12 ${
          exportLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
        } text-white font-semibold rounded-lg transition duration-300 shadow-md min-w-[120px]`}
      >
        <Download size={20} /> {/* Download icon */}
        <span>Export</span> {/* Button text */}
      </button>

      {/* Export options (CSV and JSON) appear only when 'showOptions' is true and export is not loading */}
      {showOptions && !exportLoading && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {/* Button for exporting as CSV */}
          <button
            onClick={() => handleExport('csv')} // Trigger export as CSV on click
            className="w-full px-4 py-2 text-gray-700 text-sm font-medium hover:bg-green-100 rounded-t-lg transition duration-200 ease-in-out"
          >
            Export as CSV
          </button>
          {/* Button for exporting as JSON */}
          <button
            onClick={() => handleExport('json')} // Trigger export as JSON on click
            className="w-full px-4 py-2 text-gray-700 text-sm font-medium hover:bg-green-100 rounded-b-lg transition duration-200 ease-in-out"
          >
            Export as JSON
          </button>
        </div>
      )}

      {/* Error message display if export fails */}
      {exportError && (
        <div className="absolute right-0 mt-2 w-64 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
          {exportError.message} {/* Show error message */}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
