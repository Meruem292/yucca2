
import { db } from '@/lib/firebase/config';
import { ref, get, update, child, serverTimestamp, push, set } from 'firebase/database';
import type { 
  UserSettings, 
  UserStats, 
  FirebaseDevice, 
  DeviceHistoryEntry,
  DeviceSensorReadings
} from '@/lib/firebase/types';

// Generic fetch function
async function getUserData<T>(userId: string, dataPath: string): Promise<T | null> {
  if (!userId) {
    console.error(`getUserData: No userId provided for path ${dataPath}`);
    return null;
  }
  try {
    const dataRef = ref(db, `users/${userId}/${dataPath}`);
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

// Generic update function
async function updateUserData(userId: string, dataPath: string, data: object): Promise<void> {
   if (!userId) {
    console.error(`updateUserData: No userId provided for path ${dataPath}`);
    throw new Error("User ID is required for updating data.");
  }
  try {
    const dataRef = ref(db, `users/${userId}/${dataPath}`);
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
    // Infer isConnected: true for simplicity if it exists in DB.
    // A more robust solution would involve a 'lastSeen' timestamp or explicit 'isConnected' field.
    isConnected: true 
  }));
}

export async function getDeviceDetails(userId: string, deviceKey: string): Promise<FirebaseDevice | null> {
  const device = await getUserData<Omit<FirebaseDevice, 'key'>>(userId, `devices/${deviceKey}`);
  if (!device) return null;
  return { 
    ...device, 
    key: deviceKey,
    isConnected: true // Assuming connected if details are fetched
  };
}

export async function getDeviceHistory(userId: string, deviceKey: string): Promise<DeviceHistoryEntry[]> {
  const historyObject = await getUserData<Record<string, Omit<DeviceHistoryEntry, 'timestamp'>>>(userId, `deviceHistory/${deviceKey}`);
  if (!historyObject) return [];
  
  return Object.entries(historyObject)
    .map(([timestampKey, value]) => ({
      ...value,
      timestamp: new Date(parseInt(timestampKey)).toISOString(), // Convert numeric key back to ISO string
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort by date
}

// Specific Setters
export const updateUserSettings = (userId: string, settings: Partial<UserSettings>): Promise<void> => {
  // Filter out undefined values before updating
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

export async function registerNewDevice(userId: string, deviceName: string, uniqueIdFormat: string, location: string, useDefaultSettings: boolean): Promise<string | null> {
  if (!userId) {
    console.error("registerNewDevice: No userId provided.");
    return null;
  }
  try {
    const devicesRef = ref(db, `users/${userId}/devices`);
    const newDeviceRef = push(devicesRef); // Generate a new unique key
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

    const newDeviceData: FirebaseDevice = {
      id: uniqueIdFormat, // The YUCCA-XXX-YYY ID
      name: deviceName,
      location: location || "Default Location",
      lastUpdated: now,
      readings: defaultReadings,
      useDefaultSettings: useDefaultSettings,
      // `key` will be the Firebase push key, not stored inside the object itself but used as path
    };
    
    await set(newDeviceRef, newDeviceData);

    // Optionally, initialize deviceHistory and user settings if this is the first device
    // For now, we assume they might exist or are handled separately.

    return deviceKey;

  } catch (error) {
    console.error("Error registering new device:", error);
    return null;
  }
}
