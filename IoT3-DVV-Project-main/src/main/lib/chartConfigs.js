import { selector } from 'recoil';
import { meterDataState } from '../lib/atoms';
// [MYA026]
export const chartConfigsState = selector({
  key: 'chartConfigsState',
  get: ({get}) => {
    const meterData = get(meterDataState);

    return {
      energyMeter: [
        {
          title: "Voltage",
          unit: meterData?.mappedData?.voltage?.unit || "V",
          fields: ["voltage.V1", "voltage.V2", "voltage.V3"],
          thresholds: {
            V1: { high: "voltage.VL1.V1H", low: "voltage.VL1.V1L" },
            V2: { high: "voltage.VL2.V2H", low: "voltage.VL2.V2L" },
            V3: { high: "voltage.VL3.V3H", low: "voltage.VL3.V3L" }
          },
          chartType: "line",
        },
        {
          title: "Current",
          unit: meterData?.mappedData?.current?.unit || "A",
          fields: ["current.I1", "current.I2", "current.I3"],
          thresholds: {
            I1: { high: "current.IR1.I1H", low: "current.IR1.I1L" },
            I2: { high: "current.IR2.I2H", low: "current.IR2.I2L" },
            I3: { high: "current.IR3.I3H", low: "current.IR3.I3L" }
          },
          chartType: "line",
        },
        {
          title: "Power",
          unit: meterData?.mappedData?.power?.KW?.unit || "kW",
          fields: ["power.KW.L1", "power.KW.L2", "power.KW.L3"],
          thresholds: {
            PW1: { high: "power.KW.PW1.L1H", low: "power.KW.PW1.L1L" },
            PW2: { high: "power.KW.PW2.L2H", low: "power.KW.PW2.L2L" },
            PW3: { high: "power.KW.PW3.L3H", low: "power.KW.PW3.L3L" }
          },
          chartType: "line",
        },
        {
          title: "Apparent_vs_Reactive_Power",
          unit: "kva/kvar",
          fields: ["power.KVA.L1", "power.KVA.L2", "power.KVA.L3", "power.Kvar.L1", "power.Kvar.L2", "power.Kvar.L3"],
          thresholds: {
            KVA1: { high: "power.KVA.KVA1.L1H", low: "power.KVA.KVA1.L1L" },
            KVA2: { high: "power.KVA.KVA2.L2H", low: "power.KVA.KVA2.L2L" },
            KVA3: { high: "power.KVA.KVA3.L3H", low: "power.KVA.KVA3.L3L" },
            Kvar1: { high: "power.Kvar.Kvar1.L1H", low: "power.Kvar.Kvar1.L1L" },
            Kvar2: { high: "power.Kvar.Kvar2.L2H", low: "power.Kvar.Kvar2.L2L" },
            Kvar3: { high: "power.Kvar.Kvar3.L3H", low: "power.Kvar.Kvar3.L3L" }
          },
          chartType: "line",
        },
        {
          title: "Total_Power",
          unit: meterData?.mappedData?.power?.KW?.unit || "kW",
          fields: ["power.Total.KW1"],
          thresholds: {},
          chartType: "line",
        },
        {
          title: "Frequency",
          unit: meterData?.mappedData?.network?.units?.Frequency || "Hz",
          fields: ["network.Frequency1"],
          thresholds: {
            Freq1: { high: "Frequency.FreqH", low: "Frequency.FreqL" }
          },
          chartType: "line",
        },
        {
          title: "Apparent_Power",
          unit: meterData?.mappedData?.power?.KVA?.unit || "kVA",
          fields: ["power.KVA.L1", "power.KVA.L2", "power.KVA.L3"],
          thresholds: {
            KVA: {
              high: ["power.KVA.KVA1.L1H", "power.KVA.KVA2.L2H", "power.KVA.KVA3.L3H"],
              low: ["power.KVA.KVA1.L1L", "power.KVA.KVA2.L2L", "power.KVA.KVA3.L3L"]
            }
          },
          chartType: "line",
        },
        {
          title: "Reactive_Power",
          unit: meterData?.mappedData?.power?.Kvar?.unit || "kvar",
          fields: ["power.Kvar.L1", "power.Kvar.L2", "power.Kvar.L3"],
          thresholds: {
            Kvar: {
              high: ["power.Kvar.Kvar1.L1H", "power.Kvar.Kvar2.L2H", "power.Kvar.Kvar3.L3H"],
              low: ["power.Kvar.Kvar1.L1L", "power.Kvar.Kvar2.L2L", "power.Kvar.Kvar3.L3L"]
            }
          },
          chartType: "line",
        },
      ],
    };
  }
});