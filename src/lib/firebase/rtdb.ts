
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
    await update(dataRef, data);
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

  // The keys in deviceHistory are timestamps (Firebase server timestamps which are numbers)
  // We need to convert them back to ISO strings for consistency if needed, or use them as is.
  // The current `DeviceHistoryEntry` expects `timestamp` as an ISO string.
  // The sample data has `timestamp` also as an ISO string *within* the object, and uses numeric keys.
  // Let's assume the numeric keys are the primary timestamp.
  return Object.entries(historyObject)
    .map(([timestampKey, value]) => {
      // If value already contains a timestamp, use it. Otherwise, use the key.
      const entryTimestamp = value.timestamp || new Date(parseInt(timestampKey)).toISOString();
      return {
        ...value,
        timestamp: entryTimestamp,
      };
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort by date
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

export const updateDeviceName = (userId: string, deviceKey: string, name: string): Promise<void> =>
  updateUserData(userId, `devices/${deviceKey}`, { name });

// Placeholder for updating device-specific config like pump durations or SMS receiver
// This would be similar to updateUserSettings but target `devices/${deviceKey}/config`
export async function updateDeviceConfig(userId: string, deviceKey: string, config: Partial<FirebaseDevice['config']>) {
   if (!userId || !deviceKey) {
    throw new Error("User ID and Device Key are required.");
  }
  if (!rtdb) {
    throw new Error("Realtime Database is not initialized.");
  }
  // Filter out undefined values from config
  const validConfig: Partial<FirebaseDevice['config']> = {};
  if (config.pumpDurations) {
    validConfig.pumpDurations = config.pumpDurations;
  }
  if (config.smsReceiver !== undefined) { // Check for undefined, empty string is valid
    validConfig.smsReceiver = config.smsReceiver;
  }

  if (Object.keys(validConfig).length > 0) {
    return updateUserData(userId, `devices/${deviceKey}/config`, validConfig);
  }
  return Promise.resolve(); // No changes to update
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
    
    const defaultPumpDurations = { water: 10, fertilizer: 5 }; // Example defaults
    const defaultSmsReceiver = ""; // Example default

    const newDeviceData: Omit<FirebaseDevice, 'key' | 'isConnected'> = { // Key and isConnected are not stored directly in the object value
      id: uniqueIdFormat,
      name: deviceName,
      location: location || "Default Location",
      lastUpdated: now,
      readings: defaultReadings,
      useDefaultSettings: useDefaultSettings,
      config: useDefaultSettings ? {
        pumpDurations: defaultPumpDurations,
        smsReceiver: defaultSmsReceiver,
      } : {},
    };

    await set(newDeviceRef, newDeviceData);
    return deviceKey;

  } catch (error) {
    console.error("Error registering new device:", error);
    return null;
  }
}
