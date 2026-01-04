#include <WiFi.h>
#include "esp_camera.h"
#include "base64.h"

const char* ssid = "Aaaaa";
const char* password = "64400000";

const char* backend_host = "10.138.174.88"; // IP backend
const int backend_port = 4000;

WiFiClient client;

#define RXD2 16
#define TXD2 17

#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);

  setupCamera();
  connectWiFi();
  connectBackend();
}

void loop() {
  if (!client.connected()) {
    connectBackend();
    delay(1000);
    return;
  }

  if (client.available()) {
    String cmd = client.readStringUntil('\n');
    cmd.trim();
    handleCommand(cmd);
  }

  if (Serial2.available()) {
    String sensorData = Serial2.readStringUntil('\n');
    client.println(sensorData);
  }
}

void handleCommand(String cmd) {
  Serial.println("CMD: " + cmd);

  if (cmd == "GET_STATUS") {
    Serial2.println("STATUS?");
  }
  else if (cmd.startsWith("SERVO:")) {
    Serial2.println("SERVO " + cmd.substring(6));
  }
  else if (cmd == "CAPTURE") {
    captureAndSendImage();
  }
}

void captureAndSendImage() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    client.println("IMG:ERROR");
    return;
  }

  String encoded = base64::encode(fb->buf, fb->len);
  client.print("IMG:");
  client.println(encoded);

  esp_camera_fb_return(fb);
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
}

void connectBackend() {
  if (client.connect(backend_host, backend_port)) {
    Serial.println("Connected to backend");
  } else {
    Serial.println("Backend connect failed");
  }
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QQVGA;
  config.jpeg_quality = 35;
  config.fb_count = 1;

  esp_camera_init(&config);
}
