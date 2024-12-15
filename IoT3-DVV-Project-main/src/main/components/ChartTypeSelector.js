import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { chartConfigsState } from '../lib/chartConfigs';

/**
 * Formats the chart type label for display.
 * - Replaces underscores with spaces.
 * - Replaces hyphens with " vs ".
 * - Capitalizes the first letter of each word.
 *
 * @param {string} type - The chart type string to format.
 * @returns {string} - The formatted chart type label.
 */
const formatChartTypeLabel = (type) => {
  return type
    .replace(/_/g, ' ')
    .replace(/-/g, ' vs ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * ChartTypeSelector Component
 * A navigation component to select and cycle through different chart types.
 *
 * Props:
 * - currentMetric (string): The metric currently displayed on the chart.
 * - chartType (string): The currently selected chart type.
 * - onChangeChartType (function): Callback triggered when the chart type changes.
 */
const ChartTypeSelector = ({ currentMetric, chartType, onChangeChartType }) => {
  // Access chart configurations from Recoil state.
  const chartConfigs = useRecoilValue(chartConfigsState);

  /**
   * Generates a list of chart types based on the current metric and chart configurations.
   * - Includes basic chart types (line, bar, pie, doughnut).
   * - Dynamically generates valid combined chart types based on rules.
   */
  const chartTypes = useMemo(() => {
    const baseChartTypes = ['line', 'bar', 'pie', 'doughnut'];

    // Get the current metric's configuration.
    const currentConfig = chartConfigs.energyMeter.find(
      config => config.title.toLowerCase() === currentMetric.toLowerCase()
    );

    if (!currentConfig) return baseChartTypes;

    // Helper function to validate combinations of metrics.
    const isValidCombination = (metric1, metric2) => {
      const invalidCombos = [
        ['apparent_power', 'reactive_power'],
        ['reactive_power', 'apparent_power'],
      ];

      return !invalidCombos.some(([m1, m2]) =>
        (metric1.toLowerCase() === m1 && metric2.toLowerCase() === m2) ||
        (metric1.toLowerCase() === m2 && metric2.toLowerCase() === m1)
      );
    };

    // Generate combined chart types by pairing the current metric with others.
    const combinedChartTypes = chartConfigs.energyMeter
      .filter(config => {
        const configTitle = config.title.toLowerCase();

        // Exclude self-combination, invalid combinations, and specific metrics.
        return configTitle !== currentMetric.toLowerCase() && 
               configTitle !== 'apparent_vs_reactive_power' &&
               isValidCombination(currentMetric, configTitle);
      })
      .map(config => `${currentMetric}-${config.title.toLowerCase()}`);

    return [...baseChartTypes, ...combinedChartTypes];
  }, [currentMetric, chartConfigs]);

  /**
   * Handles navigation between chart types.
   * - Moves left or right through the list of available chart types.
   *
   * @param {string} direction - The direction to move ('left' or 'right').
   */
  const handleChartTypeChange = (direction) => {
    const currentIndex = chartTypes.indexOf(chartType);
    let newIndex;

    if (direction === 'left') {
      // Wrap around to the end if moving left from the first item.
      newIndex = currentIndex <= 0 ? chartTypes.length - 1 : currentIndex - 1;
    } else {
      // Wrap around to the start if moving right from the last item.
      newIndex = currentIndex >= chartTypes.length - 1 ? 0 : currentIndex + 1;
    }

    onChangeChartType(chartTypes[newIndex]);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Left Navigation Button */}
      <button onClick={() => handleChartTypeChange('left')} className="p-1">
        <ChevronLeft size={20} />
      </button>

      {/* Display the formatted chart type label */}
      <span className="text-sm font-medium">{formatChartTypeLabel(chartType)}</span>

      {/* Right Navigation Button */}
      <button onClick={() => handleChartTypeChange('right')} className="p-1">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default ChartTypeSelector;
