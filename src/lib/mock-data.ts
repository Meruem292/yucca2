
import type { LucideIcon } from 'lucide-react';
import { SENSOR_ICON_NAMES, type SensorType, SENSOR_DISPLAY_NAMES, type SensorIconNameType } from '@/lib/constants';

export interface SensorReading {
  id: SensorType;
  name: string;
  value: string | number;
  unit: string;
  iconName: SensorIconNameType; // Changed from icon to iconName
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

const createSensorReadings = (): SensorReading[] => {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  return (Object.keys(SENSOR_ICON_NAMES) as SensorType[]).map(sensorType => {
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
      iconName: SENSOR_ICON_NAMES[sensorType], // Use the string name
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
  date: string;
  value: number;
}

export const getMockSensorHistory = (deviceId: string, sensorType: SensorType): SensorHistoryDataPoint[] => {
  const history: SensorHistoryDataPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    let value: number;
    switch (sensorType) {
      case 'soil_moisture': value = Math.floor(Math.random() * 60) + 20; break;
      case 'soil_temperature': value = parseFloat((Math.random() * 10 + 15).toFixed(1)); break;
      case 'air_temperature': value = parseFloat((Math.random() * 10 + 18).toFixed(1)); break;
      case 'air_humidity': value = Math.floor(Math.random() * 40) + 30; break;
      case 'water_level': value = Math.max(0, Math.floor(Math.random() * 50) + 50 - (i*1.5)) ; break;
      case 'fertilizer_level': value = Math.max(0, Math.floor(Math.random() * 30) + 40 - (i*0.5)) ; break;
      default: value = 0;
    }
    const clampedValue = sensorType.includes('level') || sensorType.includes('moisture') || sensorType.includes('humidity')
        ? Math.max(0, Math.min(100, value))
        : value;

    history.push({
      date: date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }),
      value: clampedValue,
    });
  }
  return history;
};
