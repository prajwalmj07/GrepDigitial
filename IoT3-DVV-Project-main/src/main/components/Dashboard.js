'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecoilRoot, useSetRecoilState, useRecoilValue } from 'recoil';
import DateRangeDropdown from './DateRangeDropdown';
import EnergyMeterDropdown from './EnergyMeterDropdown';
import GraphLayout from './GraphLayout';
import DeviceInfo from './DeviceInfo';
import ExportButton from './ExportButton';
import PollingDropdown from './PollingDropdown';
import { useEnergyMeterStates } from '../hooks/useEnergyMeterStates';
import { shouldFetchDataState, dateRangeState } from '../lib/atoms';
import useFetchMeterData from '@/hooks/useFetchMeterData';
import { energyMeters } from '../lib/energyMetersData';

// DashboardContent Component [MYA003]
const DashboardContent = () => {
  const { fullScreenCard, selectedMeter } = useEnergyMeterStates();
  const setShouldFetchData = useSetRecoilState(shouldFetchDataState);
  const dateRange = useRecoilValue(dateRangeState);

  const [pollingInterval, setPollingInterval] = useState(null);
  const [isToday, setIsToday] = useState(true);
  const { data: meterData, loading, error } = useFetchMeterData(selectedMeter, isToday ? pollingInterval : null);

  // Creating a mapping for meter names to easily get the name from the ID
  const meterNames = Object.fromEntries(energyMeters.map(meter => [meter.id, meter.name.toUpperCase()]));
  const selectedMeterName = meterNames[selectedMeter] || 'No Meter Selected';

  useEffect(() => {
    // Ensures data fetching is triggered when the component is loaded
    setShouldFetchData(true);
  }, [setShouldFetchData]);

  const handleIntervalChange = (interval) => {
    setPollingInterval(interval);
  };

  // Display error message if there's an issue with data fetching
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen h-[100vh] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col w-full h-full p-4 overflow-hidden">
        {/* Header section with dropdowns and export button */}
        <AnimatePresence>
          {fullScreenCard === null && (
            <motion.div
              className="flex justify-between items-center mb-4 bg-white z-10 pb-4 rounded-lg shadow-md p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-4">
                {/* Energy meter dropdown */}
                <EnergyMeterDropdown />
              </div>
              <div className="flex items-center space-x-4">
                {/* Polling Dropdown and Date range selector */}
                <PollingDropdown onIntervalChange={handleIntervalChange} isToday={isToday} />
                <DateRangeDropdown setIsToday={setIsToday} />
                {/* Export button */}
                <ExportButton selectedMeter={selectedMeter} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device Info Section */}
        <AnimatePresence>
          {fullScreenCard === null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <DeviceInfo loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Graph Section */}
        <motion.div
          className="flex-grow overflow-y-auto relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GraphLayout meterData={meterData} loading={loading} />
        </motion.div>
      </div>
    </div>
  );
};

// Root component for the dashboard
/**
 * Dashboard Component [MYA002]
 * Wraps the content with RecoilRoot to provide Recoil state management.
 */
const Dashboard = () => (
  <RecoilRoot>
    <DashboardContent />
  </RecoilRoot>
);

export default Dashboard;
