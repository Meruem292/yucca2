
import type { LucideIcon } from 'lucide-react';
import { SENSOR_ICON_NAMES, type SensorType, SENSOR_DISPLAY_NAMES, type SensorIconNameType } from '@/lib/constants';

export interface SensorReading {
  id: SensorType;
  name: string;
  value: string | number;
  unit: string;
  iconName: SensorIconNameType;
  lastUpdated: string;
}

export interface Device {
  id: string;
  name: string;
  uniqueId: string;
  isConnected: boolean;
  location: string;
  sensors: SensorReading[];
  config: {
    pumpDurations: { water: number; fertilizer: number };
    smsReceiver: string;
  };
  levels: {
    water: number;
    fertilizer: number;
  };
}

const pad = (num: number) => num.toString().padStart(2, '0');

const createSensorReadings = (): SensorReading[] => {
  const now = new Date();
  const sensorTypesToCreate: SensorType[] = ['soil_moisture', 'soil_temperature', 'air_temperature', 'air_humidity', 'water_level', 'fertilizer_level'];

  return sensorTypesToCreate.map(sensorType => {
    let value: string | number;
    let unit: string;

    switch (sensorType) {
      case 'soil_moisture': value = Math.floor(Math.random() * 60) + 20; unit = '%'; break;
      case 'soil_temperature': value = (Math.random() * 10 + 15).toFixed(1); unit = '°C'; break;
      case 'air_temperature': value = (Math.random() * 10 + 18).toFixed(1); unit = '°C'; break;
      case 'air_humidity': value = Math.floor(Math.random() * 40) + 30; unit = '%'; break;
      case 'water_level': value = Math.floor(Math.random() * 70) + 30; unit = '%'; break;
      case 'fertilizer_level': value = Math.floor(Math.random() * 70) + 30; unit = '%'; break;
      default: value = 0; unit = '';
    }
    return {
      id: sensorType,
      name: SENSOR_DISPLAY_NAMES[sensorType],
      value,
      unit,
      iconName: SENSOR_ICON_NAMES[sensorType],
      lastUpdated: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    };
  });
};

export const mockDevices: Device[] = [
  {
    id: 'device-1',
    name: 'Living Room Ficus',
    uniqueId: 'YUCCA-ABC-123',
    isConnected: true,
    location: 'Living Room',
    sensors: createSensorReadings(),
    config: {
      pumpDurations: { water: 10, fertilizer: 5 },
      smsReceiver: '+15551234567',
    },
    levels: {
      water: Math.floor(Math.random() * 70) + 30,
      fertilizer: Math.floor(Math.random() * 60) + 20,
    }
  },
  {
    id: 'device-2',
    name: 'Office Orchid',
    uniqueId: 'YUCCA-DEF-456',
    isConnected: false,
    location: 'Office Desk',
    sensors: createSensorReadings(),
    config: {
      pumpDurations: { water: 5, fertilizer: 2 },
      smsReceiver: '+15557654321',
    },
    levels: {
      water: Math.floor(Math.random() * 50) + 10,
      fertilizer: Math.floor(Math.random() * 50) + 40,
    }
  },
  {
    id: 'device-3',
    name: 'Kitchen Herbs',
    uniqueId: 'YUCCA-GHI-789',
    isConnected: true,
    location: 'Balcony',
    sensors: createSensorReadings(),
    config: {
      pumpDurations: { water: 7, fertilizer: 3 },
      smsReceiver: '+15559876543',
    },
    levels: {
      water: Math.floor(Math.random() * 40) + 60,
      fertilizer: Math.floor(Math.random() * 30) + 30,
    }
  },
];

export const getMockDeviceById = (id: string): Device | undefined => {
  return mockDevices.find(device => device.id === id);
};

export interface SensorHistoryDataPoint {
  date: string; // Should be in a format Recharts can parse, e.g., "YYYY-MM-DD" or a Date object
  value: number;
}

export interface TemperatureHistoryDataPoint {
  date: string;
  soil_temperature: number | null;
  air_temperature: number | null;
}

export const getMockSensorHistory = (deviceId: string, sensorType: SensorType): SensorHistoryDataPoint[] => {
  const history: SensorHistoryDataPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Simulate time throughout the day for more granular X-axis
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    let value: number;
    switch (sensorType) {
      case 'soil_moisture': value = Math.floor(Math.random() * 50) + 25; break; // Range 25-75%
      case 'soil_temperature': value = parseFloat((Math.random() * 15 + 10).toFixed(1)); break; // Range 10-25°C
      case 'air_temperature': value = parseFloat((Math.random() * 15 + 15).toFixed(1)); break; // Range 15-30°C
      case 'air_humidity': value = Math.floor(Math.random() * 40) + 30; break; // Range 30-70%
      case 'water_level': value = Math.max(0, Math.floor(Math.random() * 50) + 50 - (i * 1.5)); break;
      case 'fertilizer_level': value = Math.max(0, Math.floor(Math.random() * 30) + 40 - (i * 0.5)); break;
      default: value = 0;
    }
     const clampedValue = (sensorType.includes('level') || sensorType === 'soil_moisture' || sensorType === 'air_humidity')
        ? Math.max(0, Math.min(100, value))
        : value;

    history.push({
      date: date.toISOString(), // ISO string for easier parsing by Recharts & date-fns
      value: clampedValue,
    });
  }
  // Sort by date ascending
  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return history;
};


export const getMockTemperatureHistory = (deviceId: string): TemperatureHistoryDataPoint[] => {
  const history: TemperatureHistoryDataPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Simulate 3 data points per day for more detail
    for (let j = 0; j < 3; j++) {
        const pointDate = new Date(date);
        pointDate.setHours(8 * j, Math.floor(Math.random() * 60)); // e.g. 00:xx, 08:xx, 16:xx

        const soil_temperature = parseFloat((Math.random() * (28 - 6) + 6).toFixed(1)); // Range for image
        const air_temperature = parseFloat((Math.random() * (26 - 10) + 10).toFixed(1)); // Range for image
         history.push({
          date: pointDate.toISOString(),
          soil_temperature,
          air_temperature,
        });
    }
  }
  // Sort by date ascending
  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return history;
};


export interface RecentReadingRow {
  id: string; // timestamp or unique key
  time: string; // Formatted time string
  soil_moisture: string | null;
  soil_temperature: string | null;
  air_temperature: string | null;
  air_humidity: string | null;
}

export const getMockRecentReadings = (deviceId: string, count: number = 6): RecentReadingRow[] => {
  const readings: RecentReadingRow[] = [];
  const device = getMockDeviceById(deviceId);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const pastDate = new Date(now);
    pastDate.setMinutes(now.getMinutes() - i * (Math.floor(Math.random() * 30) + 15)); // Readings from past few hours
    
    // Simulate slight variations from current sensor readings if device is connected
    const getSimulatedValue = (sensorId: SensorType): string | null => {
        if (device) {
            const baseSensor = device.sensors.find(s => s.id === sensorId);
            if (baseSensor) {
                let baseValue = parseFloat(baseSensor.value.toString());
                if (isNaN(baseValue)) return `${baseSensor.value}${baseSensor.unit}`;

                let variation = (Math.random() - 0.5) * (baseValue * 0.1); // +/- 5% variation
                 if (sensorId === 'soil_moisture' || sensorId === 'air_humidity') {
                    variation = (Math.random() - 0.5) * 10; // +/- 5% absolute for percentages
                } else if (sensorId === 'soil_temperature' || sensorId === 'air_temperature') {
                    variation = (Math.random() - 0.5) * 2; // +/- 1°C for temperatures
                }

                let newValue = baseValue + variation;
                
                if (sensorId === 'soil_moisture' || sensorId === 'air_humidity') {
                    newValue = Math.max(0, Math.min(100, newValue));
                    return `${Math.round(newValue)}%`;
                }
                return `${newValue.toFixed(1)}${baseSensor.unit}`;
            }
        }
        // Fallback random if no base sensor
        switch(sensorId) {
            case 'soil_moisture': return `${Math.floor(Math.random() * 60) + 20}%`;
            case 'soil_temperature': return `${(Math.random() * 15 + 10).toFixed(1)}°C`;
            case 'air_temperature': return `${(Math.random() * 15 + 15).toFixed(1)}°C`;
            case 'air_humidity': return `${Math.floor(Math.random() * 40) + 30}%`;
            default: return null;
        }
    };

    readings.push({
      id: pastDate.toISOString(),
      time: pastDate.toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ''), // e.g. May 15 08:04 AM
      soil_moisture: getSimulatedValue('soil_moisture'),
      soil_temperature: getSimulatedValue('soil_temperature'),
      air_temperature: getSimulatedValue('air_temperature'),
      air_humidity: getSimulatedValue('air_humidity'),
    });
  }
  return readings;
};
