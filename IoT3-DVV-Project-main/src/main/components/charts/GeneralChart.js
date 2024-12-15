import React from 'react';
import GenericChart from './GenericChart';
import moment from 'moment';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import 'chartjs-adapter-moment'; // Adds moment.js adapter for time scales
import 'chartjs-plugin-zoom'; // Adds zoom and pan capabilities
import zoomPlugin from 'chartjs-plugin-zoom'; // Registers the zoom plugin
import { useRecoilValue } from 'recoil'; // Imports Recoil for state management
import { chartConfigsState } from '../../lib/chartConfigs'; // State containing chart configurations

// Register required Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, TimeScale, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement, BarElement, zoomPlugin
);

/**
 * Function to generate a specified number of distinct colors.
 * Uses the golden ratio to ensure evenly distributed hues.
 */
const generateDistinctColors = (count) => {
  const colors = [];
  const goldenRatio = 0.618033988749895;
  let hue = Math.random(); // Random starting point for hue

  for (let i = 0; i < count; i++) {
    hue = (hue + goldenRatio) % 1; // Increment hue by golden ratio
    colors.push(`hsla(${Math.floor(hue * 360)}, 80%, 55%, 1)`); // Generate HSLA color
  }
  return colors;
};

/**
 * Formats the label for threshold lines.
 * Includes the key, type (High/Low), phase, and title from the config.
 */
const formatThresholdLabel = (key, type, phase, config) => {
  const thresholdConfig = config.thresholds[key];
  if (!thresholdConfig) return `${config.title} ${phase} ${type} Threshold`;

  return `${config.title} ${phase} ${type} Threshold`;
};

/**
 * GeneralChart MYA014 component for rendering various types of charts.
 * @param {string} chartType - Type of chart (e.g., 'line', 'pie', 'area').
 * @param {object} data - The data to be plotted.
 * @param {object} config - Configuration for the chart (title, fields, thresholds, unit).
 */
const GeneralChart = ({ chartType, data, config }) => {
  if (!data || !config) return null; // Return null if no data or config is provided

  const { title, fields, thresholds, unit } = config; // Destructure chart configuration
  const chartConfigs = useRecoilValue(chartConfigsState); // Access chart configurations from Recoil state

  /**
   * Utility function to retrieve nested values from an object.
   * @param {object} obj - The object to retrieve the value from.
   * @param {string|array} path - Dot-separated string or array of keys.
   */
  const getNestedValue = (obj, path) => {
    const parts = Array.isArray(path) ? path : path.split('.');
    return parts.reduce((acc, part) => acc && acc[part], obj); // Traverse the object using the keys
  };

  const distinctColors = generateDistinctColors(fields.length); // Generate colors for the datasets

  /**
   * Creates datasets for threshold lines (high and low values).
   * These appear as dashed lines on the chart.
   */
  const createThresholdDatasets = () => {
    if (!thresholds || !data.thresholdValues) return []; // Return empty if no thresholds exist

    return Object.entries(thresholds).flatMap(([key, threshold]) => {
      const datasets = [];

      // Retrieve high and low threshold values
      const highValue = getNestedValue(data.thresholdValues, threshold.high);
      const lowValue = getNestedValue(data.thresholdValues, threshold.low);

      // Add high threshold line dataset
      if (highValue !== undefined) {
        datasets.push({
          label: formatThresholdLabel(key, 'High', key.slice(-1), config),
          data: data.mappedData.date.map((date, i) => ({
            x: moment(`${date} ${data.mappedData.time[i]}`), // Combine date and time
            y: highValue,
          })),
          borderColor: 'rgba(255, 0, 0, 0.5)', // Red dashed line
          borderDash: [5, 5],
          fill: false,
        });
      }

      // Add low threshold line dataset
      if (lowValue !== undefined) {
        datasets.push({
          label: formatThresholdLabel(key, 'Low', key.slice(-1), config),
          data: data.mappedData.date.map((date, i) => ({
            x: moment(`${date} ${data.mappedData.time[i]}`),
            y: lowValue,
          })),
          borderColor: 'rgba(0, 255, 0, 0.5)', // Green dashed line
          borderDash: [5, 5],
          fill: false,
        });
      }

      return datasets; // Return datasets for high and low thresholds
    });
  };

  /**
   * Formats dataset labels by extracting the phase information.
   * @param {string} field - Field name (e.g., 'voltage.v1').
   */
  const formatDatasetLabel = (field) => {
    const parts = field.split('.');
    const lastPart = parts[parts.length - 1];
    const phase = lastPart.slice(-1); // Extract phase (e.g., '1' from 'v1')
    return `${title} ${phase}`;
  };

  // Prepare data for the chart
  const chartData = chartType === 'pie' || chartType === 'doughnut'
    ? {
      labels: fields.map(field => formatDatasetLabel(field)), // Labels for pie/doughnut charts
      datasets: [{
        data: fields.map(field => {
          const values = getNestedValue(data.mappedData, field); // Get data for each field
          return Array.isArray(values)
            ? values.reduce((a, b) => a + b, 0) / values.length // Average value
            : values;
        }),
        backgroundColor: distinctColors.map(color => color.replace('1)', '0.5)')), // Semi-transparent colors
        borderColor: distinctColors, // Border colors
      }],
    }
    : {
      datasets: [
        ...fields.map((field, index) => ({
          label: formatDatasetLabel(field), // Dataset label
          data: getNestedValue(data.mappedData, field).map((value, i) => ({
            x: moment(`${data.mappedData.date[i]} ${data.mappedData.time[i]}`), // Combine date and time
            y: value,
          })),
          borderColor: distinctColors[index],
          backgroundColor: distinctColors[index].replace('1)', '0.5)'), // Semi-transparent fill for area charts
          fill: chartType === 'area', // Fill only for area charts
        })),
        ...createThresholdDatasets(), // Add threshold datasets
      ],
    };

  // Chart options
  const options = {
    plugins: {
      legend: { position: 'top' }, // Display legend at the top
      zoom: { // Enable zoom and pan
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy', // Allow zoom in both x and y directions
        },
        pan: { enabled: true, mode: 'xy' }, // Allow pan in both x and y directions
      },
    },
    scales: chartType === 'pie' || chartType === 'doughnut'
      ? {} // No axes for pie or doughnut charts
      : {
        x: { // Configure x-axis as time scale
          type: 'time',
          time: {
            unit: 'hour', // Display hours
            displayFormats: { hour: 'HH:mm', day: 'MMM D' },
          },
          ticks: {
            callback: function(value, index, values) {
              const currentDate = moment(value); // Format date
              const previousDate = index > 0 ? moment(values[index - 1].value) : null;
              if (!previousDate || !currentDate.isSame(previousDate, 'day')) {
                return currentDate.format('MMM D HH:mm'); // Show date and time if day changes
              }
              return currentDate.format('HH:mm'); // Show time otherwise
            },
          },
        },
        y: { // Configure y-axis
          title: { 
            display: true, 
            text: unit ? `${title} (${unit})` : title, // Display unit in axis title if available
          },
        },
      },
  };

  // Additional options for bar charts
  if (chartType === 'bar') {
    options.scales.x = {
      ...options.scales.x,
      offset: false,
      barPercentage: 1.0, // Full-width bars
      categoryPercentage: 1.0, // Full-width categories
    };
  }

  return <GenericChart chartType={chartType} data={chartData} options={options} />; // Render chart with GenericChart
};

export default GeneralChart;
