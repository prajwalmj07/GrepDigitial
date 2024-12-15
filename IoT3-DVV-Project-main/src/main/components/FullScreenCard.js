import React, { useState } from 'react';
import { Layout, TableIcon, Minimize2, LineChart } from 'lucide-react';
import ChartTypeSelector from './ChartTypeSelector';
import { energyMeters } from '../lib/energyMetersData';
import DataTable from './DataTable';

/**
 * FullScreenCard Component
 * Renders a fullscreen modal for displaying a chart, table, or split view of data.
 * Includes functionality for toggling between views and selecting chart types.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the fullscreen card
 * @param {React.ReactNode} props.children - Content to render in the card
 * @param {Function} props.onClose - Function to close the fullscreen card
 * @param {string} props.chartType - Current chart type being displayed
 * @param {Function} props.onChangeChartType - Callback for changing chart type
 * @param {string} props.currentMetric - Currently selected metric
 * @param {string} props.selectedMeter - ID of the selected energy meter
 */

// FullScreenCard [MYA016] component that displays content in fullscreen mode with a header and control buttons
const FullScreenCard = ({
  title,
  children,
  onClose,
  chartType,
  onChangeChartType,
  currentMetric,
  selectedMeter
}) => {
  const [viewMode, setViewMode] = useState('chart'); // State to track the current view mode ('chart', 'split', 'table')

  // Map of meter IDs to their names in uppercase
  const meterNames = Object.fromEntries(
    energyMeters.map(meter => [meter.id, meter.name.toUpperCase()])
  );

  // Retrieve the name of the selected meter or show a default message
  const selectedMeterName = meterNames[selectedMeter] || 'No Meter Selected';

  // Function to get the icon based on the current view mode
  const getIcon = () => {
    switch (viewMode) {
      case 'chart':
        return <Layout className="w-5 h-5" />;
      case 'split':
        return <TableIcon className="w-5 h-5" />;
      case 'table':
        return <LineChart className="w-5 h-5" />;
      default:
        return <Minimize2 className="w-5 h-5" />;
    }
  };

  // Function to cycle through view modes
  const cycleViewMode = () => {
    const modes = ['chart', 'split', 'table'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white p-8 flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {/* Selected Meter Name */}
          <div className="text-lg font-bold text-white bg-green-500 px-4 py-2 rounded-md shadow-sm whitespace-nowrap">
            {selectedMeterName}
          </div>
          {/* Title */}
          <h3 className="font-bold text-gray-800 text-2xl">{title}</h3>
        </div>
        <div className="flex items-center space-x-4">
          {/* Chart Type Selector */}
          <ChartTypeSelector
            currentMetric={currentMetric}
            chartType={chartType}
            onChangeChartType={onChangeChartType}
          />
          {/* Toggle View Mode Button */}
          <button
            onClick={cycleViewMode}
            className="text-gray-500 hover:text-blue-500 focus:outline-none transition-colors duration-300"
            aria-label="Toggle view mode"
          >
            {getIcon()}
          </button>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-blue-500 focus:outline-none transition-colors duration-300"
            aria-label="Close full screen"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {viewMode === 'chart' && (
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
        )}
        {viewMode === 'split' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-hidden">{children}</div>
            <div className="flex-1 overflow-hidden">
              <DataTable chartType={chartType} currentMetric={currentMetric} />
            </div>
          </div>
        )}
        {viewMode === 'table' && (
          <div className="w-full h-full overflow-hidden">
            <DataTable chartType={chartType} currentMetric={currentMetric} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FullScreenCard;
