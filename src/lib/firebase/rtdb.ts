
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

  return Object.entries(historyObject)
    .map(([timestampKey, value]) => {
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
  if (config.smsReceiver !== undefined) { 
    validConfig.smsReceiver = config.smsReceiver;
  }
  if (config.autoWatering) {
     validConfig.autoWatering = {
        enabled: config.autoWatering.enabled !== undefined ? config.autoWatering.enabled : true, // Default to true if not specified during an update
        soilMoistureThreshold: config.autoWatering.soilMoistureThreshold !== undefined ? config.autoWatering.soilMoistureThreshold : 50 // Default threshold
     };
  }


  if (Object.keys(validConfig).length > 0) {
    // Construct the path to update only the config node
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
    
    const defaultConfig: FirebaseDevice['config'] = {
      pumpDurations: { water: 10, fertilizer: 5 },
      smsReceiver: "",
      autoWatering: {
        enabled: true,
        soilMoistureThreshold: 50, // Assuming threshold is a percentage 0-100
      }
    };

    const newDeviceData: Omit<FirebaseDevice, 'key' | 'isConnected'> = { 
      id: uniqueIdFormat,
      name: deviceName,
      location: location || "Default Location",
      lastUpdated: now,
      readings: defaultReadings,
      useDefaultSettings: useDefaultSettings,
      config: useDefaultSettings ? defaultConfig : {},
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
    const controlRef = ref(rtdb, `users/${userId}/devices/${deviceKey}/manualControl/${pumpPathKey}`);
    await set(controlRef, isActive);
  } catch (error) {
    console.error(`Error updating manual ${pumpType} pump state for device ${deviceKey}:`, error);
    throw error;
  }
}
