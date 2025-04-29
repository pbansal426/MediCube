
#include <WiFiS3.h>
#include <NTPClient.h>
#include <LiquidCrystal.h>
#include <WiFiUdp.h>
#include <Adafruit_NeoPixel.h>
#include <MFRC522.h>  // Include the RFID library
bool controlling = false;
bool startCyc = false;
int targetHour = 11;  // 3:00 PM
int targetMinute =59;
int targetSecond = 0;
const int joystickX = A5;  // X-axis (left-right) connected to A5
int startIndex = 0;
int adder = 0;
// Define the threshold for joystick movement (400 units from the center)
const int joystickCenter = 512;     // Center value for the joystick
const int movementThreshold = 300;  // Joystick must move 400 units from center to be considered
// ----- Wi-Fi and NTP Settings -----
const char* ssid = "D128guests";      // Wi-Fi network name (passwordless)
const long timeZoneOffset = -18000;  // For example, UTC-5 for Eastern Time

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", timeZoneOffset, 60000);  // Updates every 60 seconds

// ----- LCD Setup (16x2) -----
LiquidCrystal lcd(7, 6, 5, 4, 3, 2);

// ----- Buzzer -----
const int buzzerPin = 8;  // Piezo buzzer on digital pin 8

// ----- LED Pins -----
const int ledPin1 = 15;  // LED 1
const int ledPin2 = 16;  // LED 2
const int ledPin3 = 17;  // LED 3
const int ledPin4 = 18;  // LED 4
int beepFrequencies[] = { 300, 750, 900, 1100 };
// ----- RFID Setup -----
#define SDA_PIN 10
#define RESET_PIN 9
MFRC522 mfrc522(SDA_PIN, RESET_PIN);  // Create an instance of the MFRC522 class

// Store the time of the last action
const long beepDelay = 300;
// ----- Testing Alert Setup -----
// bool testAlertTriggered = false;

// ----- Reminder Dictionary using a Struct -----
struct Reminder {
  String drug;
  String dosage;  // Dosage string (e.g., "10 mg")
};

Reminder reminders[] = {
  { "Ozempic", "500 mg" },  //orange
  { "Advil", "200 mg" },    //green
  { "Tylenol", "10 mg" },   //blue
  { "Lexapro", "500 mg" }   //red
};

const int numReminders = sizeof(reminders) / sizeof(reminders[0]);

// ----- Helper Function: Assign LED for a Given Reminder -----
void assignLED(int index) {
  // Turn off all LEDs first.
  digitalWrite(ledPin1, LOW);
  digitalWrite(ledPin2, LOW);
  digitalWrite(ledPin3, LOW);
  digitalWrite(ledPin4, LOW);

  // Turn on the LED corresponding to the reminder index.
  if (index == 0)
    digitalWrite(ledPin1, HIGH);
  else if (index == 1)
    digitalWrite(ledPin2, HIGH);
  else if (index == 2)
    digitalWrite(ledPin3, HIGH);
  else if (index == 3)
    digitalWrite(ledPin4, HIGH);
}

// ----- Function to Build the Dosage Message for a Single Reminder -----
String buildDosageMessage(const Reminder& r) {
  String dosageClean = r.dosage;
  dosageClean.replace(" ", "");
  return r.drug + ":" + dosageClean;
}

// ----- Function to Display Time on the First Row -----
void displayTime() {
  int currentHour = timeClient.getHours();
  int currentMinute = timeClient.getMinutes();
  int currentSecond = timeClient.getSeconds();

  // Convert to 12-hour format.
  int displayHour = currentHour % 12;
  if (displayHour == 0) displayHour = 12;
  String ampm = (currentHour >= 12) ? "PM" : "AM";

  // Build the time string.
  char timePortion[17];
  sprintf(timePortion, "Time:%02d:%02d:%02d", displayHour, currentMinute, currentSecond);
  String timeStr = String(timePortion);
  while (timeStr.length() < 14) {
    timeStr += " ";
  }
  timeStr += ampm;  // Final string length: 16 characters.

  lcd.setCursor(0, 0);
  lcd.print(timeStr);
}

// ----- Function to Clear the Second Row -----
void clearSecondRow() {
  lcd.setCursor(0, 1);
  for (int i = 0; i < 16; i++) {
    lcd.print(" ");
  }
}

// ----- Function to Sound an Alert -----
void alert() {
  // Turn on all LEDs and sound buzzer.
  digitalWrite(ledPin1, HIGH);
  digitalWrite(ledPin2, HIGH);
  digitalWrite(ledPin3, HIGH);
  digitalWrite(ledPin4, HIGH);

  analogWrite(buzzerPin, 128);  // Set buzzer volume to half (if PWM supported)
  delay(1000);                  // Buzzer on for 1 second

  // Turn off LEDs and buzzer.
  digitalWrite(ledPin1, LOW);
  digitalWrite(ledPin2, LOW);
  digitalWrite(ledPin3, LOW);
  digitalWrite(ledPin4, LOW);
  analogWrite(buzzerPin, 0);
}

// ----- Function to Display a Single Dosage Message on the Second Row -----
void displayDosageMessage(String msg, unsigned long duration) {
  int width = 16;
  unsigned long start = millis();

  // Clear the second row.
  clearSecondRow();

  if (msg.length() <= width) {
    lcd.setCursor(0, 1);
    lcd.print(msg);
    for (int i = msg.length(); i < width; i++) {
      lcd.print(" ");
    }
    while (millis() - start < duration) {
      displayTime();  // Keep updating the time.
      delay(100);
    }
  } else {
    int maxOffset = msg.length() - width;
    int offset = 0;
    bool forward = true;
    while (millis() - start < duration) {
      displayTime();
      lcd.setCursor(0, 1);
      String disp = msg.substring(offset, offset + width);
      lcd.print(disp);
      for (int i = disp.length(); i < width; i++) {
        lcd.print(" ");
      }
      delay(330);

      if (forward) {
        offset++;
        if (offset >= maxOffset) {
          offset = maxOffset;
          forward = false;
        }
      } else {
        offset--;
        if (offset <= 0) {
          offset = 0;
          forward = true;
        }
      }
    }
  }
  clearSecondRow();
}
void putDosageMessage(String msg) {
  int width = 16;
  

  // Clear the second row.
  clearSecondRow();

  if (msg.length() <= width) {
    lcd.setCursor(0, 1);
    lcd.print(msg);
    for (int i = msg.length(); i < width; i++) {
      lcd.print(" ");
    }
    
  } 
  
}

// ----- Function to Cycle Through All Dosage Messages for 2 Minutes -----
// Each dosage message is paired with its assigned LED.
// ----- Function to Cycle Through All Dosage Messages for a Given Duration -----
void cycleDosageMessages() {
  int beepFrequencies[] = { 300, 750, 900, 1100 };
  // Define different beep frequencies for each dosage
  // Hz values for each dosage

  // Iterate through each dosage and show it once
  for (int i = 0; i < numReminders; i++) {
    // Assign LED to match the current dosage
    assignLED(i);

    // Play a small beep with a different frequency for each dosage
    tone(buzzerPin, beepFrequencies[i], 350);  // Play tone for 250 ms

    // Display the dosage message on the LCD
    String msg = buildDosageMessage(reminders[i]);
    displayDosageMessage(msg, 4000);  // Display for 4 seconds

    // Turn off the LED after showing the reminder
    digitalWrite(ledPin1, LOW);
    digitalWrite(ledPin2, LOW);
    digitalWrite(ledPin3, LOW);
    digitalWrite(ledPin4, LOW);

    // Wait before moving to the next dosage (blocking behavior)
    delay(2000);  // This delay ensures that each dosage is shown for 4 seconds
  }
}




// ----- setup() -----
void setup() {
  Serial.begin(115200);  // Initialize serial communication
  lcd.begin(16, 2);      // Initialize a 16x2 LCD.
  lcd.print("Initializing...");

  // Connect to Wi-Fi.
  WiFi.begin(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Initialize NTP Client.
  timeClient.begin();

  // Wait for the time to be updated


  // Set buzzer and LED pins as output
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);
  pinMode(ledPin3, OUTPUT);
  pinMode(ledPin4, OUTPUT);

  // Show a welcome message
  lcd.clear();
  lcd.print("Welcome!");
}
void showDosage(int d) {
  assignLED(d);

  // Play a small beep with a different frequency for each dosage
  tone(buzzerPin, beepFrequencies[d], 350);  // Play tone for 250 ms

  // Display the dosage message on the LCD
  String msg = buildDosageMessage(reminders[d]);
  putDosageMessage(msg);  // Display for 4 seconds

  // Turn off the LED after showing the reminder
  digitalWrite(ledPin1, LOW);
  digitalWrite(ledPin2, LOW);
  digitalWrite(ledPin3, LOW);
  digitalWrite(ledPin4, LOW);
}

// ----- loop() -----
// ----- loop() -----
void loop() {

  int currentHour = timeClient.getHours();       // Get current hour
  int currentMinute = timeClient.getMinutes();   // Get current minute
  int currentSecond = timeClient.getSeconds();   // Get current second

  int xValue = analogRead(joystickX) - 512;  // Get joystick x value (left-right)
  if (xValue < -movementThreshold) {
    if (controlling){
      cycleDosageMessages();
    }
  } 
  else if (xValue > movementThreshold) {
    if (controlling){
       cycleDosageMessages();
    }
  }

  timeClient.update();
  displayTime();  // Always update the time on the first row

  // Optionally, print the current dosage to the LCD
 
  // Do other tasks if necessary
  if (currentHour == targetHour && currentMinute == targetMinute && currentSecond == targetSecond) {
    alert();

    delay(1000);
    cycleDosageMessages();
    controlling=true;

}

}











// void loop() {
//   int xValue = analogRead(joystickX);  // Read X-axis value (left-right)

//   // Clear the LCD for new data
//   lcd.clear();

//   // Check joystick movement
//   if (xValue < joystickCenter - movementThreshold) {
//     // Joystick moved left
//     lcd.setCursor(0, 0);  // Set cursor to first row, first column
//     lcd.print("LEFT");
//   }
//   else if (xValue > joystickCenter + movementThreshold) {
//     // Joystick moved right
//     lcd.setCursor(0, 0);  // Set cursor to first row, first column
//     lcd.print("RIGHT");
//   }
//   else {
//     // Joystick is in center (no movement)
//     lcd.setCursor(0, 0);
//     lcd.print("CENTER");
//   }

//   delay(500);  // Delay for half a second to make the readings readable
// }
