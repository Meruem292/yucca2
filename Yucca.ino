#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HardwareSerial.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "time.h"

// WiFi Configuration
const char* ssid = "God bless ";         // Your WiFi SSID
const char* password = "angpangetmo"; // Your WiFi Password

// Firebase Configuration
const String firebaseURL = "https://yucca-1430d-default-rtdb.firebaseio.com/"; // Your Firebase project URL

// Device Configuration
const String DEVICE_ID = "YUCCA-ABC-123"; // The unique ID for this device

// Device Owner Info (found automatically from Firebase)
String deviceOwnerUserID = "";
String deviceContainerKey = "";

// Device Status
bool deviceRegistered = false;

// Hardware Pins
#define DHTPIN 4
#define DHTTYPE DHT11
#define DS18B20_PIN 18
#define SOIL_MOISTURE_PIN 34
#define TRIG_WATER 5
#define ECHO_WATER 19
#define TRIG_FERT 17
#define ECHO_FERT 16
#define RELAY_WATER 23
#define RELAY_FERT 25
#define SIM800_RX 27
#define SIM800_TX 26
#define ADC_MAX_VALUE 4095 // Maximum analog read value for ESP32 ADC

// Hardware and Library Initializations
LiquidCrystal_I2C lcd(0x27, 20, 4); // I2C LCD with address 0x27, 20 columns, 4 rows
DHT dht(DHTPIN, DHTTYPE); // DHT sensor
OneWire oneWire(DS18B20_PIN); // OneWire bus for DS18B20
DallasTemperature ds18b20(&oneWire); // DS18B20 temperature sensor
HardwareSerial sim800(1); // SIM800L module connected to Serial1

// Timing variables
unsigned long lastAutoSMSSend = 0;
unsigned long lastFirebaseUpdate = 0;
unsigned long lastFindDeviceTime = 0;
unsigned long lastSensorReadTime = 0;
unsigned long lastManualCheckTime = 0; // New: For manual control polling
unsigned long waterPumpStartTime = 0;
unsigned long fertilizerPumpStartTime = 0;
bool waterPumpActiveState = false;
bool fertilizerPumpActiveState = false;

const unsigned long autoSMSInterval = 60000;      // 1 minute
const unsigned long firebaseUpdateInterval = 30000;    // 30 seconds
const unsigned long findDeviceInterval = 60000;        // 1 minute (if not found)
const unsigned long sensorReadInterval = 2000; // New: Read sensors every 2 seconds for responsiveness
const unsigned long manualCheckInterval = 1000; // New: Check manual controls every 1 second

// Sensor State
bool waterLow = false;
bool fertLow = false;
String deviceSmsReceiver = "";

// Last valid readings for ultrasonic sensors
int lastValidWaterDistance = 0; // Initialize with a default value
int lastValidFertDistance = 0;  // Initialize with a default value

// NTP Time Configuration
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 8 * 3600;
const int   daylightOffset_sec = 0;

// Struct to hold all device settings, loaded from Firebase
struct DeviceSettings {
    bool alertLowWater = true;
    bool alertLowFertilizer = true;
    int autoWateringInterval = 24;
    int waterPumpDuration = 10; // Default to 10 seconds
    int fertilizerPumpDuration = 5; // Default to 5 seconds
    bool manualWaterPumpActive = false;
    bool manualFertPumpActive = false;
    int waterContainerHeight = 20;
    int fertilizerContainerHeight = 20;
    int waterAlertThreshold = 5;
    int fertilizerAlertThreshold = 5;
};
DeviceSettings currentSettings;


// --- Function Prototypes ---
void connectToWiFi();
void findDeviceInDatabase();
void loadSettings();
void loadDeviceConfig();
void checkManualControls();
void checkFirebaseUpdate();
String getCurrentTimestamp();
void readAndDisplayData();
int readDistance(int trigPin, int echoPin, int& lastValidReading);
void activateWaterPump();
void deactivateWaterPump();
void activateFertilizerPump();
void deactivateFertilizerPump();
void sendSMSReport();
void checkAutoSMS();
void sortArray(int arr[], int n);

void setup() {
    Serial.begin(115200);
    dht.begin();
    ds18b20.begin();
    sim800.begin(9600, SERIAL_8N1, SIM800_RX, SIM800_TX);

    pinMode(SOIL_MOISTURE_PIN, INPUT);
    pinMode(TRIG_WATER, OUTPUT);
    pinMode(ECHO_WATER, INPUT);
    pinMode(TRIG_FERT, OUTPUT);
    pinMode(ECHO_FERT, INPUT);
    pinMode(RELAY_WATER, OUTPUT);
    pinMode(RELAY_FERT, OUTPUT);
    digitalWrite(RELAY_WATER, HIGH); // Relays are off when HIGH
    digitalWrite(RELAY_FERT, HIGH);

    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Plant System Booting");
    delay(1000);
    lcd.clear();

    connectToWiFi();
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    Serial.println("NTP time configured.");

    // Initial attempt to find the device
    findDeviceInDatabase();
    
    Serial.println("System initialized. Waiting for device registration...");
    Serial.println("Commands: send, water, fertilizer");
}

void loop() {
    unsigned long currentTime = millis();

    // If device is not registered, keep trying to find it periodically.
    if (!deviceRegistered) {
        if (currentTime - lastFindDeviceTime >= findDeviceInterval) {
            lastFindDeviceTime = currentTime;
            findDeviceInDatabase();
        }
        delay(100); // Small delay to prevent spamming while unregistered
        return; // Halt further operations until registered
    }

    // --- Main Operational Loop (runs only if device is registered) ---

    // Read and display sensors more frequently
    if (currentTime - lastSensorReadTime >= sensorReadInterval) {
        lastSensorReadTime = currentTime;
        readAndDisplayData();
    }

    // Check for manual controls more frequently
    if (currentTime - lastManualCheckTime >= manualCheckInterval) {
        lastManualCheckTime = currentTime;
        checkManualControls();
    }
    
    // Check and update Firebase periodically
    if (currentTime - lastFirebaseUpdate >= firebaseUpdateInterval) {
        lastFirebaseUpdate = currentTime;
        checkFirebaseUpdate();
    }

    // Check for automatic SMS alerts
    checkAutoSMS();

    // Handle active pump durations without blocking
    // Ensure the multiplication is done with unsigned long to prevent overflow
    if (waterPumpActiveState && (currentTime - waterPumpStartTime >= (unsigned long)currentSettings.waterPumpDuration * 1000UL)) { // Added UL suffix
        deactivateWaterPump();
    }
    if (fertilizerPumpActiveState && (currentTime - fertilizerPumpStartTime >= (unsigned long)currentSettings.fertilizerPumpDuration * 1000UL)) { // Added UL suffix
        deactivateFertilizerPump();
    }
    
    // Check for manual commands from Serial Monitor - this is inherently blocking for input, but fine here
    if (Serial.available()) {
        String input = Serial.readStringUntil('\n');
        input.trim();
        if (input == "send") {
            sendSMSReport();
        } else if (input == "water") {
            activateWaterPump();
        } else if (input == "fertilizer") {
            activateFertilizerPump();
        } else {
            Serial.println("Commands: send, water, fertilizer");
        }
    }

    // A very small delay to prevent watchdog timer resets if the loop runs too fast without operations.
    // It's crucial to keep this minimal or remove if all operations become truly non-blocking.
    delay(10); 
}


void connectToWiFi() {
    Serial.print("Connecting to WiFi");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Connecting WiFi...");

    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        lcd.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("WiFi Connected");
        lcd.setCursor(0, 1);
        lcd.print(WiFi.localIP());
        delay(2000);
    } else {
        Serial.println("\nWiFi connection failed!");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("WiFi Failed!");
        delay(2000);
    }
}


void findDeviceInDatabase() {
    if (WiFi.status() != WL_CONNECTED) {
        connectToWiFi();
        if (WiFi.status() != WL_CONNECTED) return;
    }

    Serial.println("\n--- Searching for device in database ---");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Finding Device");
    lcd.setCursor(0, 1);
    lcd.print(DEVICE_ID);

    HTTPClient http;
    String usersUrl = firebaseURL + "/users.json?shallow=true"; // Get only user IDs

    http.begin(usersUrl);
    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        DynamicJsonDocument usersDoc(1024); // Smaller doc for just user keys
        DeserializationError error = deserializeJson(usersDoc, payload);

        if (!error) {
            JsonObject users = usersDoc.as<JsonObject>();
            Serial.print("Fetched user IDs: ");
            serializeJson(usersDoc, Serial); // Print the shallow user IDs payload
            Serial.println();

            for (JsonPair user : users) {
                String userId = user.key().c_str();
                Serial.print("Checking user ID: "); Serial.println(userId);

                // Query for devices under this specific user, ordered by 'id' field
                String deviceQueryUrl = firebaseURL + "users/" + userId + "/devices.json?orderBy=\"id\"&equalTo=\"" + DEVICE_ID + "\"";
                Serial.print("Querying for device: "); Serial.println(deviceQueryUrl);

                http.end(); // End the previous HTTP request before starting a new one
                http.begin(deviceQueryUrl);
                int deviceHttpCode = http.GET();

                if (deviceHttpCode == HTTP_CODE_OK) {
                    String devicePayload = http.getString();
                    Serial.print("Response for user "); Serial.print(userId); Serial.print(" devices: ");
                    Serial.println(devicePayload); // Print the raw JSON response for devices

                    DynamicJsonDocument deviceResultDoc(1024); // Smaller doc for device data
                    DeserializationError deviceError = deserializeJson(deviceResultDoc, devicePayload);

                    if (!deviceError && !deviceResultDoc.isNull() && deviceResultDoc.as<JsonObject>().size() > 0) {
                        // Iterate through the results. If a match is found, Firebase returns an object
                        // where the key is the container key and the value is the device data.
                        for (JsonPair deviceEntry : deviceResultDoc.as<JsonObject>()) {
                             String containerKey = deviceEntry.key().c_str();
                             // The ID is now a direct child of deviceEntry.value()
                             if (deviceEntry.value().containsKey("id")) {
                                 String foundDeviceId = deviceEntry.value()["id"].as<String>();
                                 Serial.print("Found device with ID '"); Serial.print(foundDeviceId);
                                 Serial.print("' for container key '"); Serial.print(containerKey);
                                 Serial.println("'");
                                 Serial.print("Comparing to target DEVICE_ID: '"); Serial.print(DEVICE_ID); Serial.println("'");

                                 if (foundDeviceId == DEVICE_ID) {
                                     // --- Device Found! ---
                                     deviceOwnerUserID = userId;
                                     deviceContainerKey = containerKey;
                                     deviceRegistered = true;

                                     Serial.println(">>> Device successfully found in database! <<<");
                                     Serial.println("Owner User ID: " + deviceOwnerUserID);
                                     Serial.println("Device Container Key: " + deviceContainerKey);

                                     lcd.clear();
                                     lcd.setCursor(0, 0);
                                     lcd.print("Device Found!");
                                     lcd.setCursor(0, 1);
                                     lcd.print("Getting Config...");
                                     delay(1000);

                                     loadSettings();
                                     loadDeviceConfig();

                                     http.end();
                                     return; // Exit after finding the device
                                 }
                             } else {
                                 Serial.print("Device entry for container key '"); Serial.print(containerKey);
                                 Serial.println("' does not contain an 'id' field.");
                             }
                        }
                    } else if (deviceError) {
                        Serial.print("JSON parsing error for device query response for user ");
                        Serial.print(userId); Serial.print(": "); Serial.println(deviceError.c_str());
                    } else {
                        Serial.println("No matching device found for user " + userId + " (or empty response).");
                    }
                } else {
                    Serial.print("HTTP error querying devices for user "); Serial.print(userId);
                    Serial.print(": "); Serial.println(deviceHttpCode);
                    Serial.print("Error Payload: "); Serial.println(http.getString());
                }
            }
            Serial.println("--- Device not found in any user's account. Will retry. ---");
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Device Not Found");
            lcd.setCursor(0, 1);
            lcd.print("Will retry...");
        } else {
            Serial.print("JSON parsing error for initial user keys (shallow=true) request: ");
            Serial.println(error.c_str());
            Serial.print("Raw payload: "); Serial.println(payload);
        }
    } else {
        Serial.print("HTTP error fetching user keys: ");
        Serial.println(httpCode);
        Serial.print("Error Payload: "); Serial.println(http.getString());
    }
    http.end(); // Ensure the last HTTP connection is closed
}

// --- UPDATED: Path construction uses new variables ---
void loadSettings() {
    if (!deviceRegistered) return;

    HTTPClient http;
    String url = firebaseURL + "users/" + deviceOwnerUserID + "/settings.json";
    http.begin(url);
    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        DynamicJsonDocument doc(512);
        deserializeJson(doc, response);

        currentSettings.alertLowWater = doc["alertLowWater"] | true;
        currentSettings.alertLowFertilizer = doc["alertLowFertilizer"] | true;
        currentSettings.autoWateringInterval = doc["autoWateringInterval"] | 24;
        // Ensure these defaults are sensible if Firebase doesn't provide them
        currentSettings.waterPumpDuration = doc["waterPumpDuration"] | 10;
        currentSettings.fertilizerPumpDuration = doc["fertilizerPumpDuration"] | 5;
        
        Serial.println("\n--- User-level settings loaded ---");
        Serial.print("alertLowWater: "); Serial.println(currentSettings.alertLowWater ? "true" : "false");
        Serial.print("alertLowFertilizer: "); Serial.println(currentSettings.alertLowFertilizer ? "true" : "false");
        Serial.print("autoWateringInterval: "); Serial.println(currentSettings.autoWateringInterval);
        Serial.print("waterPumpDuration: "); Serial.println(currentSettings.waterPumpDuration);
        Serial.print("fertilizerPumpDuration: "); Serial.println(currentSettings.fertilizerPumpDuration);
        Serial.println("----------------------------------");
    } else {
        Serial.println("Failed to get user-level settings from Firebase. Using defaults.");
    }
    http.end();
}


// --- UPDATED: Path construction uses new variables ---
void loadDeviceConfig() {
    if (!deviceRegistered) return;

    HTTPClient http;
    String url = firebaseURL + "users/" + deviceOwnerUserID + "/devices/" + deviceContainerKey + "/config.json";
    http.begin(url);
    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        DynamicJsonDocument doc(512);
        deserializeJson(doc, response);

        // Prioritize device-specific settings if they exist
        currentSettings.waterPumpDuration = doc["pumpDurations"]["water"] | currentSettings.waterPumpDuration;
        currentSettings.fertilizerPumpDuration = doc["pumpDurations"]["fertilizer"] | currentSettings.fertilizerPumpDuration;
        currentSettings.waterContainerHeight = doc["containerHeights"]["water"] | currentSettings.waterContainerHeight;
        currentSettings.fertilizerContainerHeight = doc["containerHeights"]["fertilizer"] | currentSettings.fertilizerContainerHeight;
        currentSettings.waterAlertThreshold = doc["alertThresholds"]["water"] | currentSettings.waterAlertThreshold;
        currentSettings.fertilizerAlertThreshold = doc["alertThresholds"]["fertilizer"] | currentSettings.fertilizerAlertThreshold;
        deviceSmsReceiver = doc["smsReceiver"].as<String>();

        Serial.println("\n--- Device-specific config loaded ---");
        Serial.print("waterPumpDuration (device-specific): "); Serial.println(currentSettings.waterPumpDuration);
        Serial.print("fertilizerPumpDuration (device-specific): "); Serial.println(currentSettings.fertilizerPumpDuration);
        Serial.print("waterContainerHeight: "); Serial.println(currentSettings.waterContainerHeight);
        Serial.print("fertilizerContainerHeight: "); Serial.println(currentSettings.fertilizerContainerHeight);
        Serial.print("waterAlertThreshold: "); Serial.println(currentSettings.waterAlertThreshold);
        Serial.print("fertilizerAlertThreshold: "); Serial.println(currentSettings.fertilizerAlertThreshold);
        Serial.print("Device SMS Receiver: "); Serial.println(deviceSmsReceiver);
        Serial.println("-------------------------------------");
    } else {
        Serial.println("Failed to get device config from Firebase. Using loaded user-level settings/defaults.");
    }
    http.end();
}


// --- UPDATED: Path construction uses new variables ---
void checkManualControls() {
    if (!deviceRegistered) return;

    HTTPClient http;
    String url = firebaseURL + "users/" + deviceOwnerUserID + "/devices/" + deviceContainerKey + "/manualControl.json";
    http.begin(url);
    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        DynamicJsonDocument doc(256);
        deserializeJson(doc, response);

        bool waterActive = doc["waterPumpActive"] | false;
        bool fertActive = doc["fertilizerPumpActive"] | false;

        if (waterActive && !waterPumpActiveState) { // Only activate if not already active
            Serial.println("Manual water pump activation received.");
            activateWaterPump();
            // Reset the flag in Firebase immediately after activating
            http.end(); // End the GET request
            String path = "users/" + deviceOwnerUserID + "/devices/" + deviceContainerKey + "/manualControl/waterPumpActive.json";
            http.begin(firebaseURL + path);
            http.addHeader("Content-Type", "application/json");
            http.PUT("false"); // Set to false after triggering
        }
        if (fertActive && !fertilizerPumpActiveState) { // Only activate if not already active
            Serial.println("Manual fertilizer pump activation received.");
            activateFertilizerPump();
            // Reset the flag in Firebase immediately after activating
            http.end(); // End previous request
            String path = "users/" + deviceOwnerUserID + "/devices/" + deviceContainerKey + "/manualControl/fertilizerPumpActive.json";
            http.begin(firebaseURL + path);
            http.addHeader("Content-Type", "application/json");
            http.PUT("false"); // Set to false after triggering
        }
    }
    http.end();
}

// --- UPDATED: Path construction and history logging logic corrected ---
void checkFirebaseUpdate() {
    if (!deviceRegistered || WiFi.status() != WL_CONNECTED) return;

    float airTemp = dht.readTemperature();
    float airHum = dht.readHumidity();
    ds18b20.requestTemperatures();
    float soilTemp = ds18b20.getTempCByIndex(0);
    int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
    int soilMoisturePercentage = map(soilMoistureRaw, 0, ADC_MAX_VALUE, 100, 0);
    int waterDistance = readDistance(TRIG_WATER, ECHO_WATER, lastValidWaterDistance);
    int fertDistance = readDistance(TRIG_FERT, ECHO_FERT, lastValidFertDistance);
    int waterLevel = (waterDistance != 999) ? max(0, currentSettings.waterContainerHeight - waterDistance) : max(0, currentSettings.waterContainerHeight - lastValidWaterDistance);
    int fertilizerLevel = (fertDistance != 999) ? max(0, currentSettings.fertilizerContainerHeight - fertDistance) : max(0, currentSettings.fertilizerContainerHeight - lastValidFertDistance);
    String timestamp = getCurrentTimestamp();

    // 1. Update current readings
    DynamicJsonDocument readingsDoc(256);
    readingsDoc["airTemperature"] = airTemp;
    readingsDoc["airHumidity"] = airHum;
    readingsDoc["soilTemperature"] = soilTemp;
    readingsDoc["soilMoisture"] = soilMoisturePercentage;
    readingsDoc["waterLevel"] = waterLevel;
    readingsDoc["fertilizerLevel"] = fertilizerLevel;
    String readingsPayload;
    serializeJson(readingsDoc, readingsPayload);

    HTTPClient http;
    String readingsUrl = firebaseURL + "users/" + deviceOwnerUserID + "/devices/" + deviceContainerKey + "/readings.json";
    http.begin(readingsUrl);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.PUT(readingsPayload);
    if (httpCode == HTTP_CODE_OK) {
        Serial.println("Current readings updated in Firebase.");
    } else {
        Serial.print("Error updating current readings: ");
        Serial.println(httpCode);
        Serial.println(http.getString()); // Print error response
    }
    http.end();

    // 2. Update lastUpdated timestamp
    String timestampUrl = firebaseURL + "users/" + deviceOwnerUserID + "/devices/" + deviceContainerKey + "/lastUpdated.json";
    http.begin(timestampUrl);
    http.addHeader("Content-Type", "application/json");
    httpCode = http.PUT("\"" + timestamp + "\"");
    if (httpCode == HTTP_CODE_OK) {
        Serial.println("Last updated timestamp updated in Firebase.");
    } else {
        Serial.print("Error updating last updated timestamp: ");
        Serial.println(httpCode);
        Serial.println(http.getString()); // Print error response
    }
    http.end();

    // 3. Add to device history using millis() as the key
    String historyUrl = firebaseURL + "users/" + deviceOwnerUserID + "/deviceHistory/" + deviceContainerKey + "/" + String(millis()) + ".json";
    
    // The history payload is the same as the readings payload, but with a timestamp
    readingsDoc["timestamp"] = timestamp; 
    String historyPayload;
    serializeJson(readingsDoc, historyPayload);

    http.begin(historyUrl);
    http.addHeader("Content-Type", "application/json");
    httpCode = http.PUT(historyPayload); // Use PUT to write to the specific path
    if (httpCode == HTTP_CODE_OK) {
        Serial.println("Device history added to Firebase.");
    } else {
        Serial.print("Error adding device history: ");
        Serial.println(httpCode);
        Serial.println(http.getString()); // Print error response
    }
    http.end();
    
    Serial.println("Firebase data update cycle complete.");
}

String getCurrentTimestamp() {
    time_t now;
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("Failed to obtain time from NTP.");
        return "2025-01-01T00:00:00Z";
    }
    char buffer[25];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buffer);
}

void readAndDisplayData() {
    float airTemp = dht.readTemperature();
    float airHum = dht.readHumidity();
    ds18b20.requestTemperatures();
    float soilTemp = ds18b20.getTempCByIndex(0);
    int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
    int soilMoisturePercentage = map(soilMoistureRaw, 0, ADC_MAX_VALUE, 100, 0);
    
    // Pass lastValidWaterDistance and lastValidFertDistance by reference
    int waterDistance = readDistance(TRIG_WATER, ECHO_WATER, lastValidWaterDistance);
    int fertDistance = readDistance(TRIG_FERT, ECHO_FERT, lastValidFertDistance);
    
    int waterLevel = (waterDistance != 999) ? max(0, currentSettings.waterContainerHeight - waterDistance) : max(0, currentSettings.waterContainerHeight - lastValidWaterDistance);
    int fertilizerLevel = (fertDistance != 999) ? max(0, currentSettings.fertilizerContainerHeight - fertDistance) : max(0, currentSettings.fertilizerContainerHeight - lastValidFertDistance);

    waterLow = (waterLevel != -1 && waterLevel <= (currentSettings.waterContainerHeight * currentSettings.waterAlertThreshold / 100.0));
    fertLow = (fertilizerLevel != -1 && fertilizerLevel <= (currentSettings.fertilizerContainerHeight * currentSettings.fertilizerAlertThreshold / 100.0));

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Air:"); lcd.print(airTemp, 1); lcd.print("C Hum:"); lcd.print(airHum, 0); lcd.print("%");
    lcd.setCursor(0, 1);
    lcd.print("Soil:"); lcd.print(soilTemp, 1); lcd.print("C Mst:"); lcd.print(soilMoisturePercentage); lcd.print("%");
    lcd.setCursor(0, 2);
    // Display actual reading if valid, otherwise the last valid one with "ERR" indication
    lcd.print("Water:"); lcd.print(waterDistance != 999 ? String(waterLevel) + "cm" : String(waterLevel) + "cm*"); lcd.print(waterLow ? " LOW" : " OK ");
    lcd.setCursor(0, 3);
    lcd.print("Fert:"); lcd.print(fertDistance != 999 ? String(fertilizerLevel) + "cm" : String(fertilizerLevel) + "cm*"); lcd.print(fertLow ? " LOW" : " OK ");
}

// Modified readDistance function to update last valid reading
int readDistance(int trigPin, int echoPin, int& lastValidReading) {
    const int NUM_READINGS = 5;
    int readings[NUM_READINGS];
    int validReadingsCount = 0;
    int tempReadings[NUM_READINGS]; // Temporary array for sorting

    for (int i = 0; i < NUM_READINGS; i++) {
        digitalWrite(trigPin, LOW);
        delayMicroseconds(2);
        digitalWrite(trigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(trigPin, LOW);
        
        long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
        int distance = duration * 0.034 / 2;

        if (duration > 0 && distance > 0 && distance <= 400) { // Valid reading range (0-400cm)
            readings[validReadingsCount++] = distance;
        }
        delay(5); // Small delay between readings
    }

    if (validReadingsCount > 0) {
        // Copy valid readings to a temporary array for sorting
        for (int i = 0; i < validReadingsCount; i++) {
            tempReadings[i] = readings[i];
        }
        sortArray(tempReadings, validReadingsCount);
        int medianDistance = tempReadings[validReadingsCount / 2];
        lastValidReading = medianDistance; // Update the last valid reading
        return medianDistance;
    } else {
        // All readings were errors, return 999 to indicate error
        // The calling function will then use lastValidReading
        return 999;
    }
}


void sortArray(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}


void activateWaterPump() {
  Serial.println("Activating Water Pump...");
  digitalWrite(RELAY_WATER, LOW); // Turn pump ON (assuming active-low relay)

  // Determine duration: use Firebase setting or a default
  int duration = currentSettings.waterPumpDuration > 0 ?
    currentSettings.waterPumpDuration * 1000 : 3000;

  delay(duration); // Wait for the specified duration
  digitalWrite(RELAY_WATER, HIGH); // Turn pump OFF
  Serial.println("Water Pump Off.");
}

void deactivateWaterPump() {
    Serial.println("Water Pump Off.");
    digitalWrite(RELAY_WATER, HIGH); // Turn off the pump
    waterPumpActiveState = false;
    lcd.clear(); // Clear LCD after pump operation
    lcd.setCursor(0, 0);
    lcd.print("Watering Done!");
    delay(1000); // Display "Done" message briefly
}

void activateFertilizerPump() {
  Serial.println("Activating Fertilizer Pump...");
  digitalWrite(RELAY_FERT, LOW); // Turn pump ON (assuming active-low relay)

  // Determine duration: use Firebase setting or a default
  int duration = currentSettings.fertilizerPumpDuration > 0 ?
    currentSettings.fertilizerPumpDuration * 1000 : 2000;

  delay(duration); // Wait for the specified duration
  digitalWrite(RELAY_FERT, HIGH); // Turn pump OFF
  Serial.println("Fertilizer Pump Off.");
}

void deactivateFertilizerPump() {
    Serial.println("Fertilizer Pump Off.");
    digitalWrite(RELAY_FERT, HIGH); // Turn off the pump
    fertilizerPumpActiveState = false;
    lcd.clear(); // Clear LCD after pump operation
    lcd.setCursor(0, 0);
    lcd.print("Fertilizing Done!");
    delay(1000); // Display "Done" message briefly
}

void sendSMSReport() {
    if (deviceSmsReceiver == "") {
        Serial.println("No SMS receiver configured.");
        return;
    }

    Serial.println("Sending SMS report to: " + deviceSmsReceiver);
    sim800.println("AT+CMGF=1");
    delay(500);
    sim800.print("AT+CMGS=\"");
    sim800.print(deviceSmsReceiver);
    sim800.println("\"");
    delay(500);

    sim800.print("Plant Status for " + DEVICE_ID + ":\n");
    if (waterLow && currentSettings.alertLowWater) {
        sim800.print("-> Water is LOW.\n");
    }
    if (fertLow && currentSettings.alertLowFertilizer) {
        sim800.print("-> Fertilizer is LOW.\n");
    }
    if (!waterLow && !fertLow) {
        sim800.print("All levels are OK.");
    }
    sim800.write(26); // Ctrl+Z to send
    delay(5000);

    Serial.println("SMS Sent.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SMS Alert Sent!");
    delay(2000);
}

void checkAutoSMS() {
    if (millis() - lastAutoSMSSend > autoSMSInterval) {
        lastAutoSMSSend = millis();
        if ((waterLow && currentSettings.alertLowWater) || (fertLow && currentSettings.alertLowFertilizer)) {
            sendSMSReport();
        }
    }
}
