import type { LucideIcon } from 'lucide-react';
import { SENSOR_ICONS, type SensorType, SENSOR_DISPLAY_NAMES } from '@/lib/constants';

export interface SensorReading {
  id: SensorType;
  name: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  lastUpdated: string;
}

export interface Device {
  id: string;
  name: string;
  uniqueId: string;
  isConnected: boolean;
  sensors: SensorReading[];
  config: {
    pumpDurations: { water: number; fertilizer: number }; // in seconds
    smsReceiver: string;
  };
}

const createSensorReadings = (): SensorReading[] => {
  const now = new Date();
  return (Object.keys(SENSOR_ICONS) as SensorType[]).map(sensorType => {
    let value: string | number;
    let unit: string;

    switch (sensorType) {
      case 'soil_moisture': value = Math.floor(Math.random() * 70) + 30; unit = '%'; break;
      case 'soil_temperature': value = (Math.random() * 15 + 15).toFixed(1); unit = '°C'; break;
      case 'air_temperature': value = (Math.random() * 15 + 18).toFixed(1); unit = '°C'; break;
      case 'air_humidity': value = Math.floor(Math.random() * 50) + 40; unit = '%'; break;
      case 'water_level': value = Math.floor(Math.random() * 80) + 20; unit = '%'; break;
      case 'fertilizer_level': value = Math.floor(Math.random() * 60) + 10; unit = '%'; break;
      default: value = 0; unit = '';
    }
    return {
      id: sensorType,
      name: SENSOR_DISPLAY_NAMES[sensorType],
      value,
      unit,
      icon: SENSOR_ICONS[sensorType],
      lastUpdated: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
    };
  });
};

export const mockDevices: Device[] = [
  {
    id: 'device-1',
    name: 'Living Room Ficus',
    uniqueId: 'YUCCA-ABC-123',
    isConnected: true,
    sensors: createSensorReadings(),
    config: {
      pumpDurations: { water: 10, fertilizer: 5 },
      smsReceiver: '+15551234567',
    },
  },
  {
    id: 'device-2',
    name: 'Office Orchid',
    uniqueId: 'YUCCA-DEF-456',
    isConnected: false,
    sensors: createSensorReadings(),
    config: {
      pumpDurations: { water: 5, fertilizer: 2 },
      smsReceiver: '+15557654321',
    },
  },
  {
    id: 'device-3',
    name: 'Kitchen Herbs',
    uniqueId: 'YUCCA-GHI-789',
    isConnected: true,
    sensors: createSensorReadings(),
    config: {
      pumpDurations: { water: 7, fertilizer: 3 },
      smsReceiver: '+15559876543',
    },
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
      case 'water_level': value = Math.floor(Math.random() * 50) + 50 - (i*1.5) ; break; // Simulates decreasing level
      case 'fertilizer_level': value = Math.floor(Math.random() * 30) + 40 - (i*0.5) ; break; // Simulates decreasing level
      default: value = 0;
    }
    history.push({
      date: date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }), // YYYY-MM-DD for consistency with charts
      value: Math.max(0, Math.min(100, value)), // Clamp between 0-100 for percentage based sensors
    });
  }
  return history;
};
