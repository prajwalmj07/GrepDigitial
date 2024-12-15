import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { meterDataState } from '../lib/atoms';
import Loader from './Loader';
import { X, FileJson } from 'lucide-react';
import { createPortal } from 'react-dom';

// [MYA017] Modal component to display raw device data
const Modal = ({ onClose, children }) => {
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      style={{ 
        zIndex: 9999, // Ensure modal is above other content
      }}
    >
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body // Render the modal into the body of the document
  );
};

//[MYA009] Main component to display device information
const DeviceInfo = ({ loading }) => {
  const [showRawData, setShowRawData] = useState(false); // State for toggling the raw data modal
  const deviceData = useRecoilValue(meterDataState); // Fetch device data from Recoil state

  // Effect to handle body overflow when raw data modal is open
  useEffect(() => {
    if (showRawData) {
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
      document.body.style.overflow = 'unset'; // Restore body scroll
    }
    return () => {
      document.body.style.overflow = 'unset'; // Clean up when modal closes
    };
  }, [showRawData]);

  // If no device data and not loading, show a "No device selected" message
  if (!deviceData && !loading) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-4 text-center">
        No device selected.
      </div>
    );
  }

  // List of information items to display about the device
  const infoItems = [
    { label: 'Model Name', value: deviceData?.deviceInfo?.modelName },
    { label: 'Device ID', value: deviceData?.deviceInfo?.deviceID },
    { label: 'Version', value: deviceData?.deviceInfo?.version },
    { label: 'MAC Address', value: deviceData?.deviceInfo?.macAddress },
    { label: 'IP', value: deviceData?.deviceInfo?.IPADD },
    { 
      label: 'Status', 
      value: deviceData?.deviceInfo?.status, 
      className: deviceData?.deviceInfo?.status === 'normal' ? 'text-green-600' : 'text-red-600' 
    },
    { label: 'Last Update', value: deviceData?.deviceInfo?.lastUpdate },
    { 
      label: 'Raw Data', 
      value: (
        <button 
          onClick={() => setShowRawData(true)} // Show the raw data modal when clicked
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 
                   hover:text-blue-700 hover:underline focus:outline-none transition-colors"
        >
          <FileJson className="h-3.5 w-3.5" /> {/* File icon */}
          View
        </button>
      )
    },
  ];

  return (
    <>
      {/* Device information container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Animation for initial visibility
        animate={{ opacity: 1, y: 0 }} // Animation when visible
        transition={{ duration: 0.5 }} // Animation duration
        className="bg-white shadow-xl rounded-lg p-4 relative"
      >
        <div className="space-y-4">
          {/* Device data grid */}
          <div className="grid grid-cols-8 gap-2 text-sm">
            {infoItems.map((item, index) => (
              <div key={index}>
                <div className="font-semibold text-gray-700">{item.label}</div>
                <div className={`text-gray-800 ${item.className || ''}`}>
                  {loading ? '-' : item.value || 'N/A'} {/* Display loading or data */}
                </div>
              </div>
            ))}
          </div>
          {/* Show loading spinner when loading */}
          {loading && (
            <div className="flex justify-center">
              <Loader />
            </div>
          )}
        </div>
      </motion.div>

      {/* Raw Data Modal */}
      {showRawData && (
        <Modal onClose={() => setShowRawData(false)}>
          <div className="bg-white rounded-lg shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Raw Device Data</h2>
                  <p className="text-sm text-gray-500 mt-1">Detailed device information and records</p>
                </div>
                {/* Close button */}
                <button 
                  onClick={() => setShowRawData(false)} // Close the modal
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 
                           flex items-center justify-center group"
                >
                  <X className="h-6 w-6 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
              {/* Display raw data with scroll */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto rounded-lg border border-gray-200">
                <pre className="bg-gray-50 p-6 text-sm whitespace-pre-wrap text-gray-700 font-mono">
                  {JSON.stringify(deviceData?.deviceInfo?.latestRecord, null, 2)} {/* Pretty print JSON */}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default DeviceInfo;
