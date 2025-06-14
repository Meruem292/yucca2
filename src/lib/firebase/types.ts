
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
  fertilizerLevel: number; // Assumed to be depth in cm, or % if container height not set
  soilMoisture: number;
  soilTemperature: number;
  waterLevel: number; // Assumed to be depth in cm, or % if container height not set
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
  config?: {
    pumpDurations?: { water: number; fertilizer: number };
    containerHeights?: { water: number; fertilizer: number };
    alertThresholds?: { water: number; fertilizer: number };
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


// UI-specific types

// For SensorCard on device detail page
export type SensorCardReading = {
  id: keyof DeviceSensorReadings | 'fertilizerLevel' | 'waterLevel';
  name: string;
  value: string | number;
  unit: string;
  iconName: string;
  lastUpdated?: string;
};


// For charts
export interface SensorHistoryDataPoint {
  date: string;
  value: number;
}

export interface TemperatureHistoryDataPoint {
  date: string;
  soil_temperature: number | null;
  air_temperature: number | null;
}

// For RecentReadingsTable
export interface RecentReadingRow {
  id: string;
  time: string;
  soil_moisture: string | null;
  soil_temperature: string | null;
  air_temperature: string | null;
  air_humidity: string | null;
}

// For Dashboard Alerts
export interface DashboardAlert {
  id: string; // Unique key for the alert (e.g., deviceKey + alertType)
  deviceId: string;
  deviceName: string;
  type: 'low_water' | 'low_fertilizer' | 'pump_active_water' | 'pump_active_fertilizer';
  message: string;
  timestamp: string; // Typically device.lastUpdated
  severity: 'warning' | 'info'; // 'warning' for low levels, 'info' for pump activity
}

// General Device type used by components (combination of FirebaseDevice and other useful props)
export interface AppDevice extends FirebaseDevice {
  sensors: SensorCardReading[];
}
