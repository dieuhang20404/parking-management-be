#include <Servo.h>

Servo myServo;

int irPins[5] = {2, 3, 4, 5, 6};

void setup() {
  Serial.begin(115200);
  myServo.attach(9);

  for (int i = 0; i < 5; i++) {
    pinMode(irPins[i], INPUT);
  }
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "STATUS?") {
      sendIRStatus();
    }
    else if (cmd.startsWith("SERVO")) {
      int angle = cmd.substring(6).toInt();
      myServo.write(angle);
      Serial.println("{\"servo\":\"ok\"}");
    }
  }
}

void sendIRStatus() {
  Serial.print("[");

  for (int i = 0; i < 5; i++) {
    Serial.print("{\"position\":");
    Serial.print(i + 1);
    Serial.print(",\"status\":");
    Serial.print(digitalRead(irPins[i]));
    Serial.print("}");

    if (i < 4) Serial.print(",");
  }

  Serial.println("]");
}
