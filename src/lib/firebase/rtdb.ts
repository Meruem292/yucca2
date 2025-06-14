
import { rtdb } from '@/lib/firebase/config'; // Import the Realtime Database instance
import { ref, get, update, serverTimestamp, push, set, child } from 'firebase/database'; // Ensure child is imported if used elsewhere, or remove if not
import type {
  UserSettings,
  UserStats,
  FirebaseDevice,
  DeviceHistoryEntry,
  DeviceSensorReadings
} from '@/lib/firebase/types';

// Generic fetch function for Realtime Database
async function getUserData<T>(userId: string, dataPath: string): Promise<T | null> {
  if (!userId) {
    console.error(`getUserData: No userId provided for path ${dataPath}`);
    return null;
  }
  if (!rtdb) {
    console.error("Realtime Database instance (rtdb) is not initialized. Check Firebase config.");
    return null;
  }
  try {
    const dataRef = ref(rtdb, `users/${userId}/${dataPath}`);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching data from users/${userId}/${dataPath}:`, error);
    return null;
  }
}

// Generic update function for Realtime Database
// dataPath is relative to /users/{userId}/
// data is an object where keys can be paths relative to dataPath, e.g. { 'config/someValue': true }
async function updateUserData(userId: string, dataPath: string, data: object): Promise<void> {
   if (!userId) {
    console.error(`updateUserData: No userId provided for path ${dataPath}`);
    throw new Error("User ID is required for updating data.");
  }
  if (!rtdb) {
    console.error("Realtime Database instance (rtdb) is not initialized. Check Firebase config.");
    throw new Error("Realtime Database is not initialized.");
  }
  try {
    const dataRef = ref(rtdb, `users/${userId}/${dataPath}`);
    await update(dataRef, data); // update can handle nested paths in the 'data' object
  } catch (error) {
    console.error(`Error updating data at users/${userId}/${dataPath}:`, error);
    throw error;
  }
}

// Specific Getters
export const getUserSettings = (userId: string): Promise<UserSettings | null> => getUserData<UserSettings>(userId, 'settings');
export const getUserStats = (userId: string): Promise<UserStats | null> => getUserData<UserStats>(userId, 'stats');

export async function getUserDevices(userId: string): Promise<FirebaseDevice[]> {
  const devicesObject = await getUserData<Record<string, Omit<FirebaseDevice, 'key'>>>(userId, 'devices');
  if (!devicesObject) return [];
  return Object.entries(devicesObject).map(([key, value]) => ({
    ...value,
    key,
    isConnected: value.isConnected !== undefined ? value.isConnected : true // Default to true if not present
  }));
}

export async function getDeviceDetails(userId: string, deviceKey: string): Promise<FirebaseDevice | null> {
  const device = await getUserData<Omit<FirebaseDevice, 'key'>>(userId, `devices/${deviceKey}`);
  if (!device) return null;
  return {
    ...device,
    key: deviceKey,
    isConnected: device.isConnected !== undefined ? device.isConnected : true // Default to true if not present
  };
}

export async function getDeviceHistory(userId: string, deviceKey: string): Promise<DeviceHistoryEntry[]> {
  const historyObject = await getUserData<Record<string, Omit<DeviceHistoryEntry, 'timestamp'>>>(userId, `deviceHistory/${deviceKey}`);
  if (!historyObject) return [];

  return Object.entries(historyObject)
    .map(([timestampKey, value]) => {
      const entryTimestamp = value.timestamp || new Date(parseInt(timestampKey)).toISOString();
      return {
        ...value,
        timestamp: entryTimestamp,
      };
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Specific Setters
export const updateUserSettings = (userId: string, settings: Partial<UserSettings>): Promise<void> => {
  const validSettings: Partial<UserSettings> = {};
  for (const key in settings) {
    if (settings[key as keyof UserSettings] !== undefined) {
      (validSettings as any)[key] = settings[key as keyof UserSettings];
    }
  }
  return updateUserData(userId, 'settings', validSettings);
}

// Updates top-level device properties like name
export const updateDeviceProperties = (userId: string, deviceKey: string, properties: Partial<Pick<FirebaseDevice, 'name'>>): Promise<void> => {
    return updateUserData(userId, `devices/${deviceKey}`, properties);
}

// Updates nested device configuration properties (e.g., pumpDurations, containerHeights, smsReceiver)
export async function updateDeviceConfig(userId: string, deviceKey: string, configPayload: Partial<FirebaseDevice['config']>) {
  if (!userId || !deviceKey) throw new Error("User ID and Device Key are required.");
  if (Object.keys(configPayload).length === 0) return Promise.resolve(); // No changes to update

  const updatesForFirebase: Record<string, any> = {};
  for (const key in configPayload) {
    if (Object.prototype.hasOwnProperty.call(configPayload, key)) {
      // Create paths like 'config/pumpDurations', 'config/smsReceiver', etc.
      updatesForFirebase[`config/${key}`] = (configPayload as any)[key];
    }
  }
  // updateUserData will update relative to users/${userId}/devices/${deviceKey}
  // For example, if updatesForFirebase is { 'config/smsReceiver': 'newNumber' },
  // it will update users/{userId}/devices/{deviceKey}/config/smsReceiver
  return updateUserData(userId, `devices/${deviceKey}`, updatesForFirebase);
}


export async function registerNewDevice(userId: string, deviceName: string, uniqueIdFormat: string, location: string, useDefaultSettings: boolean): Promise<string | null> {
  if (!userId) {
    console.error("registerNewDevice: No userId provided.");
    return null;
  }
  if (!rtdb) {
    console.error("Realtime Database instance (rtdb) is not initialized for registerNewDevice.");
    return null;
  }
  try {
    const devicesRef = ref(rtdb, `users/${userId}/devices`);
    const newDeviceRef = push(devicesRef);
    const deviceKey = newDeviceRef.key;

    if (!deviceKey) {
      throw new Error("Failed to generate device key.");
    }

    const now = new Date().toISOString();
    const defaultReadings: DeviceSensorReadings = {
      airHumidity: 50,
      airTemperature: 22,
      fertilizerLevel: 50,
      soilMoisture: 50,
      soilTemperature: 20,
      waterLevel: 50,
    };
    
    const defaultConfigContents: FirebaseDevice['config'] = {
      pumpDurations: { water: 10, fertilizer: 5 },
      containerHeights: { water: 30, fertilizer: 20 },
      alertThresholds: { water: 20, fertilizer: 20 },
      smsReceiver: "", // Initialize smsReceiver within config
    };

    const nonDefaultConfigContents: FirebaseDevice['config'] = {
      pumpDurations: { water: 10, fertilizer: 5 }, // Or other non-defaults as needed
      containerHeights: { water: 0, fertilizer: 0 },
      alertThresholds: { water: 20, fertilizer: 20 },
      smsReceiver: "", // Initialize smsReceiver within config
    };

    const newDeviceData: Omit<FirebaseDevice, 'key' | 'isConnected'> = { 
      id: uniqueIdFormat,
      name: deviceName,
      location: location || "Default Location",
      lastUpdated: now,
      readings: defaultReadings,
      useDefaultSettings: useDefaultSettings,
      config: useDefaultSettings ? defaultConfigContents : nonDefaultConfigContents,
      manualControl: { 
        waterPumpActive: false,
        fertilizerPumpActive: false,
      }
    };

    await set(newDeviceRef, newDeviceData);
    return deviceKey;

  } catch (error) {
    console.error("Error registering new device:", error);
    return null;
  }
}

export async function updateDeviceManualPumpState(
  userId: string,
  deviceKey: string,
  pumpType: 'water' | 'fertilizer',
  isActive: boolean
): Promise<void> {
  if (!userId || !deviceKey) {
    throw new Error("User ID and Device Key are required for updating pump state.");
  }
  if (!rtdb) {
    throw new Error("Realtime Database is not initialized.");
  }
  try {
    const pumpPathKey = pumpType === 'water' ? 'waterPumpActive' : 'fertilizerPumpActive';
    // Update directly using ref and set for a single value, or use update for multiple paths
    const controlRef = ref(rtdb, `users/${userId}/devices/${deviceKey}/manualControl/${pumpPathKey}`);
    await set(controlRef, isActive);
  } catch (error) {
    console.error(`Error updating manual ${pumpType} pump state for device ${deviceKey}:`, error);
    throw error;
  }
}
