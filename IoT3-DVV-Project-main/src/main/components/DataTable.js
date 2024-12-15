import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { meterDataState } from '../lib/atoms';
import { chartConfigsState } from '../lib/chartConfigs';

/**
 * A table component for displaying meter data based on selected chart types and metrics.
 * Uses Recoil for state management and dynamically generates the table data.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.chartType - The type of chart being displayed.
 * @param {string} props.currentMetric - The current metric selected for analysis.
 */
const DataTable = ({ chartType, currentMetric }) => {
  // Retrieve the current meter data and chart configurations from Recoil state
  const meterData = useRecoilValue(meterDataState);
  const chartConfigs = useRecoilValue(chartConfigsState);

  // Compute the table data based on chartType, currentMetric, and meterData
  const tableData = useMemo(() => {
    if (!meterData) return []; // Return an empty array if no meter data is available

    // Helper function to get nested values from an object using a dot-separated path
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc?.[part], obj);
    };

    // Extract the metrics (e.g., metric1 and metric2) from the chartType
    const [metric1, metric2] = chartType.split('-');

    // Handle special case for 'apparent_vs_reactive_power'
    if (metric1.toLowerCase() === 'apparent_vs_reactive_power') {
      const apparentConfig = chartConfigs.energyMeter.find(config => config.title === "Apparent_Power");
      const reactiveConfig = chartConfigs.energyMeter.find(config => config.title === "Reactive_Power");
      const metric2Config = chartConfigs.energyMeter.find(
        config => config.title.toLowerCase() === metric2.toLowerCase()
      );

      // Map timestamps and generate rows
      return meterData.mappedData.timestamps.map((timestamp, index) => {
        const rowData = { timestamp: new Date(timestamp).toLocaleString() };

        // Populate data for apparent power fields
        apparentConfig.fields.forEach(field => {
          const value = getNestedValue(meterData.mappedData, field)[index];
          const fieldName = field.split('.').pop();
          rowData[`Apparent_${fieldName}`] = value;
        });

        // Populate data for reactive power fields
        reactiveConfig.fields.forEach(field => {
          const value = getNestedValue(meterData.mappedData, field)[index];
          const fieldName = field.split('.').pop();
          rowData[`Reactive_${fieldName}`] = value;
        });

        // Populate data for metric2 fields
        metric2Config.fields.forEach(field => {
          const value = getNestedValue(meterData.mappedData, field)[index];
          const fieldName = field.split('.').pop();
          rowData[`${metric2}_${fieldName}`] = value;
        });

        return rowData;
      });
    }

    // Handle case for currentMetric as 'apparent_vs_reactive_power'
    if (currentMetric.toLowerCase() === 'apparent_vs_reactive_power') {
      const apparentConfig = chartConfigs.energyMeter.find(config => config.title === "Apparent_Power");
      const reactiveConfig = chartConfigs.energyMeter.find(config => config.title === "Reactive_Power");

      return meterData.mappedData.timestamps.map((timestamp, index) => {
        const rowData = { timestamp: new Date(timestamp).toLocaleString() };

        // Populate data for apparent power fields
        apparentConfig.fields.forEach(field => {
          const value = getNestedValue(meterData.mappedData, field)[index];
          const fieldName = field.split('.').pop();
          rowData[`Apparent_${fieldName}`] = value;
        });

        // Populate data for reactive power fields
        reactiveConfig.fields.forEach(field => {
          const value = getNestedValue(meterData.mappedData, field)[index];
          const fieldName = field.split('.').pop();
          rowData[`Reactive_${fieldName}`] = value;
        });

        return rowData;
      });
    }

    // Handle case for a single metric
    const config = chartConfigs.energyMeter.find(
      config => config.title.toLowerCase() === currentMetric.toLowerCase()
    );

    if (!chartType.includes('-')) {
      const fields = config.fields;
      return meterData.mappedData.timestamps.map((timestamp, index) => {
        const rowData = { timestamp: new Date(timestamp).toLocaleString() };

        // Populate data for fields
        fields.forEach(field => {
          const value = getNestedValue(meterData.mappedData, field)[index];
          const fieldName = field.split('.').pop();
          rowData[fieldName] = value;
        });

        return rowData;
      });
    }

    // Handle case for dual metrics
    const config1 = chartConfigs.energyMeter.find(
      config => config.title.toLowerCase() === metric1.toLowerCase()
    );
    const config2 = chartConfigs.energyMeter.find(
      config => config.title.toLowerCase() === metric2.toLowerCase()
    );

    return meterData.mappedData.timestamps.map((timestamp, index) => {
      const rowData = { timestamp: new Date(timestamp).toLocaleString() };

      // Populate data for metric1 fields
      config1.fields.forEach(field => {
        const value = getNestedValue(meterData.mappedData, field)[index];
        const fieldName = field.split('.').pop();
        rowData[`${metric1}_${fieldName}`] = value;
      });

      // Populate data for metric2 fields
      config2.fields.forEach(field => {
        const value = getNestedValue(meterData.mappedData, field)[index];
        const fieldName = field.split('.').pop();
        rowData[`${metric2}_${fieldName}`] = value;
      });

      return rowData;
    });
  }, [meterData, chartType, currentMetric, chartConfigs]);

  // If no data is available, return null to render nothing
  if (tableData.length === 0) return null;

  // Get table headers from the keys of the first row of data
  const headers = Object.keys(tableData[0]);

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Header section */}
      <div className="flex justify-between items-center bg-blue-50 px-6 py-2 border-b border-blue-100">
        <span className="text-blue-800 font-medium text-sm">Data Overview</span>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
          {tableData.length} Rows
        </div>
      </div>

      {/* Table content */}
      <div className="flex-grow overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map(header => (
                <th
                  key={header}
                  className="bg-gradient-to-b from-blue-50 to-blue-100 text-blue-800 font-semibold px-4 py-3 text-left border-b border-blue-200 first:rounded-tl-lg last:rounded-tr-lg"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className="transition-colors duration-100 hover:bg-blue-50 even:bg-blue-50/30"
              >
                {headers.map(header => (
                  <td
                    key={header}
                    className="px-4 py-2.5 border-b border-blue-100 text-gray-700 truncate max-w-[250px]"
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
