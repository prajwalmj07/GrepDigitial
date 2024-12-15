// Importing necessary hooks from React and Recoil
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { dateRangeState } from '../lib/atoms'; // Importing the dateRange state from Recoil atoms

// [MYA023]Custom hook to handle the export of meter data
const useExportMeterData = (selectedMeter) => {
  // Local state to track loading status during export
  const [exportLoading, setExportLoading] = useState(false);
  
  // Local state to track any errors during the export process
  const [exportError, setExportError] = useState(null);
  
  // Fetching the current date range state from Recoil
  const dateRange = useRecoilValue(dateRangeState);

  // Function to export data in the selected file format (e.g., CSV, PDF)
  const exportData = async (fileFormat) => {
    // Check if the required parameters are available (endDate and selectedMeter)
    if (!dateRange.endDate || !selectedMeter) {
      setExportError(new Error('Missing required parameters')); // Set an error if parameters are missing
      return;
    }

    // Start loading indicator and reset previous errors
    setExportLoading(true);
    setExportError(null);

    try {
      // [MYA025] Constructing the URL to call the export API with necessary parameters
      const url = `http://127.0.0.1:8000/export?device_serial_number=${selectedMeter}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&max_pages=1000&file_format=${fileFormat}`;
      
      // Sending the fetch request to the server
      const response = await fetch(url);
      
      // If the response is not OK, throw an error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to extract the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export_${selectedMeter}_start=${dateRange.startDate}_end=${dateRange.endDate}.${fileFormat}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1]; // Use the filename from the header if it exists
        }
      }

      // Converting the response to a Blob object to handle binary data (e.g., CSV, PDF)
      const blob = await response.blob();
      
      // Create a URL for the Blob object
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create an anchor element to trigger the file download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename; // Set the download attribute to the filename
      document.body.appendChild(link); // Append the link to the DOM
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up the DOM by removing the link
      window.URL.revokeObjectURL(downloadUrl); // Release the object URL to free memory

    } catch (err) {
      // Log any error that occurs during the export process and set the error state
      console.error('Error exporting data:', err);
      setExportError(err);
    } finally {
      // End the loading state, regardless of whether the request succeeded or failed
      setExportLoading(false);
    }
  };

  // Returning the export function, loading state, and any export errors
  return {
    exportData,
    exportLoading,
    exportError
  };
};

export default useExportMeterData;
