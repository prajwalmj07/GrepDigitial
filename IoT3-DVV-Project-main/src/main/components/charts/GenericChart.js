// Import necessary libraries and components for creating and rendering charts.
import React from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, // Core Chart.js library
  CategoryScale, // For categorical data on the X-axis
  LinearScale, // For linear scaling on the axes
  PointElement, // For points in line charts
  LineElement, // For line chart rendering
  BarElement, // For bar chart rendering
  ArcElement, // For pie/doughnut chart rendering
  Title, // For chart title
  Tooltip, // For tooltip functionality
  Legend, // For chart legend
} from 'chart.js';

// Register the required Chart.js components to enable their use in the charts.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define the GenericChart component that renders different types of charts.
// Props:
// - chartType: The type of chart to render (e.g., 'line', 'bar', 'pie').
// - data: The data to be displayed in the chart.
// - options: Configuration options for the chart's behavior and appearance.
const GenericChart = ({ chartType, data, options }) => {
  // Determine the appropriate chart component based on the chartType prop.
  // Default to a Line chart if the chartType is not recognized.
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
    area: Line, // 'area' is treated as a Line chart with fill enabled.
  }[chartType] || Line;

  // Extend the provided options with additional responsive settings.
  const responsiveOptions = {
    ...options, // Retain all original options.
    maintainAspectRatio: false, // Ensure the chart fills the container's height and width.
    responsive: true, // Make the chart responsive to container size changes.
    plugins: {
      ...options.plugins, // Retain existing plugin configurations.
      legend: {
        ...options.plugins?.legend, // Retain existing legend settings, if provided.
        position: 'bottom', // Position the legend below the chart.
        labels: {
          boxWidth: 10, // Width of the legend's color box.
          padding: 10, // Space between legend items.
          font: {
            size: 10, // Font size for legend text.
          },
        },
      },
    },
  };

  // Additional configuration for bar charts.
  if (chartType === 'bar') {
    responsiveOptions.scales = {
      ...responsiveOptions.scales, // Retain existing scale settings.
      x: { 
        ...responsiveOptions.scales.x, // Retain existing X-axis settings.
        barPercentage: 1.0, // Ensure full-width bars.
        categoryPercentage: 1.0, // Ensure consistent category spacing.
      },
    };
  }

  // Return the chart component wrapped in a responsive container.
  return (
    <div className="w-full h-full">
      <ChartComponent data={data} options={responsiveOptions} />
    </div>
  );
};

// Export the GenericChart component for use in other parts of the application.
export default GenericChart;
