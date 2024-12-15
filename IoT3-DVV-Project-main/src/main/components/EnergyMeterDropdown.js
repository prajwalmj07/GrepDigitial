'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnergyMeterStates } from '../hooks/useEnergyMeterStates';
import { energyMeters } from '../lib/energyMetersData';

//[MYA007]
const EnergyMeterDropdown = () => {
  const { selectedMeter, setSelectedMeter } = useEnergyMeterStates();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (meterId) => {
    setSelectedMeter(meterId);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={toggleDropdown}
        className={`w-full px-4 py-3 border rounded-lg text-left transition-colors duration-300 ${
          isOpen
            ? 'bg-gray-100 text-gray-700'
            : selectedMeter
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-800'
        }`}
      >
        {energyMeters.find((meter) => meter.id === selectedMeter)?.name || 'Select Energy Meter'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {energyMeters.map((meter) => (
              <motion.li
                key={meter.id}
                className={`px-4 py-2 cursor-pointer transition-colors duration-300 whitespace-nowrap ${
                  selectedMeter === meter.id
                    ? 'bg-gray-100 text-gray-700 font-semibold'
                    : 'text-gray-800 hover:bg-white'
                }`}
                onClick={() => handleSelect(meter.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {meter.name}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnergyMeterDropdown;
