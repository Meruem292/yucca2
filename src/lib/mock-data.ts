
// This file is largely deprecated as data will come from Firebase.
// Keeping interfaces that might still be used by UI components before full refactor,
// or for local type definitions not directly tied to Firebase structure.
import type { SensorIconNameType } from '@/lib/constants';

// This interface was used by SensorCard, ensure SensorCard is updated or this is aligned
// with FirebaseDevice.readings + SENSOR_DISPLAY_NAMES + SENSOR_ICON_NAMES
export interface SensorReading {
  id: string; // Corresponds to a key in DeviceSensorReadings or a special type like 'water_level_tank'
  name: string;
  value: string | number;
  unit: string;
  iconName: SensorIconNameType; 
  lastUpdated: string;
}

// This AppDevice was a composite type. Components should now use FirebaseDevice and derive sensors for SensorCard.
// export interface Device {
//   id: string; // This was the Firebase key in the mock data, now FirebaseDevice.key
//   name: string;
//   uniqueId: string; // This was the "Device-001" style ID, now FirebaseDevice.id
//   isConnected: boolean;
//   location: string;
//   sensors: SensorReading[]; // This needs to be constructed from FirebaseDevice.readings
//   config: {
//     pumpDurations: { water: number; fertilizer: number };
//     smsReceiver: string;
//   };
//   levels: { // These are now part of FirebaseDevice.readings
//     water: number;
//     fertilizer: number;
//   };
// }


// The following mock functions are now replaced by Firebase calls:
// export const mockDevices: Device[] = [];
// export const getMockDeviceById = (id: string): Device | undefined => undefined;
// export const getMockSensorHistory = (deviceId: string, sensorType: string): any[] => [];
// export const getMockTemperatureHistory = (deviceId: string): any[] => [];
// export const getMockRecentReadings = (deviceId: string, count: number = 6): any[] => [];

// If any specific small mock objects are needed for Storybook or isolated tests,
// they can be defined here, but they should not be used for page data.
