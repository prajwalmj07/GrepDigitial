// hooks/useEnergyMeterStates
import { useRecoilState, useSetRecoilState } from 'recoil'; // Importing Recoil hooks
import { selectedMeterState, graphConfigState, fullScreenCardState, shouldFetchDataState } from '../lib/atoms'; // Importing Recoil atoms

//[MYA021] Custom hook for managing energy meter states
export function useEnergyMeterStates() {
  // Recoil state for selected meter, allowing both read and update
  const [selectedMeter, setSelectedMeter] = useRecoilState(selectedMeterState);
  
  // Recoil state for graph configuration, allowing both read and update
  const [graphConfig, setGraphConfig] = useRecoilState(graphConfigState);
  
  // Recoil state for managing the full-screen card view, allowing both read and update
  const [fullScreenCard, setFullScreenCard] = useRecoilState(fullScreenCardState);
  
  // Recoil setter for controlling whether data should be fetched or not
  const setShouldFetchData = useSetRecoilState(shouldFetchDataState);

  // Function to set the selected meter and trigger data fetching
  const setSelectedMeterAndFetch = (meter) => {
    setSelectedMeter(meter); // Update the selected meter
    setShouldFetchData(true); // Set shouldFetchData to true, indicating that data should be fetched
  };

  // Returning the state and functions for use in other components
  return {
    selectedMeter, // The current selected meter
    setSelectedMeter: setSelectedMeterAndFetch, // The function to update the selected meter and trigger data fetch
    graphConfig, // The current graph configuration (show/hide and chart type)
    setGraphConfig, // Function to update the graph configuration
    fullScreenCard, // The current state of the full-screen card (if any)
    setFullScreenCard // Function to update the full-screen card state
  };
}
