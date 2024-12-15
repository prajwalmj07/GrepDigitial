import React from 'react';
import moment from 'moment';
import { useRecoilValue } from 'recoil';
import { chartConfigsState } from '../../lib/chartConfigs';
import GenericChart from './GenericChart';

/**
 * Generates a list of distinct colors for datasets.
 * @param {number} count - Number of colors needed.
 * @returns {string[]} - Array of hsla color strings.
 */
const generateDistinctColors = (count) => {
  const colors = [];
  const goldenRatio = 0.618033988749895; // Golden ratio constant for color generation
  let hue = Math.random(); // Start with a random hue
  for (let i = 0; i < count; i++) {
    hue = (hue + goldenRatio) % 1; // Increment hue by golden ratio
    colors.push(`hsla(${Math.floor(hue * 360)}, 80%, 55%, 1)`); // Generate hsla color
  }
  return colors;
};

/**
 * Renders a chart with dual Y-axis [MYA015] support based on the provided data and configuration.
 * @param {Object} props - Component props.
 * @param {string} props.chartType - A string specifying the metrics to compare, e.g., "voltage-current".
 * @param {Object} props.data - Data to be visualized, containing mapped fields and timestamps.
 */
const DualYaxis = ({ chartType, data }) => {
  if (typeof window === 'undefined' || !data) return null; // Prevent rendering on the server or without data.

  const chartConfigs = useRecoilValue(chartConfigsState); // Fetch chart configurations from Recoil state.

  const [type1, type2] = chartType.split('-'); // Split chartType into two metrics, e.g., "voltage" and "current".

  /**
   * Finds the configuration object for a given metric type.
   * @param {string} metricType - The metric type to fetch configuration for.
   * @returns {Object} - Configuration object for the metric.
   */
  const getConfig = (metricType) => {
    const config = chartConfigs.energyMeter.find((config) =>
      config.title.toLowerCase() === metricType.toLowerCase()
    );
    return config;
  };

  /**
   * Extracts the nested field value from the data object.
   * @param {string} field - Dot-separated string representing the nested field.
   * @param {Object} data - The data object to extract the value from.
   * @returns {*} - The value of the field, or null if not found.
   */
  const extractValue = (field, data) => {
    const keys = field.split('.'); // Split the field path into keys.
    let value = data;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]; // Traverse to the next nested key.
      } else {
        return null; // Return null if the key doesn't exist.
      }
    }
    return value;
  };

  /**
   * Constructs datasets for the chart based on the metric type and its configuration.
   * @param {string} metricType - The metric type (e.g., "voltage").
   * @param {boolean} isDataset2 - Indicates whether the dataset belongs to the second Y-axis.
   * @param {string[]} colors - Array of colors for the datasets.
   * @returns {Object[]} - Array of dataset objects for the chart.
   */
  const getDatasets = (metricType, isDataset2 = false, colors) => {
    const config = getConfig(metricType);
    if (!config) return [];
  
    return config.fields.map((field, index) => {
      const value = extractValue(field, data.mappedData); // Get values for the field.
      if (value === null) return null;
      const label = field.split('.').pop(); // Get the last part of the field as the label.
      const phase = label.slice(-1); // Assume the last character represents the phase.
      return {
        label: `${config.title} Phase ${phase}`, // Label for the dataset.
        data: data.mappedData.date.map((date, i) => ({
          x: moment(`${date} ${data.mappedData.time[i]}`), // Combine date and time for the X-axis.
          y: value[i], // Corresponding Y-axis value.
        })),
        borderColor: colors[index], // Dataset line color.
        backgroundColor: colors[index].replace('1)', '0.5)'), // Transparent background color.
        yAxisID: isDataset2 ? 'y2' : 'y1', // Assign dataset to the appropriate Y-axis.
      };
    }).filter(Boolean); // Filter out any invalid datasets.
  };

  const config1 = getConfig(type1); // Get configuration for the first metric.
  const config2 = getConfig(type2); // Get configuration for the second metric (if any).

  // Calculate the total number of datasets and generate corresponding colors.
  const totalDatasets = (config1?.fields?.length || 0) + (config2?.fields?.length || 0);
  const allColors = generateDistinctColors(totalDatasets);

  // Combine datasets for both metrics.
  const datasets = [
    ...getDatasets(type1, false, allColors.slice(0, config1?.fields?.length)),
    ...(type2 ? getDatasets(type2, true, allColors.slice(config1?.fields?.length)) : []),
  ].filter(Boolean); // Filter out any invalid datasets.

  // Chart data structure.
  const chartData = {
    datasets: datasets,
  };

  // Chart options configuration.
  const options = {
    responsive: true,
    interaction: {
      mode: 'index', // Interactions highlight datasets with matching indices.
      intersect: false,
    },
    stacked: false, // Disable stacking for dual Y-axes.
    plugins: {
      title: {
        display: true,
        text: type2 ? `${type1} vs ${type2}` : type1, // Dynamic chart title.
      },
      zoom: {
        pan: { enabled: true, mode: 'xy' }, // Enable panning on both axes.
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }, // Enable zooming on both axes.
      },
    },
    scales: {
      x: {
        type: 'time', // X-axis uses time scale.
        time: {
          unit: 'hour', // Display time in hours.
          displayFormats: { hour: 'HH:mm', day: 'MMM D' },
        },
        ticks: {
          // Custom tick formatting to show day transitions.
          callback: function (value, index, values) {
            const currentDate = moment(value);
            const previousDate = index > 0 ? moment(values[index - 1].value) : null;
            if (!previousDate || !currentDate.isSame(previousDate, 'day')) {
              return currentDate.format('MMM D HH:mm');
            }
            return currentDate.format('HH:mm');
          },
        },
      },
      y1: {
        type: 'linear', // Left Y-axis for the first metric.
        display: true,
        position: 'left',
        title: {
          display: true,
          text: config1.unit
            ? `${config1.title} (${config1.unit})`
            : config1.title,
        },
      },
      y2: type2
        ? {
            type: 'linear', // Right Y-axis for the second metric.
            display: true,
            position: 'right',
            title: {
              display: true,
              text: config2.unit
                ? `${config2.title} (${config2.unit})`
                : config2.title,
            },
            grid: { drawOnChartArea: false }, // Avoid overlapping grid lines.
          }
        : undefined,
    },
  };

  return <GenericChart chartType="line" data={chartData} options={options} />; // Render the chart.
};

export default DualYaxis;
