import React from "react";
import { Maximize2 } from "lucide-react";
import ChartTypeSelector from "./ChartTypeSelector";
import Loader from "./Loader";

/**
 * Card Component [MYA013]
 * A reusable card component designed to display a chart or other content, 
 * with options for full-screen mode, loading states, and chart type selection.
 *
 * Props:
 * - title (string): The title of the card.
 * - onFullScreen (function): Callback triggered when the full-screen button is clicked.
 * - onChangeChartType (function): Callback triggered when the chart type is changed.
 * - chartType (string): The current chart type being displayed.
 * - currentMetric (string): The metric currently displayed by the chart.
 * - loading (boolean): Indicates whether the content is loading.
 * - children (ReactNode): The main content of the card, typically a chart or other visualization.
 */
const Card = ({ 
  title, 
  onFullScreen, 
  onChangeChartType, 
  chartType, 
  currentMetric, 
  loading,  
  children 
}) => {
  return (
    <div 
      className="bg-white shadow-xl rounded-lg relative p-4 h-68 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        {/* Card Title */}
        <h3 className="font-semibold text-gray-800 text-base truncate">{title}</h3>
        
        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <ChartTypeSelector 
            currentMetric={currentMetric} 
            chartType={chartType} 
            onChangeChartType={onChangeChartType} 
          />

          {/* Full Screen Button */}
          <button
            onClick={onFullScreen}
            className="text-gray-500 hover:text-blue-500 focus:outline-none transition-colors duration-300"
            aria-label="Full Screen"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-grow flex items-center justify-center overflow-hidden">
        <div className="w-full h-full">
          {loading ? (
            // Show Loader when loading
            <div className="flex justify-center items-center h-full w-full">
              <Loader />
            </div>
          ) : (
            // Render children when not loading
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
