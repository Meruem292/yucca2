
// Firebase Data Structures

// Path: /users/{userId}/settings
export interface UserSettings {
  alertLowFertilizer: boolean;
  alertLowWater: boolean;
  autoWateringInterval?: number; // As seen in an image, but not in provided JSON
  fertilizerPumpDuration: number;
  phoneNumber: string;
  waterPumpDuration: number;
}

// Path: /users/{userId}/stats
export interface UserStats {
  activePlants: number;
  activeSensors: number;
  fertilizerLevel: number;
  waterLevel: number;
}

// Path: /users/{userId}/devices/{deviceKey}/readings (also used in history)
export interface DeviceSensorReadings {
  airHumidity: number;
  airTemperature: number;
  fertilizerLevel: number;
  soilMoisture: number;
  soilTemperature: number;
  waterLevel: number;
}

// Path: /users/{userId}/devices/{deviceKey}
export interface FirebaseDevice {
  id: string; // User-defined ID like "Device-001"
  lastUpdated: string; // ISO string timestamp
  location: string;
  name: string;
  readings: DeviceSensorReadings;
  useDefaultSettings: boolean;
  key?: string; // Firebase key, added after fetching
  isConnected?: boolean; // To be inferred or added to DB schema
  // Configuration specific to this device (if any, not in provided top-level JSON)
  config?: {
    pumpDurations?: { water: number; fertilizer: number };
    smsReceiver?: string;
  };
  manualControl?: {
    waterPumpActive?: boolean;
    fertilizerPumpActive?: boolean;
  };
}

// Path: /users/{userId}/deviceHistory/{deviceKey}/{timestampKey}
export interface DeviceHistoryEntry extends DeviceSensorReadings {
  timestamp: string; // ISO string timestamp
}


// UI-specific types (might be similar to mock-data types but for Firebase data)

// For SensorCard on device detail page
export type SensorCardReading = {
  id: keyof DeviceSensorReadings | 'fertilizerLevel' | 'waterLevel'; // Making it more specific
  name: string;
  value: string | number;
  unit: string;
  iconName: string; // From SENSOR_ICON_NAMES
  lastUpdated?: string; // From device.lastUpdated
};


// For charts
export interface SensorHistoryDataPoint {
  date: string; // ISO string or formatted for chart
  value: number;
}

export interface TemperatureHistoryDataPoint {
  date: string; // ISO string or formatted for chart
  soil_temperature: number | null;
  air_temperature: number | null;
}

// For RecentReadingsTable
export interface RecentReadingRow {
  id: string; // timestamp or unique key
  time: string; // Formatted time string
  soil_moisture: string | null;
  soil_temperature: string | null;
  air_temperature: string | null;
  air_humidity: string | null;
}

// General Device type used by components (combination of FirebaseDevice and other useful props)
// This is similar to the old Device type from mock-data.ts, but adapted for Firebase.
export interface AppDevice extends FirebaseDevice {
  // isConnected is already optional in FirebaseDevice
  sensors: SensorCardReading[]; // For SensorCard components
  // levels for DeviceSummaryCard (water and fertilizer) are in device.readings
}
