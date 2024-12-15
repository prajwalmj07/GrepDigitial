import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import FullScreenCard from './FullScreenCard';
import GeneralChart from './charts/GeneralChart';
import { useEnergyMeterStates } from '../hooks/useEnergyMeterStates';
import { useRecoilValue } from 'recoil';
import { meterDataState } from '../lib/atoms';
import { chartConfigsState } from '../lib/chartConfigs';
import DualYaxis from './charts/DualYaxis';

//[MYA008]
const GraphLayout = ({ loading }) => {
  // Destructuring state and functions from the custom hook
  const { selectedMeter, graphConfig, setGraphConfig, fullScreenCard, setFullScreenCard } = useEnergyMeterStates();

  // Fetching meter data and chart configurations from Recoil state
  const meterData = useRecoilValue(meterDataState);
  const chartConfigs = useRecoilValue(chartConfigsState);

  // Function to update chart type for a specific metric in the graphConfig state
  const changeChartType = (metric, newType) => {
    setGraphConfig(prev => ({
      ...prev,
      [metric]: { ...prev[metric], chartType: newType }
    }));
  };

  // Function to retrieve the chart type for a specific metric, defaults to 'line'
  const getChartType = (metric) => {
    return graphConfig[metric]?.chartType || 'line';
  };

  // Function to render the appropriate chart based on the configuration and chart type
  const renderChart = (config, index) => {
    const metric = config.title.toLowerCase(); // Convert the title to lowercase for metric matching
    const chartType = getChartType(metric); // Get the chart type for the metric

    // If chart type includes a hyphen (indicating dual y-axis chart), render DualYaxis component
    if (chartType.includes('-')) {
      return (
        <DualYaxis
          chartType={chartType}
          data={meterData} // Pass meter data to DualYaxis
        />
      );
    }

    // Default rendering using GeneralChart component
    return (
      <GeneralChart
        chartType={chartType}
        data={meterData} // Pass meter data to GeneralChart
        config={config} // Pass chart config for this specific chart
      />
    );
  };

  // If meterData or chartConfigs is missing, render nothing (loading state)
  if (!meterData || !chartConfigs) return null;

  return (
    <>
      {/* Main grid layout to display the charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <AnimatePresence>
          {/* Mapping over the energyMeter chart configurations */}
          {chartConfigs.energyMeter.map((config, index) => (
            // Render each chart as a motion component with fade-in and scaling animation
            graphConfig[config.title.toLowerCase()]?.show && ( // Check if the chart is set to be shown
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }} // Initial animation state
                animate={{ opacity: 1, scale: 1 }} // Final animation state
                exit={{ opacity: 0, scale: 0.9 }} // Exit animation state
                transition={{ duration: 0.3 }} // Transition duration
              >
                {/* Card component that wraps each chart */}
                <Card
                  title={config.title} // Chart title
                  onFullScreen={() => setFullScreenCard({ index, metric: config.title.toLowerCase() })} // Function to open in fullscreen
                  chartType={getChartType(config.title.toLowerCase())} // Get current chart type for this chart
                  onChangeChartType={(newType) => changeChartType(config.title.toLowerCase(), newType)} // Function to change chart type
                  currentMetric={config.title.toLowerCase()} // Metric name
                  loading={loading} // Loading state passed to Card component
                >
                  {/* Render the chart inside the card */}
                  {renderChart(config, index)}
                </Card>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* If a chart is in fullscreen mode, render the FullScreenCard */}
      {fullScreenCard !== null && (
        <FullScreenCard
          title={chartConfigs.energyMeter[fullScreenCard.index].title}
          onClose={() => setFullScreenCard(null)}
          chartType={getChartType(chartConfigs.energyMeter[fullScreenCard.index].title.toLowerCase())}
          onChangeChartType={(newType) => changeChartType(chartConfigs.energyMeter[fullScreenCard.index].title.toLowerCase(), newType)}
          currentMetric={chartConfigs.energyMeter[fullScreenCard.index].title.toLowerCase()}
          selectedMeter={selectedMeter}
          data={meterData}
          config={chartConfigs.energyMeter[fullScreenCard.index]}
        >
          {renderChart(chartConfigs.energyMeter[fullScreenCard.index], fullScreenCard.index)}
        </FullScreenCard>
      )}
    </>
  );
};

export default GraphLayout;
